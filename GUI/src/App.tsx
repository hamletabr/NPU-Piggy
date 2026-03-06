import { useState, useEffect } from 'react'
import { TrendingUp, Zap, Wallet, Target } from 'lucide-react'
import type { Transaction } from './components/TransactionHistory'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import SpendingChart from './components/SpendingChart'
import AIAssistant from './components/AIAssistant'
import TransactionHistory from './components/TransactionHistory'
import ReceiptCapture from './components/ReceiptCapture'
import './App.css'

// Sample data with realistic transactions
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    merchant: 'Whole Foods Market',
    date: '2024-02-23',
    amount: 87.45,
    category: 'Groceries',
  },
  {
    id: '2',
    merchant: 'Chipotle',
    date: '2024-02-22',
    amount: 12.50,
    category: 'Dining',
  },
  {
    id: '3',
    merchant: 'CVS Pharmacy',
    date: '2024-02-22',
    amount: 34.20,
    category: 'Health',
  },
  {
    id: '4',
    merchant: 'Uber',
    date: '2024-02-21',
    amount: 23.75,
    category: 'Travel',
  },
  {
    id: '5',
    merchant: 'Target',
    date: '2024-02-21',
    amount: 156.80,
    category: 'Shopping',
  },
  {
    id: '6',
    merchant: 'City Water Authority',
    date: '2024-02-20',
    amount: 89.00,
    category: 'Utilities',
  },
  {
    id: '7',
    merchant: 'Cinema Complex',
    date: '2024-02-19',
    amount: 25.00,
    category: 'Entertainment',
  },
  {
    id: '8',
    merchant: 'Safeway',
    date: '2024-02-18',
    amount: 54.32,
    category: 'Groceries',
  },
]

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Load from localStorage, fallback to sample data
    const saved = localStorage.getItem('piggy_transactions')
    return saved ? JSON.parse(saved) : SAMPLE_TRANSACTIONS
  })
  const [isCaptureOpen, setIsCaptureOpen] = useState(false)

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('piggy_transactions', JSON.stringify(transactions))
  }, [transactions])

  // Calculate summary statistics
  const monthlySpending = transactions.reduce((sum, t) => sum + t.amount, 0)

  const spendingByCategory = transactions.reduce(
    (acc, transaction) => {
      const category = transaction.category
      const existing = acc.find((item) => item.name === category)
      if (existing) {
        existing.value += transaction.amount
      } else {
        acc.push({
          name: category,
          value: transaction.amount,
          color: getCategoryColor(category),
        })
      }
      return acc
    },
    [] as Array<{ name: string; value: number; color: string }>,
  )

  const topCategory = spendingByCategory.reduce((prev, current) =>
    prev.value > current.value ? prev : current,
  )

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const handleUploadReceipt = () => {
    setIsCaptureOpen(true)
  }

  const handleCapture = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('file', blob, 'receipt.jpg')

      const response = await fetch('http://localhost:5000/api/process_receipt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      const data = await response.json()

      // Handle the response and create a new transaction
      if (data.expenses && Array.isArray(data.expenses) && data.expenses.length > 0) {
        const expense = data.expenses[0] // Get the first expense
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          merchant: expense.merchant || expense.store || 'Unknown Merchant',
          date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
          amount: parseFloat(expense.amount) || 0,
          category: normalizeCategoryName(expense.category || 'Other'),
        }

        setTransactions([newTransaction, ...transactions])
        alert('Receipt processed successfully!')
      } else {
        throw new Error('No expenses found in response')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to process receipt: ${errorMessage}`)
      console.error('Receipt processing error:', error)
    }
  }

  const normalizeCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      grocery: 'Groceries',
      groceries: 'Groceries',
      food: 'Dining',
      dining: 'Dining',
      restaurant: 'Dining',
      travel: 'Travel',
      transportation: 'Travel',
      taxi: 'Travel',
      uber: 'Travel',
      health: 'Health',
      medical: 'Health',
      pharmacy: 'Health',
      shopping: 'Shopping',
      retail: 'Shopping',
      utilities: 'Utilities',
      utility: 'Utilities',
      entertainment: 'Entertainment',
      movie: 'Entertainment',
      other: 'Other',
    }
    const normalized = category.toLowerCase()
    return categoryMap[normalized] || 'Other'
  }

  return (
    <div className="app">
      <Header onUploadClick={handleUploadReceipt} />
      <ReceiptCapture
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        onCapture={handleCapture}
      />

      <main className="app-main">
        <div className="container">
          {/* Summary Cards Section */}
          <section className="summary-section">
            <SummaryCard
              title="Monthly Spending"
              value={`$${monthlySpending.toFixed(2)}`}
              icon={<Wallet size={20} />}
              color="#6366f1"
            />
            <SummaryCard
              title="Top Category"
              value={topCategory.name}
              icon={<TrendingUp size={20} />}
              color="#8b5cf6"
            />
            <SummaryCard
              title="Total Transactions"
              value={transactions.length}
              icon={<Zap size={20} />}
              color="#f59e0b"
            />
            <SummaryCard
              title="Avg per Transaction"
              value={`$${(monthlySpending / transactions.length).toFixed(2)}`}
              icon={<Target size={20} />}
              color="#10b981"
            />
          </section>

          {/* Charts and AI Assistant Section */}
          <section className="dashboard-section">
            <div className="chart-container">
              <SpendingChart data={spendingByCategory} />
            </div>
            <div className="assistant-container">
              <AIAssistant />
            </div>
          </section>

          {/* Transaction History Section */}
          <section className="transaction-section">
            <TransactionHistory transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
          </section>
        </div>
      </main>
    </div>
  )
}

function getCategoryColor(category: string): string {
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

export default App
