import { useState, useEffect, useCallback } from 'react';

interface SettingsState {
  isDarkMode: boolean;
  fontSize: number; 
}

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 18;

const useSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const storedTheme = localStorage.getItem('isDarkMode');
      const storedFontSize = localStorage.getItem('fontSize');

      const isDarkMode = storedTheme ? JSON.parse(storedTheme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const fontSize = storedFontSize ? parseInt(storedFontSize) : DEFAULT_FONT_SIZE;

      return { isDarkMode, fontSize };
    } catch (error) {
      console.error("Error al cargar ajustes de localStorage:", error);
      return { isDarkMode: false, fontSize: DEFAULT_FONT_SIZE };
    }
  });

  useEffect(() => {
    const body = document.body;
    
    if (settings.isDarkMode) {
      body.classList.add('dark');
      localStorage.setItem('isDarkMode', 'true');
    } else {
      body.classList.remove('dark');
      localStorage.setItem('isDarkMode', 'false');
    }
    
    localStorage.setItem('fontSize', settings.fontSize.toString());
    
  }, [settings]);

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({ 
      ...prev, 
      isDarkMode: !prev.isDarkMode 
    }));
  }, []);

  const setFontSize = useCallback((newSize: number) => {
    const clampedSize = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
    setSettings(prev => ({ 
      ...prev, 
      fontSize: clampedSize 
    }));
  }, []);

  const getFontSizeStyle = useCallback(() => {
    return `${settings.fontSize}px`;
  }, [settings.fontSize]);

  return { settings, toggleDarkMode, setFontSize, getFontSizeStyle, MIN_FONT_SIZE, MAX_FONT_SIZE };
};

export default useSettings;