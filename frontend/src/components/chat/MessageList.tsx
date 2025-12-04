import React, { useEffect, useRef, useCallback } from 'react'
import type { Message } from '../../types/chat'
import MessageBubble from './MessageBubble'

interface MessageListProps {
    messages: Message[]
    isTyping: boolean
    fontSizeStyle: string
    slowResponseMessage?: string | null
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, fontSizeStyle, slowResponseMessage }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true)

    const scrollToBottom = useCallback(() => {
        if (shouldAutoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [shouldAutoScroll])

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
            setShouldAutoScroll(isNearBottom)
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping, slowResponseMessage, scrollToBottom])

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
                        dark:from-teal-600 dark:to-teal-500"
                    >
                        <span>🤖</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {/* Mensaje de espera si hay demora */}
                        {slowResponseMessage && (
                            <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-[18px] rounded-bl-sm shadow-sm
                                dark:bg-amber-900/30 dark:border-amber-700 animate-[fadeIn_0.3s_ease-out]"
                            >
                                <p className="text-sm text-amber-700 dark:text-amber-300 m-0">
                                    {slowResponseMessage}
                                </p>
                            </div>
                        )}
                        {/* Indicador de escribiendo */}
                        <div className="bg-white border border-gray-200 px-4 py-3.5 rounded-[18px] rounded-bl-sm flex gap-1.5 shadow-sm
                            dark:bg-gray-700 dark:border-gray-600"
                        >
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out] dark:bg-gray-300"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out] delay-200 dark:bg-gray-300"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out] delay-400 dark:bg-gray-300"></div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    )
}

export default MessageList
