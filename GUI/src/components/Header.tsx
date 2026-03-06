import { Upload, PiggyBank } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  onUploadClick: () => void
}

export default function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <PiggyBank size={32} className="logo-icon" />
          <h1>NPU-Piggy</h1>
          <p className="subtitle">AI-powered budget tracking</p>
        </div>
        <button className="upload-btn" onClick={onUploadClick}>
          <Upload size={18} />
          Upload Receipt
        </button>
      </div>
    </header>
  )
}
