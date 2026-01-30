/**
 * useAudio Hook
 * 
 * React hook for using AudioManager
 */

import { useEffect, useState, useCallback } from 'react';
import AudioManager, { SoundEffectType, AudioSettings } from '@/services/AudioManager';

/**
 * Audio hook return value
 */
interface UseAudioReturn {
  // State
  isReady: boolean;
  preloadProgress: number;
  settings: AudioSettings;
  currentTrack: { id: string | null; playing: boolean };
  
  // Music controls
  playMusic: (trackId: string, fadeIn?: boolean) => void;
  stopMusic: (fadeOut?: boolean) => void;
  setPlaylist: (trackIds: string[]) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  
  // Sound effects
  playSound: (effectType: SoundEffectType | string, sprite?: string) => void;
  
  // Volume controls
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
  
  // Mute controls
  toggleMusicMute: () => void;
  toggleEffectsMute: () => void;
  muteAll: () => void;
  unmuteAll: () => void;
}

/**
 * useAudio Hook
 */
export function useAudio(): UseAudioReturn {
  const audioManager = AudioManager.getInstance();
  
  const [isReady, setIsReady] = useState(audioManager.isReady());
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [settings, setSettings] = useState<AudioSettings>(audioManager.getSettings());
  const [currentTrack, setCurrentTrack] = useState(audioManager.getCurrentTrackInfo());

  /**
   * Initialize audio manager
   */
  useEffect(() => {
    if (!audioManager.isReady()) {
      audioManager.initialize().then(() => {
        setIsReady(true);
      });
    }

    // Poll for updates
    const interval = setInterval(() => {
      setPreloadProgress(audioManager.getPreloadProgress());
      setSettings(audioManager.getSettings());
      setCurrentTrack(audioManager.getCurrentTrackInfo());
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [audioManager]);

  /**
   * Play music
   */
  const playMusic = useCallback((trackId: string, fadeIn: boolean = true) => {
    audioManager.playMusic(trackId, fadeIn);
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  }, [audioManager]);

  /**
   * Stop music
   */
  const stopMusic = useCallback((fadeOut: boolean = true) => {
    audioManager.stopMusic(fadeOut);
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  }, [audioManager]);

  /**
   * Set playlist
   */
  const setPlaylist = useCallback((trackIds: string[]) => {
    audioManager.setPlaylist(trackIds);
  }, [audioManager]);

  /**
   * Next track
   */
  const nextTrack = useCallback(() => {
    audioManager.playNextInPlaylist();
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  }, [audioManager]);

  /**
   * Previous track
   */
  const previousTrack = useCallback(() => {
    audioManager.playPreviousInPlaylist();
    setCurrentTrack(audioManager.getCurrentTrackInfo());
  }, [audioManager]);

  /**
   * Play sound effect
   */
  const playSound = useCallback((effectType: SoundEffectType | string, sprite?: string) => {
    audioManager.playSoundEffect(effectType, sprite);
  }, [audioManager]);

  /**
   * Set master volume
   */
  const setMasterVolume = useCallback((volume: number) => {
    audioManager.setMasterVolume(volume);
    setSettings(audioManager.getSettings());
  }, [audioManager]);

  /**
   * Set music volume
   */
  const setMusicVolume = useCallback((volume: number) => {
    audioManager.setMusicVolume(volume);
    setSettings(audioManager.getSettings());
  }, [audioManager]);

  /**
   * Set effects volume
   */
  const setEffectsVolume = useCallback((volume: number) => {
    audioManager.setEffectsVolume(volume);
    setSettings(audioManager.getSettings());
  }, [audioManager]);

  /**
   * Toggle music mute
   */
  const toggleMusicMute = useCallback(() => {
    audioManager.toggleMusicMute();
    setSettings(audioManager.getSettings());
  }, [audioManager]);

  /**
   * Toggle effects mute
   */
  const toggleEffectsMute = useCallback(() => {
    audioManager.toggleEffectsMute();
    setSettings(audioManager.getSettings());
  }, [audioManager]);

  /**
   * Mute all
   */
  const muteAll = useCallback(() => {
    audioManager.muteAll();
    setSettings(audioManager.getSettings());
  }, [audioManager]);

  /**
   * Unmute all
   */
  const unmuteAll = useCallback(() => {
    audioManager.unmuteAll();
    setSettings(audioManager.getSettings());
  }, [audioManager]);

  return {
    isReady,
    preloadProgress,
    settings,
    currentTrack,
    playMusic,
    stopMusic,
    setPlaylist,
    nextTrack,
    previousTrack,
    playSound,
    setMasterVolume,
    setMusicVolume,
    setEffectsVolume,
    toggleMusicMute,
    toggleEffectsMute,
    muteAll,
    unmuteAll
  };
}

export default useAudio;
