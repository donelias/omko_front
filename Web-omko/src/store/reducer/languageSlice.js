// languageSlice.js

import { createSelector, createSlice } from "@reduxjs/toolkit";
import { store } from "../store";
import { apiCallBegan } from "../actions/apiActions";
import { getLanguages } from "@/utils/api";

const initialState = {
  languages: {},
  loading: false,
  selectedLanguage: 'Spanish',  // Default to Spanish
  currentLanguageCode: 'es',     // Default to Spanish code
};

export const languageSlice = createSlice({
  name: "Language",
  initialState,
  reducers: {
    languagesRequested: (language, action) => {
      language.loading = true;
    },
    languagesSuccess: (language, action) => {
      language.languages = action.payload.data;
      // Also update the current language code from the response
      if (action.payload.data && action.payload.data.code) {
        language.currentLanguageCode = action.payload.data.code;
      }
      language.loading = false;
    },
    languagesFailure: (language, action) => {
      language.loading = false;
    },
    setLanguage: (language, action) => {
      language.selectedLanguage = action.payload;
    },
    setLanguageCode: (language, action) => {
      language.currentLanguageCode = action.payload;
    },
  },
});

export const {
  languagesRequested,
  languagesSuccess,
  languagesFailure,
  setLanguage,
  setLanguageCode,
} = languageSlice.actions;
export default languageSlice.reducer;

// API CALLS

export const languageLoaded = (
  language_code,
  web_language_file,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...getLanguages(language_code, web_language_file),
      displayToast: false,
      onStartDispatch: languagesRequested.type,
      onSuccessDispatch: languagesSuccess.type,
      onErrorDispatch: languagesFailure.type,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// Selectors

export const languageData = createSelector(
  (state) => state.Language,
  (Language) => Language.languages
);
