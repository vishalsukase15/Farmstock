import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations.js';

const savedLang = localStorage.getItem('farmstock_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    mr: { translation: translations.mr },
    hi: { translation: translations.hi },
    es: { translation: translations.es },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: 'en' | 'mr' | 'hi' | 'es') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('farmstock_lang', lang);
};

export default i18n;
