'use client';

import { useEffect, useRef, useState } from 'react';
import { HomeHeroPoster } from '@/components/marketing/home-hero-poster';
import {
  HERO_SECTION_POSTER_SRC,
  HERO_SECTION_VIDEO_SRC,
} from '@/lib/marketing/hero-assets';

/**
 * Shows Hero-section.png immediately, then loads and fades in the hero video.
 */
export function HomeHeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoadVideo(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!loadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => setVideoReady(true);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);

    void video.play().catch(() => undefined);

    return () => {
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
    };
  }, [loadVideo]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <HomeHeroPoster
        priority
        className={`transition-opacity duration-700 ease-out ${
          videoReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {loadVideo ? (
        <video
          ref={videoRef}
          className={`pointer-events-none absolute top-1/2 left-1/2 z-0 h-auto min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.02] object-cover object-center transition-opacity duration-700 ease-out ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={HERO_SECTION_POSTER_SRC}
        >
          <source src={HERO_SECTION_VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
