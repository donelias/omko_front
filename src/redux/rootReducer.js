import { combineReducers } from "redux";
import webSettingSlice from "./slices/webSettingSlice";
import languageSlice from "./slices/languageSlice";
import AuthSlice from "./slices/authSlice";
import propertyListFiltersReducer from "./slices/propertyListSlice";
import cacheDataReducer from "./slices/cacheSlice";
import locationReducer from "./slices/locationSlice";
import commissionReducer from "./slices/commissionSlice";
import priceIntelligenceReducer from "./slices/priceIntelligenceSlice";
import crmReducer from "./slices/crmSlice";
import metaIntegrationReducer from "./slices/metaIntegrationSlice";

export const rootReducer = combineReducers({
  WebSetting: webSettingSlice,
  LanguageSettings: languageSlice,
  User: AuthSlice,
  propertyListFilters: propertyListFiltersReducer,
  cacheData: cacheDataReducer,
  location: locationReducer,
  commissions: commissionReducer,
  priceIntelligence: priceIntelligenceReducer,
  crm: crmReducer,
  metaIntegration: metaIntegrationReducer,
});
