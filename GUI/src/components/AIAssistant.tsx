import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import './AIAssistant.css'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your budget assistant. I can help you analyze your spending and provide personalized suggestions. What would you like to know about your finances?',
    },
  ])
  const [input, setInput] = useState('')

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
    }

    setMessages([...messages, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMockResponse(input),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 500)

    setInput('')
  }

  const generateMockResponse = (userInput: string): string => {
    const responses = [
      `Based on your spending, I notice you could save more in the "${userInput.toLowerCase()}" category. Consider setting a weekly budget limit.`,
      `Great question! Your top spending category this month is "Dining & Groceries". Try meal planning to reduce these expenses by 15-20%.`,
      `I see you\'ve been consistent with your budget. Keep up the good work! Here are my suggestions: prioritize essential expenses first, then allocate discretionary spending.`,
      `Your "${userInput}" spending has increased by 12% compared to last month. Would you like tips on how to optimize this category?`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div className="ai-title-section">
          <Sparkles size={20} className="ai-icon" />
          <h2>Budget Assistant</h2>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>

      <div className="input-section">
        <input
          type="text"
          placeholder="Ask me about your budget..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="message-input"
        />
        <button onClick={handleSendMessage} className="send-button">
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
