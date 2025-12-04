import React from 'react'

interface PrivacyModalProps {
    onClose: () => void
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-[slideUp_0.3s_ease-out] dark:bg-gray-800 transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-teal-400 rounded-full flex items-center justify-center text-2xl dark:from-teal-600 dark:to-teal-500">
                        <span>🔒</span>
                    </div>
                    <h2 className="text-gray-800 text-2xl font-bold m-0 dark:text-white">Política de Privacidad</h2>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                    <p className="mb-4 text-gray-800 dark:text-gray-200">
                        <strong>ANMI</strong> respeta tu privacidad y protege tus datos personales.
                    </p>
                    <ul className="list-disc pl-6 my-4 space-y-2">
                        <li>No almacenamos información personal identificable</li>
                        <li>Toda la información proporcionada es confidencial</li>
                        <li>No compartimos tus datos con terceros</li>
                        <li>Las conversaciones son privadas y seguras</li>
                    </ul>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4 dark:bg-amber-900/30 dark:border-amber-600">
                        <p className="text-sm text-gray-800 m-0 dark:text-gray-200">
                            <strong>Recuerda:</strong> Esta información es solo educativa y no constituye consejo médico profesional.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-full bg-linear-to-br from-teal-500 to-teal-400 text-white border-none p-3.5 rounded-xl text-base font-semibold cursor-pointer mt-6 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:from-teal-600 dark:to-teal-500"
                >
                    Entendido
                </button>
            </div>
        </div>
    )
}

export default PrivacyModal
