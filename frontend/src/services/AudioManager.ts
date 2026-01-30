/**
 * Audio Manager
 * 
 * Manages background music, sound effects, and audio settings
 */

import { Howl, Howler } from 'howler';

/**
 * Audio track definition
 */
export interface AudioTrack {
  id: string;
  src: string | string[];
  volume?: number;
  loop?: boolean;
  sprite?: { [key: string]: [number, number] };
}

/**
 * Sound effect definition
 */
export interface SoundEffect {
  id: string;
  src: string | string[];
  volume?: number;
  sprite?: { [key: string]: [number, number] };
}

/**
 * Audio settings
 */
export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  musicMuted: boolean;
  effectsMuted: boolean;
}

/**
 * Sound effect types
 */
export enum SoundEffectType {
  CLICK = 'click',
  HOVER = 'hover',
  BUILD_COMPLETE = 'buildComplete',
  BUILD_START = 'buildStart',
  SHIP_ARRIVED = 'shipArrived',
  SHIP_LAUNCHED = 'shipLaunched',
  COMBAT_START = 'combatStart',
  COMBAT_HIT = 'combatHit',
  COMBAT_DESTROY = 'combatDestroy',
  MESSAGE_RECEIVED = 'messageReceived',
  MESSAGE_SENT = 'messageSent',
  NOTIFICATION = 'notification',
  ERROR = 'error',
  SUCCESS = 'success',
  ALLIANCE_INVITE = 'allianceInvite',
  RESEARCH_COMPLETE = 'researchComplete'
}

/**
 * Audio Manager Class
 * 
 * Manages all game audio including music and sound effects
 */
export class AudioManager {
  private static instance: AudioManager;
  
  // Music tracks
  private musicTracks: Map<string, Howl> = new Map();
  private currentMusicTrack: Howl | null = null;
  private currentTrackId: string | null = null;
  private musicPlaylist: string[] = [];
  private currentPlaylistIndex: number = 0;
  
  // Sound effects
  private soundEffects: Map<string, Howl> = new Map();
  
  // Settings
  private settings: AudioSettings = {
    masterVolume: 0.8,
    musicVolume: 0.6,
    effectsVolume: 0.7,
    musicMuted: false,
    effectsMuted: false
  };
  
  // State
  private isInitialized: boolean = false;
  private isPreloading: boolean = false;
  private preloadProgress: number = 0;
  
  // Fade duration (ms)
  private readonly FADE_DURATION = 1000;
  
  // LocalStorage key
  private readonly STORAGE_KEY = 'gameAudioSettings';

  private constructor() {
    this.loadSettings();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('AudioManager already initialized');
      return;
    }

    console.log('Initializing AudioManager...');

    // Set global volume
    Howler.volume(this.settings.masterVolume);

    // Register music tracks
    this.registerMusicTracks();

    // Register sound effects
    this.registerSoundEffects();

    // Preload all audio
    await this.preloadAll();

