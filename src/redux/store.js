import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { rootReducer } from "./rootReducer";

const persistConfig = {
  key: "root",
  storage,
  // WebSetting describe lo que el servidor SÍ renderiza (email/tel/socials del
  // header/footer). Si se restaura desde localStorage antes de la hidratación,
  // el primer render del cliente no coincide con el HTML del servidor →
  // hydration mismatch. Se obtiene siempre tras el mount vía layout.jsx.
  blacklist: ["WebSetting"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
export const persistor = persistStore(store);
