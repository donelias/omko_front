import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";

/**
 * Ad banner reutilizable de la página de detalle de propiedad.
 * FASE 3 (T2): unifica la lógica repetida 3 veces en PropertyDetails.jsx
 * (click → abrir enlace externo o navegar a otra propiedad).
 *
 * NOTA: aspectClass debe ser la clase Tailwind COMPLETA (p.ej. "aspect-[1920/350]")
 * para que Tailwind/JIT la detecte en el fuente.
 */
const AdBanner = ({
  banner,
  width,
  height,
  aspectClass,
  imgClassName = "",
  wrapperClassName,
  router,
  lang,
  alt = "Ad Banner",
}) => {
  if (!banner) return null;

  const handleClick = () => {
    if (banner?.external_link_url) {
      window.open(banner?.external_link_url, "_blank");
    } else if (banner?.property?.slug_id) {
      router.push(`/property-details/${banner?.property?.slug_id}/?lang=${lang}`);
    }
  };

  return (
    <div className={wrapperClassName} onClick={handleClick}>
      <ImageWithPlaceholder
        src={banner?.image}
        alt={alt}
        width={width}
        height={height}
        className={`w-full ${aspectClass} object-cover ${imgClassName} ${banner?.external_link_url || banner?.property?.slug_id ? "cursor-pointer" : ""}`}
      />
    </div>
  );
};

export default AdBanner;
