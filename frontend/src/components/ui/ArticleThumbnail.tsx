"use client";

import { useState, useEffect } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80";

type Props = {
  src: string;
  className?: string;
};

export function ArticleThumbnail({ src, className }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt=""
      className={className}
      onError={() => {
        if (failed) return;
        setFailed(true);
        if (currentSrc !== FALLBACK_IMAGE) {
          setCurrentSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}
