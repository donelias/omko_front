import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rate: 58.5,
  loading: false,
};

export const exchangeRateSlice = createSlice({
  name: "exchangeRate",
  initialState,
  reducers: {
    setExchangeRate: (state, action) => {
      state.rate = action.payload;
      state.loading = false;
    },
    setExchangeRateLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setExchangeRate, setExchangeRateLoading } = exchangeRateSlice.actions;
export default exchangeRateSlice.reducer;
