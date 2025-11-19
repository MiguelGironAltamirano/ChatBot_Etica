import React from 'react'

interface QuickOptionsProps {
    options: { icon: string; text: string }[]
    onOptionClick: (option: string) => void
}

const QuickOptions: React.FC<QuickOptionsProps> = ({ options, onOptionClick }) => {
    return (
        <div className="px-3 py-2 md:px-6 md:py-3 bg-teal-50 border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onOptionClick(option.text)}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white border-2 border-teal-500 text-gray-800 rounded-full text-xs md:text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap shadow-sm hover:bg-teal-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-inherit">{option.text}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default QuickOptions
