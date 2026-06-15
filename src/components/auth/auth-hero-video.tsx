'use client';

import { useEffect, useRef } from 'react';

const AUTH_HERO_VIDEO_SRC = '/images/moving.mp4';

export function AuthHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => undefined);
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    >
      <source src={AUTH_HERO_VIDEO_SRC} type="video/mp4" />
    </video>
  );
}
