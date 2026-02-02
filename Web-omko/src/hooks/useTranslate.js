import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { translate as baseTranslate } from '@/utils';

/**
 * Custom hook that provides translation function and ensures component re-renders
 * when language changes
 * 
 * Usage:
 *   const t = useTranslate();
 *   <h1>{t('welcomeTitle')}</h1>
 */
export const useTranslate = () => {
  // Subscribe to language code changes
  // This makes the component re-render whenever the language code changes
  const currentLanguageCode = useSelector(
    (state) => state.Language?.currentLanguageCode || 'es'
  );

  // Create a memoized translate function that depends on the language code
  // This ensures the function is recreated whenever the language changes
  const translate = useCallback((label) => {
    const translation = baseTranslate(label);
    return translation;
  }, [currentLanguageCode]);

  return translate;
};

export default useTranslate;
