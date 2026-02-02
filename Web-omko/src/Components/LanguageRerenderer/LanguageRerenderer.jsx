'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * LanguageRerenderer forces the entire component tree beneath it to re-render
 * when the language changes in Redux. This ensures all translate() calls
 * produce the correct output for the new language.
 */
export const LanguageRerenderer = ({ children }) => {
  const currentLanguageCode = useSelector(
    (state) => state.Language?.currentLanguageCode || 'es'
  );
  
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render whenever language code changes
  useEffect(() => {
    // Update the key to force unmount and remount of entire tree
    setRenderKey(prev => prev + 1);
  }, [currentLanguageCode]);

  return (
    <div key={`lang-${currentLanguageCode}-${renderKey}`}>
      {children}
    </div>
  );
};


