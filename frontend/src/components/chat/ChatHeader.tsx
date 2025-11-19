import React from 'react'

interface ChatHeaderProps {
    onOpenPrivacy: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenPrivacy }) => {
    return (
        <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-4 py-3 md:px-6 md:py-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
                <div className="relative">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                        <span className="text-xl md:text-3xl">❤️</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                    <h1 className="text-white text-lg md:text-xl font-bold leading-tight">ANMI</h1>
                    <p className="text-white/90 text-xs md:text-sm">Asistente Nutricional Materno Infantil</p>
                </div>
            </div>
            <button
                onClick={onOpenPrivacy}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200"
                title="Ver política de privacidad"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        </div>
    )
}

export default ChatHeader
