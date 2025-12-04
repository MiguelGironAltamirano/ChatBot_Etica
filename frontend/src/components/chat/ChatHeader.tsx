import React from 'react'

interface ChatHeaderProps {
    onOpenSources: () => void;
    onOpenSettings: () => void; 
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenSources, onOpenSettings }) => {
    return (
        // 2. Encabezado con clases de Dark Mode (dark:from-gray-800)
        <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-4 py-3 md:px-6 md:py-5 flex items-center justify-between shadow-md 
            dark:from-gray-800 dark:to-gray-700 transition-colors duration-300"
        >
            <div className="flex items-center gap-3 md:gap-4 flex-1">
                <div className="relative">
                    {/* Icono del corazón: Fondo se adapta al modo oscuro */}
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center shadow-md animate-pulse">
                        <span className="text-xl md:text-3xl">🤱🏼</span>
                    </div>
                    {/* Indicador de estado: Borde se adapta al modo oscuro */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="flex-1">
                    <h1 className="text-white text-lg md:text-xl font-bold leading-tight">ANMI</h1>
                    <p className="text-white/90 text-xs md:text-sm">Asistente Nutricional Materno Infantil</p>
                </div>
            </div>

            {/* Contenedor de Botones (Ajustes y Fuentes) */}
            <div className="flex items-center gap-2">
                
                {/* BOTÓN DE AJUSTES */}
                <button
                    onClick={onOpenSettings}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200"
                    title="Ajustes de la aplicación"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                {/* BOTÓN DE FUENTES/REFERENCIAS */}
                <button
                    onClick={onOpenSources}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200"
                    title="Ver fuentes y referencias"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default ChatHeader