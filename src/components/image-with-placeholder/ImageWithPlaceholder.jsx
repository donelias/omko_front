"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import DefaultLogo from "@/assets/logo.png";

const normalizeSrc = (v) => (typeof v === "object" ? v?.src : v);

export default function ImageWithPlaceholder({
  src,
  alt = "",
  height = 0,
  width = 0,
  fill = false,
  className = "",
  priority = false,
  blurDataURL,
  loading = "lazy",
  sizes,
}) {
  const webSettings = useSelector((state) => state.WebSetting?.data);
  const fallbackSrc = normalizeSrc(webSettings?.web_placeholder_logo || DefaultLogo);
  const realSrc = normalizeSrc(src);

  return (
    <Image
      src={realSrc || fallbackSrc}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
      loading={priority ? "eager" : loading}
      priority={priority}
      quality={90}
      sizes={sizes || "100vw"}
      className={`${realSrc ? "" : "opacity-40 !object-contain"} ${className}`}
    />
  );
}