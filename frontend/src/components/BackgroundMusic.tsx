/**
 * Background Music Player Component
 * 
 * HTML5 audio player for background music with fade in/out
 */

import React, { useRef, useEffect, useState } from 'react';

/**
 * Background Music Props
 */
interface BackgroundMusicProps {
  soundEnabled: boolean;
  autoPlay?: boolean;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

/**
 * Background Music Component
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  soundEnabled,
  autoPlay = true,
  fadeInDuration = 2000,
  fadeOutDuration = 1000
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout>();
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Fade in audio
   */
  const fadeIn = () => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startVolume = 0;
    const endVolume = 0.3; // 30% volume
    const steps = 50;
    const stepDuration = fadeInDuration / steps;
    const volumeStep = (endVolume - startVolume) / steps;

    let currentStep = 0;
    audio.volume = startVolume;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(endVolume, startVolume + volumeStep * currentStep);

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
    }, stepDuration);
  };

  /**
   * Fade out audio
   */
  const fadeOut = () => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const endVolume = 0;
    const steps = 30;
    const stepDuration = fadeOutDuration / steps;
    const volumeStep = (startVolume - endVolume) / steps;

    let currentStep = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(endVolume, startVolume - volumeStep * currentStep);

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        audio.pause();
        setIsPlaying(false);
      }
    }, stepDuration);
  };

  /**
   * Play music
   */
  const playMusic = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      fadeIn();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  /**
   * Stop music
   */
  const stopMusic = () => {
    fadeOut();
  };

  /**
   * Handle sound enabled change
   */
  useEffect(() => {
    if (soundEnabled && autoPlay && !isPlaying) {
      playMusic();
    } else if (!soundEnabled && isPlaying) {
      stopMusic();
    }
  }, [soundEnabled]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  /**
   * Handle audio end (loop)
   */
  const handleEnded = () => {
    if (audioRef.current && soundEnabled) {
      audioRef.current.currentTime = 0;
      playMusic();
    }
  };

  return (
    <audio
      ref={audioRef}
      onEnded={handleEnded}
      preload="auto"
      style={{ display: 'none' }}
    >
      {/* Placeholder for actual music file */}
      {/* <source src="/music/main-menu-theme.mp3" type="audio/mpeg" /> */}
      {/* <source src="/music/main-menu-theme.ogg" type="audio/ogg" /> */}
      
      {/* Using a data URL for silence as placeholder */}
      <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" type="audio/wav" />
    </audio>
  );
};

export default BackgroundMusic;
