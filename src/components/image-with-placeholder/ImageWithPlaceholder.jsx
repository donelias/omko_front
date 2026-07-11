"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import DefaultLogo from "@/assets/logo.png";

const normalizeSrc = (v) => (typeof v === "object" ? v?.src : v);

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
  const webSettings = useSelector((state) => state.WebSetting?.data);
  const hardFallbackSrc = normalizeSrc(DefaultLogo);
  const fallbackSrc = normalizeSrc(webSettings?.web_placeholder_logo) || hardFallbackSrc;
  const realSrc = normalizeSrc(src);

  const [currentSrc, setCurrentSrc] = useState(blurDataURL || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  // preload real image
  useEffect(() => {
    const setBestFallback = () => {
      if (!fallbackSrc || fallbackSrc === hardFallbackSrc) {
        setCurrentSrc(hardFallbackSrc);
        setIsLoading(false);
        return;
      }

      const fallbackImg = new window.Image();
      fallbackImg.src = fallbackSrc;
      fallbackImg.onload = () => {
        setCurrentSrc(fallbackSrc);
        setIsLoading(false);
      };
      fallbackImg.onerror = () => {
        setCurrentSrc(hardFallbackSrc);
        setIsLoading(false);
      };
    };

    if (!realSrc) {
      setBestFallback();
      return;
    }

    const img = new window.Image();
    img.src = realSrc;

    img.onload = () => {
      setCurrentSrc(realSrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setBestFallback();
    };
  }, [realSrc, fallbackSrc, hardFallbackSrc]);

  const isPlaceholder = currentSrc === fallbackSrc;

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
      loading={priority ? "eager" : loading}
      priority={priority}
      className={`${isPlaceholder ? "opacity-40 !object-contain" : ""} ${className} `}
    />
  );
}
