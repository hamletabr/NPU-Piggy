import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import './SpendingChart.css'

interface SpendingData {
  name: string
  value: number
  color: string
}

interface SpendingChartProps {
  data: SpendingData[]
}

export default function SpendingChart({ data }: SpendingChartProps) {
  return (
    <div className="spending-chart-container">
      <h2 className="chart-title">Spending by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
