"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import { useEffect, useState } from "react";

const defaultFallback = "/uploads/chatgpt-image-28-mai-2026-08-26-27-1779953689488.png";

export function SafeImage({ src, alt, onError, fallbackSrc = defaultFallback, ...props }: ImageProps & { fallbackSrc?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={failed ? fallbackSrc : src}
      alt={alt}
      onError={(event) => {
        if (!failed) setFailed(true);
        onError?.(event);
      }}
    />
  );
}
