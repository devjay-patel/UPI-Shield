import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';

export const translations = { en, hi, gu };

export function getTranslation(lang) {
  return translations[lang] || translations.en;
}
