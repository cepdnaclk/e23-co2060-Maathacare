import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import si from './si.json';
import ta from './ta.json';

const resources = {
  en: { translation: en }, // 🟢 MUST BE WRAPPED IN 'translation'
  si: { translation: si }, // 🟢 MUST BE WRAPPED IN 'translation'
  ta: { translation: ta }  // 🟢 MUST BE WRAPPED IN 'translation'
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;