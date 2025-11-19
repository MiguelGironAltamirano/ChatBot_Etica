import { useState, useRef, useEffect } from 'react'
import './ChatInterface.css'

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickOptions = [
    { icon: '🥬', text: 'Alimentos ricos en hierro' },
    { icon: '👨‍🍳', text: 'Preparación segura' },
    { icon: '👶', text: 'Pautas para bebés' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        isBot: false,
        timestamp: new Date()
      }
      setMessages([...messages, newMessage])
      setInputValue('')
      setIsTyping(true)
      
      setTimeout(() => {
        setIsTyping(false)
        const botResponse: Message = {
          id: messages.length + 2,
          text: 'Gracias por tu consulta. Los alimentos ricos en hierro como las lentejas, espinacas y carnes rojas son excelentes para prevenir la anemia. ¿Te gustaría saber más sobre alguno en específico?',
          isBot: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
      }, 1500)
    }
  }

  const handleQuickOption = (option: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: option,
      isBot: false,
      timestamp: new Date()
    }
    setMessages([...messages, newMessage])
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      const botResponse: Message = {
        id: messages.length + 2,
        text: `Perfecto, te ayudaré con información sobre "${option}". Esta es información educativa y no reemplaza la consulta médica profesional.`,
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    }, 1500)
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-container-new">
        
        {/* Header */}
        <div className="chat-header-new">
          <div className="header-content-new">
            <div className="logo-container-new">
              <div className="logo-new">
                <span className="heart-icon-new">❤️</span>
              </div>
              <div className="status-indicator"></div>
            </div>
            <div className="header-text-new">
              <h1 className="header-title">ANMI</h1>
              <p className="header-subtitle">Asistente Nutricional Materno Infantil</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPrivacyModal(true)}
            className="info-button"
            title="Ver política de privacidad"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="privacy-notice-new">
          <span className="privacy-icon">🔒</span>
          <p className="privacy-text-new">
            <strong>Tu privacidad es importante.</strong>{' '}
            <button 
              onClick={() => setShowPrivacyModal(true)}
              className="privacy-link-new"
            >
              Ver política
            </button>
          </p>
        </div>

        {/* Messages Container */}
        <div className="messages-container-new">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.isBot ? 'bot' : 'user'}`}
            >
              {message.isBot && (
                <div className="bot-avatar-new">
                  <span>🤖</span>
                </div>
              )}
              <div className={`message-bubble-new ${message.isBot ? 'bot' : 'user'}`}>
                <p className="message-text">{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="bot-avatar-new">
                <span>🤖</span>
              </div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Options */}
        <div className="quick-options-container">
          <div className="quick-options-wrapper">
            {quickOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickOption(option.text)}
                className="quick-option-button"
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="input-area-new">
          <div className="input-wrapper-new">
            <button className="attach-button" title="Adjuntar archivo">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="message-input-new"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="send-button-new"
              title="Enviar mensaje"
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="disclaimer-new">
            <span className="warning-icon-new">⚠️</span>
            <p className="disclaimer-text">
              <strong>Importante:</strong> ANMI no reemplaza la consulta médica profesional
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay-new" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-new">
              <div className="modal-icon-new">
                <span>🔒</span>
              </div>
              <h2 className="modal-title">Política de Privacidad</h2>
            </div>
            <div className="modal-body-new">
              <p className="modal-intro">
                <strong>ANMI</strong> respeta tu privacidad y protege tus datos personales.
              </p>
              <ul className="modal-list">
                <li>No almacenamos información personal identificable</li>
                <li>Toda la información proporcionada es confidencial</li>
                <li>No compartimos tus datos con terceros</li>
                <li>Las conversaciones son privadas y seguras</li>
              </ul>
              <div className="modal-warning">
                <p>
                  <strong>Recuerda:</strong> Esta información es solo educativa y no constituye consejo médico profesional.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="modal-close-button"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatInterface