/**
 * Audio Control Panel Component
 * 
 * UI component for audio controls
 */

import React from 'react';
import { useAudio } from '@/hooks/useAudio';
import './AudioControlPanel.css';

/**
 * Audio Control Panel Props
 */
interface AudioControlPanelProps {
  className?: string;
}

/**
 * Audio Control Panel Component
 */
export const AudioControlPanel: React.FC<AudioControlPanelProps> = ({ className = '' }) => {
  const {
    isReady,
    settings,
    currentTrack,
    setMasterVolume,
    setMusicVolume,
    setEffectsVolume,
    toggleMusicMute,
    toggleEffectsMute,
    stopMusic,
    nextTrack,
    previousTrack
  } = useAudio();

  if (!isReady) {
    return (
      <div className={`audio-control-panel ${className}`}>
        <p>Loading audio...</p>
      </div>
    );
  }

  return (
    <div className={`audio-control-panel ${className}`}>
      <h3>Audio Settings</h3>

      {/* Master Volume */}
      <div className="audio-control">
        <label>
          <span className="control-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â </span>
          <span className="control-label">Master Volume</span>
        </label>
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.masterVolume * 100}
            onChange={(e) => setMasterVolume(parseInt(e.target.value) / 100)}
            className="volume-slider"
          />
          <span className="volume-value">{Math.round(settings.masterVolume * 100)}%</span>
        </div>
      </div>

      {/* Music Volume */}
      <div className="audio-control">
        <label>
          <span className="control-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â½ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµ</span>
          <span className="control-label">Music</span>
          <button
            className={`mute-button ${settings.musicMuted ? 'muted' : ''}`}
            onClick={toggleMusicMute}
            title={settings.musicMuted ? 'Unmute Music' : 'Mute Music'}
          >
            {settings.musicMuted ? 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡' : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â '}
          </button>
        </label>
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume * 100}
            onChange={(e) => setMusicVolume(parseInt(e.target.value) / 100)}
            className="volume-slider"
            disabled={settings.musicMuted}
          />
          <span className="volume-value">{Math.round(settings.musicVolume * 100)}%</span>
        </div>
      </div>

      {/* Effects Volume */}
      <div className="audio-control">
        <label>
          <span className="control-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â</span>
          <span className="control-label">Sound Effects</span>
          <button
            className={`mute-button ${settings.effectsMuted ? 'muted' : ''}`}
            onClick={toggleEffectsMute}
            title={settings.effectsMuted ? 'Unmute Effects' : 'Mute Effects'}
          >
            {settings.effectsMuted ? 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡' : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â '}
          </button>
        </label>
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.effectsVolume * 100}
            onChange={(e) => setEffectsVolume(parseInt(e.target.value) / 100)}
            className="volume-slider"
            disabled={settings.effectsMuted}
          />
          <span className="volume-value">{Math.round(settings.effectsVolume * 100)}%</span>
        </div>
      </div>

      {/* Music Controls */}
      {currentTrack.playing && (
        <div className="music-controls">
          <h4>Now Playing: {currentTrack.id}</h4>
          <div className="playback-controls">
            <button onClick={previousTrack} className="control-btn">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â®ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</button>
            <button onClick={() => stopMusic(true)} className="control-btn">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</button>
            <button onClick={nextTrack} className="control-btn">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioControlPanel;
