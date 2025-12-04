import React from 'react'

interface ChatInputProps {
    value: string
    onChange: (value: string) => void
    onSend: () => void
    disabled?: boolean
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled }) => {
    return (
        <div className="border-t border-gray-200 bg-white px-3 py-3 md:px-6 md:py-4 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center gap-2 md:gap-3 bg-teal-50 rounded-3xl px-3 py-1.5 md:px-4 md:py-2 border-2 border-gray-200 transition-colors duration-200 focus-within:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:focus-within:border-teal-400">
                <button className="bg-transparent border-none text-gray-400 cursor-pointer p-2 transition-colors duration-200 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400" title="Adjuntar archivo">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                <input
                    type="text"
                    placeholder="Escribe tu pregunta..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSend()}
                    className="flex-1 bg-transparent border-none outline-none text-gray-800 text-[0.9375rem] py-2 placeholder-gray-400 dark:text-gray-200 dark:placeholder-gray-500"
                />
                <button
                    onClick={onSend}
                    disabled={disabled || !value.trim()}
                    className="bg-linear-to-br from-teal-500 to-teal-400 text-white border-none p-3 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm dark:from-teal-600 dark:to-teal-500"
                    title="Enviar mensaje"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
            <div className="flex items-center gap-2 mt-2 px-2">
                <span className="text-base text-amber-500">⚠️</span>
                <p className="text-xs text-gray-500 m-0 dark:text-gray-400">
                    <strong>Importante:</strong> ANMI no reemplaza la consulta médica profesional
                </p>
            </div>
        </div>
    )
}

export default ChatInput
