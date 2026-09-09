import { useEffect, useRef } from "react";
import { useTranslation } from "../context/TranslationContext";

/**
 * Visor de recorrido virtual 360° (pannellum).
 * FASE 3 (T2): extraído de PropertyDetails.jsx para separar el efecto
 * de inicialización del visor del JSX. pannellum es una global de runtime
 * (mismo patrón que los demás componentes del proyecto).
 */
const VirtualTour360 = ({ imageURL, title }) => {
  const t = useTranslation();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!imageURL) return;

    const initializePanorama = () => {
      const el = containerRef.current;
      if (!el) {
        console.error("Panorama element not found");
        return;
      }
      pannellum.viewer(el, {
        type: "equirectangular",
        panorama: imageURL,
        autoLoad: true,
      });
    };

    // Pequeño retardo para asegurar que el elemento esté renderizado.
    const timer = setTimeout(initializePanorama, 3000);

    return () => clearTimeout(timer);
  }, [imageURL]);

  if (!imageURL) return null;

  return (
    <div className="cardBg newBorder mb-5 flex flex-col rounded-2xl">
      <div className="blackTextColor border-b p-5 text-base font-bold md:text-xl">
        {title || t("virtualTour")}
      </div>
      <div className="flex h-[500px] justify-center rounded p-5">
        <div ref={containerRef} id="panorama"></div>
      </div>
    </div>
  );
};

export default VirtualTour360;