    this.isInitialized = true;
    console.log('AudioManager initialized');
  }

  /**
   * Register music tracks
   */
  private registerMusicTracks(): void {
    const tracks: AudioTrack[] = [
      {
        id: 'main-menu',
        src: ['/audio/music/main-menu.mp3', '/audio/music/main-menu.ogg'],
        volume: 1.0,
        loop: true
      },
      {
        id: 'exploration',
        src: ['/audio/music/exploration.mp3', '/audio/music/exploration.ogg'],
        volume: 0.9,
        loop: true
      },
      {
        id: 'combat',
        src: ['/audio/music/combat.mp3', '/audio/music/combat.ogg'],
        volume: 1.0,
        loop: true
      },
      {
        id: 'peaceful',
        src: ['/audio/music/peaceful.mp3', '/audio/music/peaceful.ogg'],
        volume: 0.8,
        loop: true
      },
      {
        id: 'victory',
        src: ['/audio/music/victory.mp3', '/audio/music/victory.ogg'],
        volume: 1.0,
        loop: false
      }
    ];

    for (const track of tracks) {
      const howl = new Howl({
        src: track.src,
        volume: (track.volume || 1.0) * this.settings.musicVolume,
        loop: track.loop !== undefined ? track.loop : true,
        preload: false,
        onend: () => {
          if (!track.loop) {
            this.playNextInPlaylist();
          }
        }
      });

      this.musicTracks.set(track.id, howl);
    }
  }

  /**
   * Register sound effects
   */
  private registerSoundEffects(): void {
    const effects: SoundEffect[] = [
      {
        id: SoundEffectType.CLICK,
        src: ['/audio/sfx/click.mp3', '/audio/sfx/click.ogg'],
        volume: 0.5
      },
      {
        id: SoundEffectType.HOVER,
        src: ['/audio/sfx/hover.mp3', '/audio/sfx/hover.ogg'],
        volume: 0.3
      },
      {
        id: SoundEffectType.BUILD_COMPLETE,
        src: ['/audio/sfx/build-complete.mp3', '/audio/sfx/build-complete.ogg'],
        volume: 0.8
      },
      {
        id: SoundEffectType.BUILD_START,
        src: ['/audio/sfx/build-start.mp3', '/audio/sfx/build-start.ogg'],
        volume: 0.6
      },
      {
        id: SoundEffectType.SHIP_ARRIVED,
        src: ['/audio/sfx/ship-arrived.mp3', '/audio/sfx/ship-arrived.ogg'],
        volume: 0.7
      },
      {
        id: SoundEffectType.SHIP_LAUNCHED,
        src: ['/audio/sfx/ship-launched.mp3', '/audio/sfx/ship-launched.ogg'],
        volume: 0.7
      },
      {
        id: SoundEffectType.COMBAT_START,
        src: ['/audio/sfx/combat-start.mp3', '/audio/sfx/combat-start.ogg'],
        volume: 0.9
      },
      {
        id: SoundEffectType.COMBAT_HIT,
        src: ['/audio/sfx/combat-hit.mp3', '/audio/sfx/combat-hit.ogg'],
        volume: 0.6
      },
      {
        id: SoundEffectType.COMBAT_DESTROY,
        src: ['/audio/sfx/combat-destroy.mp3', '/audio/sfx/combat-destroy.ogg'],
        volume: 0.8
      },
      {
        id: SoundEffectType.MESSAGE_RECEIVED,
        src: ['/audio/sfx/message-received.mp3', '/audio/sfx/message-received.ogg'],
        volume: 0.7
      },
      {
        id: SoundEffectType.MESSAGE_SENT,
        src: ['/audio/sfx/message-sent.mp3', '/audio/sfx/message-sent.ogg'],
        volume: 0.5
      },
      {
        id: SoundEffectType.NOTIFICATION,
        src: ['/audio/sfx/notification.mp3', '/audio/sfx/notification.ogg'],
        volume: 0.6
      },
      {
        id: SoundEffectType.ERROR,
        src: ['/audio/sfx/error.mp3', '/audio/sfx/error.ogg'],
        volume: 0.7
      },
      {
        id: SoundEffectType.SUCCESS,
        src: ['/audio/sfx/success.mp3', '/audio/sfx/success.ogg'],
        volume: 0.7
      },
      {
        id: SoundEffectType.ALLIANCE_INVITE,
        src: ['/audio/sfx/alliance-invite.mp3', '/audio/sfx/alliance-invite.ogg'],
        volume: 0.8
      },
      {
        id: SoundEffectType.RESEARCH_COMPLETE,
        src: ['/audio/sfx/research-complete.mp3', '/audio/sfx/research-complete.ogg'],
        volume: 0.8
      }
    ];

    for (const effect of effects) {
      const howl = new Howl({
        src: effect.src,
        volume: (effect.volume || 1.0) * this.settings.effectsVolume,
        preload: false,
        sprite: effect.sprite
      });

      this.soundEffects.set(effect.id, howl);
    }
  }

  /**
   * Preload all audio files
   */
  private async preloadAll(): Promise<void> {
    if (this.isPreloading) {
      console.warn('Audio files are already being preloaded');
      return;
    }

    this.isPreloading = true;
    this.preloadProgress = 0;

    const allAudio = [
      ...Array.from(this.musicTracks.values()),
      ...Array.from(this.soundEffects.values())
    ];

    const total = allAudio.length;
    let loaded = 0;

    const promises = allAudio.map(audio => {
      return new Promise<void>((resolve, reject) => {
        audio.once('load', () => {
          loaded++;
          this.preloadProgress = (loaded / total) * 100;
          resolve();
        });

        audio.once('loaderror', (id, error) => {
          console.error('Failed to load audio:', id, error);
          loaded++;
          this.preloadProgress = (loaded / total) * 100;
          resolve(); // Don't reject, continue loading others
        });

        audio.load();
      });
    });

    await Promise.all(promises);
    this.isPreloading = false;
    this.preloadProgress = 100;
    
    console.log('All audio files preloaded');
  }

  /**
   * Play music track
   */
  public playMusic(trackId: string, fadeIn: boolean = true): void {
    if (!this.isInitialized) {
      console.warn('AudioManager not initialized');
      return;
    }

    const track = this.musicTracks.get(trackId);
    if (!track) {
      console.error('Music track not found:', trackId);
      return;
    }

    // Stop current track
    if (this.currentMusicTrack) {
      this.stopMusic(fadeIn);
    }

    // Update current track
    this.currentMusicTrack = track;
    this.currentTrackId = trackId;

    // Set mute state
    track.mute(this.settings.musicMuted);

    if (fadeIn) {
      // Start at 0 volume and fade in
      track.volume(0);
      track.play();
      track.fade(0, this.settings.musicVolume, this.FADE_DURATION);
    } else {
      track.volume(this.settings.musicVolume);
      track.play();
    }

    console.log('Playing music:', trackId);
  }

  /**
   * Stop current music
   */
  public stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusicTrack) return;

    if (fadeOut) {
      this.currentMusicTrack.fade(
        this.currentMusicTrack.volume(),
        0,
        this.FADE_DURATION
      );

      setTimeout(() => {
        if (this.currentMusicTrack) {
          this.currentMusicTrack.stop();
        }
      }, this.FADE_DURATION);
    } else {
      this.currentMusicTrack.stop();
    }

    this.currentMusicTrack = null;
    this.currentTrackId = null;
  }

  /**
   * Set music playlist
   */
  public setPlaylist(trackIds: string[]): void {
    this.musicPlaylist = trackIds;
    this.currentPlaylistIndex = 0;
  }

  /**
   * Play next track in playlist
   */
  public playNextInPlaylist(): void {
    if (this.musicPlaylist.length === 0) return;

    this.currentPlaylistIndex = (this.currentPlaylistIndex + 1) % this.musicPlaylist.length;
    const nextTrackId = this.musicPlaylist[this.currentPlaylistIndex];
    this.playMusic(nextTrackId, true);
  }

  /**
   * Play previous track in playlist
   */
  public playPreviousInPlaylist(): void {
    if (this.musicPlaylist.length === 0) return;

    this.currentPlaylistIndex = 
      (this.currentPlaylistIndex - 1 + this.musicPlaylist.length) % this.musicPlaylist.length;
    const prevTrackId = this.musicPlaylist[this.currentPlaylistIndex];
    this.playMusic(prevTrackId, true);
  }

  /**
   * Play sound effect
   */
  public playSoundEffect(effectType: SoundEffectType | string, sprite?: string): void {
    if (!this.isInitialized) return;

    const effect = this.soundEffects.get(effectType);
    if (!effect) {
      console.error('Sound effect not found:', effectType);
      return;
    }

    // Set mute state
    effect.mute(this.settings.effectsMuted);

    // Play sprite or full sound
    if (sprite) {
      effect.play(sprite);
    } else {
      effect.play();
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.settings.masterVolume);
    this.saveSettings();
  }

  /**
   * Set music volume
   */
  public setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Update all music tracks
    for (const track of this.musicTracks.values()) {
      track.volume(this.settings.musicVolume);
    }

    this.saveSettings();
  }

  /**
   * Set effects volume
   */
  public setEffectsVolume(volume: number): void {
    this.settings.effectsVolume = Math.max(0, Math.min(1, volume));
    
    // Update all sound effects
    for (const effect of this.soundEffects.values()) {
      effect.volume(this.settings.effectsVolume);
    }

    this.saveSettings();
  }

  /**
   * Toggle music mute
   */
  public toggleMusicMute(): void {
    this.settings.musicMuted = !this.settings.musicMuted;
    
    // Update all music tracks
    for (const track of this.musicTracks.values()) {
      track.mute(this.settings.musicMuted);
    }

    this.saveSettings();
  }

  /**
   * Toggle effects mute
   */
  public toggleEffectsMute(): void {
    this.settings.effectsMuted = !this.settings.effectsMuted;
    
    // Update all sound effects
    for (const effect of this.soundEffects.values()) {
      effect.mute(this.settings.effectsMuted);
    }

    this.saveSettings();
  }

  /**
   * Mute all audio
   */
  public muteAll(): void {
    Howler.mute(true);
    this.settings.musicMuted = true;
    this.settings.effectsMuted = true;
    this.saveSettings();
  }

  /**
   * Unmute all audio
   */
  public unmuteAll(): void {
    Howler.mute(false);
    this.settings.musicMuted = false;
    this.settings.effectsMuted = false;
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Get preload progress
   */
  public getPreloadProgress(): number {
    return this.preloadProgress;
  }

  /**
   * Check if initialized
   */
  public isReady(): boolean {
    return this.isInitialized && !this.isPreloading;
  }

  /**
   * Get current track info
   */
  public getCurrentTrackInfo(): { id: string | null; playing: boolean } {
    return {
      id: this.currentTrackId,
      playing: this.currentMusicTrack?.playing() || false
    };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopMusic(false);
    
    // Unload all audio
    for (const track of this.musicTracks.values()) {
      track.unload();
    }
    
    for (const effect of this.soundEffects.values()) {
      effect.unload();
    }

    this.musicTracks.clear();
    this.soundEffects.clear();
    
    this.isInitialized = false;
  }
}

export default AudioManager;
