"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import DefaultLogo from "@/assets/logo.png";

const normalizeSrc = (v) => (typeof v === "object" ? v?.src : v);

export default function ImageWithPlaceholder({
  src,
  alt = "",
  className = "",
  imageClassName = "",
  blurDataURL,
  loading = "lazy",
}) {
  const webSettings = useSelector((state) => state.WebSetting?.data);
  const fallbackSrc = normalizeSrc(webSettings?.web_placeholder_logo || DefaultLogo);
  const realSrc = normalizeSrc(src);

  const [currentSrc, setCurrentSrc] = useState(blurDataURL || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  // preload real image
  useEffect(() => {
    if (!realSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    const img = new window.Image();
    img.src = realSrc;

    img.onload = () => {
      setCurrentSrc(realSrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
    };
  }, [realSrc, fallbackSrc]);

  const isPlaceholder = currentSrc === fallbackSrc;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        fill    // <== IMPORTANT
        placeholder={blurDataURL ? "blur" : undefined}
        blurDataURL={blurDataURL}
        loading={loading}
        className={`${isPlaceholder ? "opacity-40 object-contain" : ""} ${imageClassName} `}
      />
    </div>
  );
}
