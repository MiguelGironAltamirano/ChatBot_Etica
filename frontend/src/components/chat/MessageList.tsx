import React, { useEffect, useRef } from 'react'
import type { Message } from '../../types/chat'
import MessageBubble from './MessageBubble'

interface MessageListProps {
    messages: Message[]
    isTyping: boolean
    fontSizeStyle: string 
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, fontSizeStyle }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true)

    const scrollToBottom = () => {
        if (shouldAutoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
            setShouldAutoScroll(isNearBottom)
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping, shouldAutoScroll])

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 md:p-6 bg-teal-50 dark:bg-gray-900 flex flex-col gap-3 md:gap-4 transition-colors duration-300"
        >
            {messages.map((message) => (
                <MessageBubble 
                    key={message.id} 
                    message={message} 
                    fontSizeStyle={fontSizeStyle} 
                />
            ))}

            {isTyping && (
                <div className="flex gap-3 animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-teal-400 rounded-full flex items-center justify-center shrink-0 shadow-sm text-xl
                        dark:from-teal-600 dark:to-teal-500" // Adaptar color del ícono del bot
                    >
                        <span>🤖</span>
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-3.5 rounded-[18px] rounded-bl-sm flex gap-1.5 shadow-sm
                        dark:bg-gray-700 dark:border-gray-600" // Adaptar burbuja de "escribiendo"
                    >
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out] dark:bg-gray-300"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out] delay-200 dark:bg-gray-300"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out] delay-400 dark:bg-gray-300"></div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    )
}

export default MessageList
