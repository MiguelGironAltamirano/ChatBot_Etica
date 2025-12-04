import React, { useState } from 'react' 
import ChatHeader from './chat/ChatHeader'
import PrivacyModal from './chat/PrivacyModal'
import MessageList from './chat/MessageList'
import QuickOptions from './chat/QuickOptions'
import ChatInput from './chat/ChatInput'
import { useChat } from '../hooks/useChat'

interface ChatInterfaceProps {
  fontSizeStyle: string; 
  onOpenSettings: () => void; 
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    fontSizeStyle, 
    onOpenSettings 
}) => {
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

    <div className="min-h-screen bg-teal-50 dark:bg-gray-900 flex items-center justify-center p-0 md:p-6 transition-colors duration-300">
      
      {/* Contenedor del Chat: Se adapta al fondo del chat */}
      <div className="w-full max-w-4xl h-dvh md:h-[90vh] bg-white dark:bg-gray-800 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-300">

        {/* 3. ChatHeader: Le pasamos la función para abrir AJUSTES (además de privacidad) */}
        <ChatHeader 
            onOpenPrivacy={() => setShowPrivacyModal(true)} 
            onOpenSettings={onOpenSettings} // 🚨 NUEVA PROP
        />

        {/* Privacy Notice Banner: Se adapta al modo oscuro */}
        <div className="bg-amber-50 border-l-4 border-l-amber-500 px-4 py-3 flex items-center gap-3 border-b border-b-gray-200
            dark:bg-amber-900/30 dark:border-l-amber-600 dark:border-b-gray-700">
          <span className="text-2xl">🔒</span>
          <p className="text-sm text-gray-800 dark:text-gray-300 flex-1 m-0">
            <strong>Tu privacidad es importante.</strong>{' '}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="bg-transparent border-none text-teal-600 font-semibold underline cursor-pointer p-0 hover:text-teal-700
                dark:text-teal-400 dark:hover:text-teal-300" // Clases de Dark Mode para el link
            >
              Ver política
            </button>
          </p>
        </div>

        {/* 4. MessageList: Le pasamos el tamaño de fuente */}
        <MessageList 
            messages={messages} 
            isTyping={isTyping} 
            fontSizeStyle={fontSizeStyle} // 🚨 NUEVA PROP
        />

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