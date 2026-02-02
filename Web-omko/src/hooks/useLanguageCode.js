import { useSelector } from 'react-redux';

export const useLanguageCode = () => {
  const currentLanguageCode = useSelector(
    (state) => state.Language.currentLanguageCode
  );
  
  return currentLanguageCode;
};
