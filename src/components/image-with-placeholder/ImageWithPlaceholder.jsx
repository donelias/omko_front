import Image from "next/image";

export default function ImageWithPlaceholder({
  src,
  alt = "",
  height = 0,
  width = 0,
  className = "",
  priority = false,
  blurDataURL,
  loading = "lazy",
}) {
  function buildImageUrl(src) {
    if (!src) return '/default-profile.png';
    if (typeof src === 'string' && src.startsWith('http')) return src;
    if (typeof src === 'string' && src.startsWith('/storage')) return `https://omko.do${src}`;
    return '/default-profile.png';
  }

  const imageUrl = buildImageUrl(src);

  return (
    <Image
      src={imageUrl}
      alt={alt || 'Foto de perfil'}
      width={width || 120}
      height={height || 120}
      onError={(e) => {
        e.target.src = '/default-profile.png';
      }}
      className={className}
      loading={priority ? "eager" : loading}
      priority={priority}
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
    />
  );
}
