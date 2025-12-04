import React from 'react';

interface Source {
  title: string;
  description: string;
  filename: string;
  icon: string;
}

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCES: Source[] = [
  {
    title: "Guías Alimentarias para Niñas y Niños Menores de 2 Años",
    description: "Recomendaciones oficiales del MINSA para la alimentación complementaria.",
    filename: "Guías alimentarias para niñas y niños menores de 2 años de edad.pdf",
    icon: "👶"
  },
  {
    title: "Norma Técnica: Manejo de la Anemia",
    description: "Manejo terapéutico y preventivo de la anemia en niños, adolescentes, gestantes y puérperas.",
    filename: "Norma_técnica___Manejo_terapéutico_y_preventivo_de_la_anemia_en_niños__adolescentes__mujeres_gestantes_y_puérperas.pdf",
    icon: "📋"
  },
  {
    title: "Guía para Gestantes y Puérperas",
    description: "Orientaciones nutricionales para mujeres embarazadas y en período de lactancia.",
    filename: "GuiaGestanteyPuerpera.pdf",
    icon: "🤰"
  },
  {
    title: "Guías Alimentarias para la Población Peruana",
    description: "Recomendaciones generales de alimentación saludable para toda la familia.",
    filename: "Guías_alimentarias para la poblacion peruana.pdf",
    icon: "🇵🇪"
  },
  {
    title: "Recetario Nutritivo",
    description: "Recetas prácticas ricas en hierro para prevenir la anemia.",
    filename: "Recetario.pdf",
    icon: "🍲"
  },
  {
    title: "Informe: La Anemia Infantil en el Perú",
    description: "Análisis y estadísticas sobre la situación de la anemia infantil.",
    filename: "INFORME-DEL-SEMINARIO-LA-ANEMIA-INFANTIL-EN-EL-PERU.pdf",
    icon: "📊"
  },
  {
    title: "Resolución Ministerial - Medidas",
    description: "Marco normativo y medidas oficiales contra la anemia.",
    filename: "resolucion-ministerial-medidas.pdf",
    icon: "⚖️"
  }
];

const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = (filename: string) => {
    window.open(`/docs/${encodeURIComponent(filename)}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 p-0 md:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-xl shadow-2xl w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-500 to-teal-400 dark:from-gray-700 dark:to-gray-600">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-2xl">📚</span>
            <h2 className="text-lg md:text-xl font-bold text-white">Fuentes y Referencias</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 rounded-full transition-colors hover:bg-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Intro */}
        <div className="px-4 md:px-5 py-3 md:py-4 bg-teal-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 m-0">
            La información de ANMI está basada en documentos oficiales del 
            <strong> MINSA</strong> y otras fuentes confiables.
          </p>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          <div className="grid gap-2 md:gap-3">
            {SOURCES.map((source, index) => (
              <button 
                key={index}
                onClick={() => handleDownload(source.filename)}
                className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-left w-full active:scale-[0.98]"
              >
                <span className="text-2xl md:text-3xl flex-shrink-0">{source.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base mb-0.5 line-clamp-2">
                    {source.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0 line-clamp-1 hidden md:block">
                    {source.description}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-teal-500 text-white rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 m-0 text-center">
            ⚠️ Información educativa. No reemplaza la consulta médica.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SourcesModal;
