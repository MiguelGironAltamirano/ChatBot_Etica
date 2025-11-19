import { useState, useRef } from 'react'
import { endpoints } from '../services/api'
import type { Message } from '../types/chat'
import ChatHeader from './chat/ChatHeader'
import PrivacyModal from './chat/PrivacyModal'
import MessageList from './chat/MessageList'
import QuickOptions from './chat/QuickOptions'
import ChatInput from './chat/ChatInput'

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! Soy ANMI, tu asistente nutricional. Te ayudaré con información sobre nutrición para prevenir la anemia infantil, siempre cuidando tu privacidad. 💚',
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  // Generate a random thread ID for the session
  const threadIdRef = useRef(crypto.randomUUID())

  const quickOptions = [
    { icon: '🥬', text: 'Alimentos ricos en hierro' },
    { icon: '👨‍🍳', text: 'Preparación segura' },
    { icon: '👶', text: 'Pautas para bebés' }
  ]

  const sendMessageToApi = async (text: string) => {
    setIsTyping(true)
    try {
      const response = await fetch(endpoints.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          thread_id: threadIdRef.current
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la comunicación con el servidor')
      }

      const data = await response.json()

      const botResponse: Message = {
        id: Date.now(), // Use timestamp as ID for uniqueness
        text: data.reply,
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error:', error)
      const errorResponse: Message = {
        id: Date.now(),
        text: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputValue,
        isBot: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      const textToSend = inputValue
      setInputValue('')
      sendMessageToApi(textToSend)
    }
  }

  const handleQuickOption = (option: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text: option,
      isBot: false,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    sendMessageToApi(option)
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-4xl h-[100dvh] md:h-[90vh] bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        <ChatHeader onOpenPrivacy={() => setShowPrivacyModal(true)} />

        {/* Privacy Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
          <span className="text-2xl">🔒</span>
          <p className="text-sm text-gray-800 flex-1 m-0">
            <strong>Tu privacidad es importante.</strong>{' '}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="bg-transparent border-none text-teal-600 font-semibold underline cursor-pointer p-0 hover:text-teal-700"
            >
              Ver política
            </button>
          </p>
        </div>

        <MessageList messages={messages} isTyping={isTyping} />

        <QuickOptions options={quickOptions} onOptionClick={handleQuickOption} />

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isTyping}
        />
      </div>

      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </div>
  )
}

export default ChatInterface