import React, { useState } from 'react'; 
import ChatInterface from './components/ChatInterface';
import useSettings from './hooks/useSettings'; 
import SettingsModal from './components/chat/SettingsModal'; 

function App() {
  const { 
    settings, 
    toggleDarkMode, 
    setFontSize, 
    getFontSizeStyle, 
    MIN_FONT_SIZE, 
    MAX_FONT_SIZE 
  } = useSettings();
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); 

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <ChatInterface 
        fontSizeStyle={getFontSizeStyle()} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      /> 

      {/* 5. Renderizar el Modal de Ajustes */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={settings.isDarkMode}
        toggleDarkMode={toggleDarkMode}
        fontSize={settings.fontSize}
        setFontSize={setFontSize}
        minFontSize={MIN_FONT_SIZE}
        maxFontSize={MAX_FONT_SIZE}
      />
    </div>
  );
}

export default App;