import { useEffect, useRef, useState } from 'react'
import { X, Camera } from 'lucide-react'
import './ReceiptCapture.css'

interface ReceiptCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (blob: Blob) => void
}

interface EdgeDetectionResult {
  isReceiptDetected: boolean
  confidence: number
}

export default function ReceiptCapture({ isOpen, onClose, onCapture }: ReceiptCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const processCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState('Initializing camera...')
  const streamRef = useRef<MediaStream | null>(null)
  const frameProcessingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const captureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCaptureRef = useRef<number>(0)

  const sobelEdgeDetection = (imageData: ImageData): Uint8ClampedArray => {
    const { data, width, height } = imageData
    const edges = new Uint8ClampedArray(data.length)
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
            const kernelIdx = (dy + 1) * 3 + (dx + 1)
            gx += gray * sobelX[kernelIdx]
            gy += gray * sobelY[kernelIdx]
          }
        }
        const magnitude = Math.sqrt(gx * gx + gy * gy)
        const edgeIdx = (y * width + x) * 4
        const edgeValue = Math.min(255, magnitude)
        edges[edgeIdx] = edgeValue
        edges[edgeIdx + 1] = edgeValue
        edges[edgeIdx + 2] = edgeValue
        edges[edgeIdx + 3] = 255
      }
    }
    return edges
  }

  const detectRectangularShape = (
    edges: Uint8ClampedArray,
    width: number,
    height: number,
  ): EdgeDetectionResult => {
    const threshold = 80
    const edgePoints: Array<[number, number]> = []

    for (let i = 0; i < edges.length; i += 4) {
      if (edges[i] > threshold) {
        const pixelIdx = i / 4
        const x = pixelIdx % width
        const y = Math.floor(pixelIdx / width)
        edgePoints.push([x, y])
      }
    }

    if (edgePoints.length < 100) {
      return { isReceiptDetected: false, confidence: 0 }
    }

    let minX = width,
      maxX = 0,
      minY = height,
      maxY = 0
    edgePoints.forEach(([x, y]) => {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    })

    const boxWidth = maxX - minX
    const boxHeight = maxY - minY
    const isVertical = boxHeight > boxWidth * 1.3
    const frameArea = width * height
    const boxArea = boxWidth * boxHeight
    const occupancyRatio = boxArea / frameArea
    const isReasonableSize = occupancyRatio > 0.15 && occupancyRatio < 0.85

    let edgeCount = 0
    const marginPercent = 0.05
    edgePoints.forEach(([x, y]) => {
      const nearEdge =
        Math.abs(x - minX) < boxWidth * marginPercent ||
        Math.abs(x - maxX) < boxWidth * marginPercent ||
        Math.abs(y - minY) < boxHeight * marginPercent ||
        Math.abs(y - maxY) < boxHeight * marginPercent
      if (nearEdge) edgeCount++
    })

    const edgeRatio = edgeCount / edgePoints.length
    const hasGoodEdges = edgeRatio > 0.3

    let confidence = 0
    if (isVertical) confidence += 40
    if (isReasonableSize) confidence += 30
    if (hasGoodEdges) confidence += 30

    const isDetected = isVertical && isReasonableSize && hasGoodEdges
    return { isReceiptDetected: isDetected, confidence }
  }

  const processFrame = () => {
    if (!videoRef.current || !processCanvasRef.current || isCapturing) return
    const canvas = processCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 320
    canvas.height = 240
    ctx.drawImage(videoRef.current, 0, 0, 320, 240)

    const imageData = ctx.getImageData(0, 0, 320, 240)
    const edges = sobelEdgeDetection(imageData)
    const result = detectRectangularShape(edges, 320, 240)

    if (result.isReceiptDetected) {
      setDetectionStatus(`Receipt detected! Confidence: ${Math.round(result.confidence)}%`)
      const now = Date.now()
      if (now - lastCaptureRef.current > 500) {
        lastCaptureRef.current = now
        captureTimeoutRef.current = setTimeout(() => {
          captureImage()
        }, 300)
      }
    } else {
      setDetectionStatus(`Align vertical receipt... (${Math.round(result.confidence)}% match)`)
    }
  }

  const startEdgeDetection = () => {
    frameProcessingRef.current = setInterval(processFrame, 100)
  }

  const stopEdgeDetection = () => {
    if (frameProcessingRef.current) clearInterval(frameProcessingRef.current)
  }

  useEffect(() => {
    if (!isOpen) {
      stopEdgeDetection()
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
      if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current)
      setIsCameraReady(false)
      return
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setIsCameraReady(true)
            setDetectionStatus('Align receipt vertically...')
            startEdgeDetection()
          }
        }
      } catch (error) {
        alert('Unable to access camera.')
        onClose()
      }
    }

    startCamera()
    return () => {
      stopEdgeDetection()
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
      if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current)
    }
  }, [isOpen, onClose])

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return
    setIsCapturing(true)
    stopEdgeDetection()

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob)
          setIsCapturing(false)
          handleClose()
        }
      },
      'image/jpeg',
      0.95,
    )
  }

  const handleClose = () => {
    stopEdgeDetection()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current)
    setIsCameraReady(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="receipt-capture-overlay">
      <div className="receipt-capture-modal">
        <div className="capture-header">
          <h2>Capture Receipt</h2>
          <button className="close-button" onClick={handleClose} disabled={isCapturing}>
            <X size={24} />
          </button>
        </div>
        <div className="capture-container">
          <video ref={videoRef} className="capture-video" playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <canvas ref={processCanvasRef} style={{ display: 'none' }} />

          {!isCameraReady && (
            <div className="capture-loading">
              <div className="spinner"></div>
              <p>Initializing camera...</p>
            </div>
          )}

          {isCameraReady && !isCapturing && (
            <div className="capture-frame">
              <div className="frame-corner frame-top-left" />
              <div className="frame-corner frame-top-right" />
              <div className="frame-corner frame-bottom-left" />
              <div className="frame-corner frame-bottom-right" />
            </div>
          )}

          {isCapturing && (
            <div className="capture-processing">
              <div className="spinner"></div>
              <p>Processing receipt...</p>
            </div>
          )}
        </div>

        <div className="capture-info">
          {isCameraReady && !isCapturing && (
            <p>
              <Camera size={16} /> {detectionStatus}
            </p>
          )}
          {isCapturing && <p>Sending to server...</p>}
        </div>

        {isCameraReady && !isCapturing && (
          <button className="manual-capture-btn" onClick={captureImage}>
            Capture Now
          </button>
        )}
      </div>
    </div>
  )
}
