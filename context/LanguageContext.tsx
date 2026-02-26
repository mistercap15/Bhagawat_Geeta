import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const STORAGE_KEY = 'user-selected-language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'hi' || saved === 'en') {
          setLanguageState(saved as Language);
        }
      } catch (e) {
        console.warn('Failed to load language', e);
      } finally {
        setLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to save language', e);
    }
    setLanguageState(lang);
  };

  if (loading) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
