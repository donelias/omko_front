import { store } from "@/redux/store";

const getStoreRate = () => {
  const state = store.getState();
  const storedRate = state?.exchangeRate?.rate;
  return Number(storedRate) > 0 ? Number(storedRate) : 58.5;
};

export const getDualPriceDisplay = (price, currency, exchangeRate) => {
  const originalPrice = Number(price || 0);
  if (!originalPrice) {
    return { mainPriceString: "", convertedPriceString: "" };
  }

  const normalizedCurrency = String(currency || "USD").toUpperCase().trim();
  const rate = Number(exchangeRate) > 0 ? Number(exchangeRate) : getStoreRate();

  const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const dopFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (normalizedCurrency === "DOP" || normalizedCurrency === "RD$") {
    return {
      mainPriceString: dopFormatter.format(originalPrice).replace("DOP", "RD$"),
      convertedPriceString: `≈ ${usdFormatter.format(originalPrice / rate)}`,
    };
  }

  return {
    mainPriceString: usdFormatter.format(originalPrice),
    convertedPriceString: `≈ ${dopFormatter.format(originalPrice * rate).replace("DOP", "RD$")}`,
  };
};
