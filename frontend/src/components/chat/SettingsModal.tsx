import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  minFontSize: number;
  maxFontSize: number;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    isDarkMode, 
    toggleDarkMode, 
    fontSize, 
    setFontSize,
    minFontSize,
    maxFontSize
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full transition-colors">
            {/* Icono X */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 1. Ajuste del Modo Oscuro */}
        <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
          <label htmlFor="dark-mode-toggle" className="text-gray-700 dark:text-gray-300 text-base font-medium">
            Modo Oscuro
          </label>
          {/* Toggle Switch Simple (puedes usar un componente más avanzado si lo deseas) */}
          <button 
            onClick={toggleDarkMode}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 ${isDarkMode ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span 
              aria-hidden="true" 
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* 2. Ajuste de Tamaño de Fuente */}
        <div className="pt-2">
          <label htmlFor="font-size-slider" className="text-gray-700 dark:text-gray-300 text-base font-medium mb-2 block">
            Tamaño del Texto ({fontSize}px)
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">A</span>
            <input
              id="font-size-slider"
              type="range"
              min={minFontSize}
              max={maxFontSize}
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 accent-teal-500"
            />
            <span className="text-xl text-gray-500 dark:text-gray-400">A</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;