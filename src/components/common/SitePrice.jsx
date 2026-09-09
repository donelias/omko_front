"use client";

import { useSyncExternalStore } from "react";
import { formatDualPrice } from "@/lib/priceIntelligenceUtils";
import { useExchangeRates } from "@/lib/useExchangeRates";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

// false durante SSR/hidratación, true tras montar: evita mismatch de
// hidratación con contenido client-only (equivalente con tasa del día).
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

// Precio principal + equivalente (RD$ <-> US$) según la moneda registrada de
// la propiedad y la tasa "del día vigente". Uso en tarjetas y detalle.
// Ambos en formato completo (sin abreviar), p. ej. US$140,000 y ≈ RD$8,225,000.
// El principal se renderiza con formato determinista (SSR + hidratación
// segura); el equivalente depende de la tasa (client-only) y solo se pinta
// tras el montaje.
const SitePrice = ({
  value,
  currency = "DOP",
  className,
  valueClassName,
  equivalentClassName,
  showEquivalent = true,
}) => {
  const rates = useExchangeRates();
  const mounted = useMounted();

  const data = formatDualPrice(value, currency, rates);

  if (!data?.primary) {
    return <span className={className} />;
  }

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className={valueClassName}>{data.primary}</span>
      {showEquivalent && mounted && data.secondary && (
        <span
          className={cn(
            "text-[11px] font-medium text-gray-400",
            equivalentClassName
          )}
        >
          {data.secondary}
        </span>
      )}
    </span>
  );
};

export default SitePrice;