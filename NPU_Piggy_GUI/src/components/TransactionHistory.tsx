import { Trash2 } from 'lucide-react'
import './TransactionHistory.css'

export interface Transaction {
  id: string
  merchant: string
  date: string
  amount: number
  category: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  onDeleteTransaction?: (id: string) => void
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    groceries: '#10b981',
    dining: '#f59e0b',
    travel: '#3b82f6',
    health: '#ec4899',
    shopping: '#8b5cf6',
    utilities: '#6366f1',
    entertainment: '#f97316',
    other: '#6b7280',
  }
  return colors[category.toLowerCase()] || colors.other
}

export default function TransactionHistory({ transactions, onDeleteTransaction }: TransactionHistoryProps) {
  return (
    <div className="transaction-history">
      <h2 className="history-title">Transaction History</h2>
      <div className="table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-message">
                  No transactions yet. Start by uploading a receipt!
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="merchant-cell">{transaction.merchant}</td>
                  <td>{transaction.date}</td>
                  <td className="amount-cell">${transaction.amount.toFixed(2)}</td>
                  <td>
                    <span
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    >
                      {transaction.category}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => onDeleteTransaction?.(transaction.id)}
                      title="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
