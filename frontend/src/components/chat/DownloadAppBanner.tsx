import { useState, useEffect } from 'react';

const DownloadAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si está en móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Verificar si ya está instalada como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    
    // Verificar si el usuario ya descartó el banner
    const wasDismissed = localStorage.getItem('downloadBannerDismissed') === 'true';
    
    // Mostrar solo si es móvil, no está instalada y no fue descartada
    if (isMobile && !isStandalone && !wasDismissed) {
      // Pequeño delay para mejor UX
      setTimeout(() => setShowBanner(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem('downloadBannerDismissed', 'true');
  };

  const handleDownload = () => {
    // URL del APK en GitHub Releases (actualizar con tu URL real)
    const downloadUrl = 'https://github.com/MiguelGironAltamirano/ChatBot_Etica/releases/latest/download/app-debug.apk';
    window.open(downloadUrl, '_blank');
    
    // Marcar como descartado después de hacer clic
    setTimeout(() => {
      setDismissed(true);
      setShowBanner(false);
    }, 500);
  };

  if (!showBanner || dismissed) return null;

  return (
    <>
      {/* Overlay sutil */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleDismiss}
      />
      
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="mx-4 mb-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-2xl overflow-hidden">
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          <div className="relative px-5 py-6">
            {/* Botón cerrar */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenido */}
            <div className="flex items-start gap-4 mb-4">
              {/* Icono */}
              <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Texto */}
              <div className="flex-1 pt-1">
                <h3 className="text-white font-bold text-lg mb-1">
                  ¡Descarga la App! 📱
                </h3>
                <p className="text-teal-50 text-sm leading-relaxed">
                  Accede más rápido y recibe notificaciones.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-white text-teal-600 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar APK
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-3 text-white font-medium rounded-xl hover:bg-white/10 active:scale-98 transition-all"
              >
                Ahora no
              </button>
            </div>

            {/* Nota pequeña */}
            <p className="text-teal-50/70 text-xs mt-3 text-center">
              Compatible con Android 7.0+
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(100%);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
        
        .active\\:scale-95:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
};

export default DownloadAppBanner;
