"use client";

import { useSyncExternalStore } from "react";
import { formatDualPrice } from "@/lib/priceIntelligenceUtils";
import { useExchangeRates } from "@/lib/useExchangeRates";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

// Muestra un precio en la moneda registrada de la propiedad más su
// equivalente (RD$ <-> US$) según la tasa vigente, siguiendo la convención OMKO.
const PriceDual = ({
  value,
  currency = "DOP",
  className,
  valueClassName,
  secondaryClassName,
  showSecondary = true,
}) => {
  const rates = useExchangeRates();
  const mounted = useMounted();

  const { primary, secondary } = formatDualPrice(value, currency, rates);

  return (
    <span className={cn("flex flex-col", className)}>
      <span className={valueClassName}>{primary}</span>
      {showSecondary && mounted && secondary && (
        <span
          className={cn(
            "text-[10px] font-medium text-gray-400",
            secondaryClassName
          )}
        >
          {secondary}
        </span>
      )}
    </span>
  );
};

export default PriceDual;