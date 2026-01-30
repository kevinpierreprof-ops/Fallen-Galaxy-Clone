/**
 * Audio Manager Usage Examples
 */

import React, { useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { SoundEffectType } from '@/services/AudioManager';
import { AudioControlPanel } from '@/components/AudioControlPanel';

/**
 * Example 1: Basic Music Playback
 */
export const BasicMusicExample: React.FC = () => {
  const { playMusic, stopMusic, isReady } = useAudio();

  return (
    <div>
      <h2>Music Controls</h2>
      <button onClick={() => playMusic('main-menu')} disabled={!isReady}>
        Play Main Menu Music
      </button>
      <button onClick={() => playMusic('exploration')} disabled={!isReady}>
        Play Exploration Music
      </button>
      <button onClick={() => stopMusic()} disabled={!isReady}>
        Stop Music
      </button>
    </div>
  );
};

/**
 * Example 2: Sound Effects
 */
export const SoundEffectsExample: React.FC = () => {
  const { playSound, isReady } = useAudio();

  return (
    <div>
      <h2>Sound Effects</h2>
      <button
        onClick={() => playSound(SoundEffectType.CLICK)}
        disabled={!isReady}
      >
        Click Sound
      </button>
      <button
        onClick={() => playSound(SoundEffectType.BUILD_COMPLETE)}
        disabled={!isReady}
      >
        Build Complete
      </button>
      <button
        onClick={() => playSound(SoundEffectType.MESSAGE_RECEIVED)}
        disabled={!isReady}
      >
        Message Received
      </button>
      <button
        onClick={() => playSound(SoundEffectType.COMBAT_START)}
        disabled={!isReady}
      >
        Combat Start
      </button>
    </div>
  );
};

/**
 * Example 3: Playlist
 */
export const PlaylistExample: React.FC = () => {
  const { setPlaylist, playMusic, nextTrack, previousTrack, isReady } = useAudio();

  useEffect(() => {
    if (isReady) {
      setPlaylist(['exploration', 'peaceful', 'main-menu']);
    }
  }, [isReady, setPlaylist]);

  return (
    <div>
      <h2>Playlist Controls</h2>
      <button onClick={() => playMusic('exploration')} disabled={!isReady}>
        Start Playlist
      </button>
      <button onClick={previousTrack} disabled={!isReady}>
        Previous Track
      </button>
      <button onClick={nextTrack} disabled={!isReady}>
        Next Track
      </button>
    </div>
  );
};

/**
 * Example 4: Game Integration
 */
export const GameWithAudio: React.FC = () => {
  const { playMusic, playSound, isReady, settings } = useAudio();

  // Play main menu music on mount
  useEffect(() => {
    if (isReady) {
      playMusic('main-menu', true);
    }
  }, [isReady, playMusic]);

  // Play sound on building complete
  const handleBuildingComplete = () => {
    playSound(SoundEffectType.BUILD_COMPLETE);
    console.log('Building completed!');
  };

  // Play sound on ship arrived
  const handleShipArrived = () => {
    playSound(SoundEffectType.SHIP_ARRIVED);
    console.log('Ship arrived!');
  };

  // Play sound on message received
  const handleMessageReceived = () => {
    playSound(SoundEffectType.MESSAGE_RECEIVED);
    console.log('Message received!');
  };

  return (
    <div className="game-with-audio">
      <h1>Space Strategy Game</h1>

      <div className="game-actions">
        <button onClick={handleBuildingComplete}>
          Complete Building (Sound)
        </button>
        <button onClick={handleShipArrived}>
          Ship Arrived (Sound)
        </button>
        <button onClick={handleMessageReceived}>
          Receive Message (Sound)
        </button>
      </div>

      <AudioControlPanel />

      <div className="audio-status">
        <p>Music Muted: {settings.musicMuted ? 'Yes' : 'No'}</p>
        <p>Effects Muted: {settings.effectsMuted ? 'Yes' : 'No'}</p>
        <p>Master Volume: {Math.round(settings.masterVolume * 100)}%</p>
      </div>
    </div>
  );
};

/**
 * Example 5: Button with Hover Sound
 */
export const ButtonWithSound: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({
  onClick,
  children
}) => {
  const { playSound } = useAudio();

  const handleClick = () => {
    playSound(SoundEffectType.CLICK);
    onClick?.();
  };

  const handleHover = () => {
    playSound(SoundEffectType.HOVER);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleHover}
      className="sound-button"
    >
      {children}
    </button>
  );
};

/**
 * Example 6: Settings Integration
 */
export const SettingsWithAudio: React.FC = () => {
  const {
    settings,
    setMasterVolume,
    setMusicVolume,
    setEffectsVolume,
    toggleMusicMute,
    toggleEffectsMute,
    playSound
  } = useAudio();

  return (
    <div className="settings-panel">
      <h2>Audio Settings</h2>

      <div className="setting-group">
        <label>Master Volume</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.masterVolume * 100}
          onChange={(e) => {
            setMasterVolume(parseInt(e.target.value) / 100);
            playSound(SoundEffectType.CLICK);
          }}
        />
        <span>{Math.round(settings.masterVolume * 100)}%</span>
      </div>

      <div className="setting-group">
        <label>Music Volume</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.musicVolume * 100}
          onChange={(e) => setMusicVolume(parseInt(e.target.value) / 100)}
          disabled={settings.musicMuted}
        />
        <button onClick={toggleMusicMute}>
          {settings.musicMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <div className="setting-group">
        <label>Effects Volume</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.effectsVolume * 100}
          onChange={(e) => setEffectsVolume(parseInt(e.target.value) / 100)}
          disabled={settings.effectsMuted}
        />
        <button onClick={toggleEffectsMute}>
          {settings.effectsMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
};

/**
 * Example 7: Combat with Audio
 */
export const CombatWithAudio: React.FC = () => {
  const { playMusic, playSound } = useAudio();

  const startCombat = () => {
    playMusic('combat', true);
    playSound(SoundEffectType.COMBAT_START);
  };

  const attack = () => {
    playSound(SoundEffectType.COMBAT_HIT);
  };

  const destroy = () => {
    playSound(SoundEffectType.COMBAT_DESTROY);
  };

  const endCombat = () => {
    playMusic('exploration', true);
  };

  return (
    <div>
      <h2>Combat Demo</h2>
      <button onClick={startCombat}>Start Combat</button>
      <button onClick={attack}>Attack</button>
      <button onClick={destroy}>Destroy</button>
      <button onClick={endCombat}>End Combat</button>
    </div>
  );
};

export default GameWithAudio;
