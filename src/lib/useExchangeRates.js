"use client";

import { useEffect, useState } from "react";
import { getPriceExchangeRatesApi } from "@/api/apiRoutes";
import {
  getExchangeRates,
  setExchangeRates,
} from "@/lib/priceIntelligenceUtils";

// Fetch único por sesión/página: todos los componentes comparten la misma
// promesa y la misma tasa "del día vigente" del backend (ExchangeRateService).
let ratesPromise = null;

const ensureExchangeRates = () => {
  if (!ratesPromise) {
    ratesPromise = getPriceExchangeRatesApi()
      .then((res) => {
        if (res?.data?.rates) {
          setExchangeRates(res.data.rates);
          return res.data.rates;
        }
        return getExchangeRates();
      })
      .catch(() => getExchangeRates());
  }
  return ratesPromise;
};

// Devuelve las tasas vigentes (null hasta que se resuelven).
export const useExchangeRates = () => {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    let active = true;
    ensureExchangeRates().then((resolved) => {
      if (active) {
        setRates(resolved);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return rates;
};