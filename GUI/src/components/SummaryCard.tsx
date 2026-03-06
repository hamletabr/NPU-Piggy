import type { ReactNode } from 'react'
import './SummaryCard.css'

interface SummaryCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: string
}

export default function SummaryCard({ title, value, icon, color = '#6366f1' }: SummaryCardProps) {
  return (
    <div className="summary-card" style={{ borderLeftColor: color }}>
      <div className="summary-header">
        <span className="summary-title">{title}</span>
        {icon && <span className="summary-icon">{icon}</span>}
      </div>
      <div className="summary-value">{value}</div>
    </div>
  )
}
