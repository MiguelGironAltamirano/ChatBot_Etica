import { useState } from 'react'
import ChatHeader from './chat/ChatHeader'
import PrivacyModal from './chat/PrivacyModal'
import MessageList from './chat/MessageList'
import QuickOptions from './chat/QuickOptions'
import ChatInput from './chat/ChatInput'
import { useChat } from '../hooks/useChat'

const ChatInterface = () => {
  const {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    handleSendMessage,
    handleQuickOption
  } = useChat()

  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const quickOptions = [
    { icon: '🥬', text: 'Alimentos ricos en hierro' },
    { icon: '👨‍🍳', text: 'Preparación segura' },
    { icon: '👶', text: 'Pautas para bebés' }
  ]

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