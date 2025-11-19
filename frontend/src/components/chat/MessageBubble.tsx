import React from 'react'
import type { Message } from '../../types/chat'

interface MessageBubbleProps {
    message: Message
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    return (
        <div
            className={`flex gap-3 animate-[fadeIn_0.3s_ease-out] ${message.isBot ? '' : 'justify-end'}`}
        >
            {message.isBot && (
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-xl">
                    <span>🤖</span>
                </div>
            )}
            <div className={`max-w-[90%] md:max-w-[70%] px-3 py-2.5 md:px-4 md:py-3.5 rounded-[18px] shadow-sm ${message.isBot
                ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                : 'bg-gradient-to-br from-teal-500 to-teal-400 text-white rounded-br-sm'
                }`}>
                <p className="text-[0.9375rem] leading-relaxed m-0 mb-1">{message.text}</p>
                <span className="text-xs opacity-70 block">
                    {message.timestamp.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    )
}

export default MessageBubble
