/**
 * Settings Modal Component
 * 
 * Modal for game settings with volume sliders, graphics quality, and keybinds
 */

import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

/**
 * Graphics quality options
 */
type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Keybind interface
 */
interface Keybind {
  action: string;
  key: string;
  description: string;
}

/**
 * Settings state interface
 */
interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: GraphicsQuality;
  keybinds: Keybind[];
}

/**
 * Settings Modal Props
 */
interface SettingsModalProps {
  onClose: () => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
}

/**
 * Default keybinds
 */
const DEFAULT_KEYBINDS: Keybind[] = [
  { action: 'pause', key: 'Escape', description: 'Pause Game' },
  { action: 'selectPlanet', key: 'LeftClick', description: 'Select Planet' },
  { action: 'openMap', key: 'M', description: 'Open Galaxy Map' },
  { action: 'openFleet', key: 'F', description: 'Open Fleet Manager' },
  { action: 'nextPlanet', key: 'Tab', description: 'Next Planet' },
  { action: 'prevPlanet', key: 'Shift+Tab', description: 'Previous Planet' },
  { action: 'quickSave', key: 'F5', description: 'Quick Save' },
  { action: 'quickLoad', key: 'F9', description: 'Quick Load' }
];

/**
 * Settings Modal Component
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  soundEnabled,
  onSoundEnabledChange
}) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      masterVolume: 80,
      musicVolume: 60,
      sfxVolume: 70,
      graphicsQuality: 'high' as GraphicsQuality,
      keybinds: DEFAULT_KEYBINDS
    };
  });

  const [activeTab, setActiveTab] = useState<'audio' | 'graphics' | 'controls'>('audio');
  const [editingKeybind, setEditingKeybind] = useState<string | null>(null);

  /**
   * Save settings
   */
  const saveSettings = () => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    onClose();
  };

  /**
   * Reset settings
   */
  const resetSettings = () => {
    if (confirm('Reset all settings to default?')) {
      setSettings({
        masterVolume: 80,
        musicVolume: 60,
        sfxVolume: 70,
        graphicsQuality: 'high',
        keybinds: DEFAULT_KEYBINDS
      });
    }
  };

  /**
   * Handle volume change
   */
  const handleVolumeChange = (type: 'masterVolume' | 'musicVolume' | 'sfxVolume', value: number) => {
    setSettings(prev => ({ ...prev, [type]: value }));
  };

  /**
   * Handle graphics quality change
   */
  const handleGraphicsChange = (quality: GraphicsQuality) => {
    setSettings(prev => ({ ...prev, graphicsQuality: quality }));
  };

  /**
   * Handle keybind edit
   */
  const handleKeybindEdit = (action: string) => {
    setEditingKeybind(action);
  };

  /**
   * Listen for key press when editing keybind
   */
  useEffect(() => {
    if (!editingKeybind) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      
      let key = e.key;
      if (e.shiftKey && e.key !== 'Shift') key = `Shift+${key}`;
      if (e.ctrlKey && e.key !== 'Control') key = `Ctrl+${key}`;
      if (e.altKey && e.key !== 'Alt') key = `Alt+${key}`;

      setSettings(prev => ({
        ...prev,
        keybinds: prev.keybinds.map(kb =>
          kb.action === editingKeybind ? { ...kb, key } : kb
        )
      }));

      setEditingKeybind(null);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editingKeybind]);

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â  Audio
          </button>
          <button
            className={`tab ${activeTab === 'graphics' ? 'active' : ''}`}
            onClick={() => setActiveTab('graphics')}
          >
            ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â½ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨ Graphics
          </button>
          <button
            className={`tab ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Controls
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'audio' && (
            <div className="audio-settings">
              <div className="setting-group">
                <label>Master Volume</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.masterVolume}
                    onChange={(e) => handleVolumeChange('masterVolume', parseInt(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="volume-value">{settings.masterVolume}%</span>
                </div>
              </div>

              <div className="setting-group">
                <label>Music Volume</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume}
                    onChange={(e) => handleVolumeChange('musicVolume', parseInt(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="volume-value">{settings.musicVolume}%</span>
                </div>
              </div>

              <div className="setting-group">
                <label>Sound Effects Volume</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sfxVolume}
                    onChange={(e) => handleVolumeChange('sfxVolume', parseInt(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="volume-value">{settings.sfxVolume}%</span>
                </div>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => onSoundEnabledChange(e.target.checked)}
                  />
                  Enable Sound Effects
                </label>
              </div>
            </div>
          )}

          {activeTab === 'graphics' && (
            <div className="graphics-settings">
              <div className="setting-group">
                <label>Graphics Quality</label>
                <div className="quality-buttons">
                  {(['low', 'medium', 'high', 'ultra'] as GraphicsQuality[]).map(quality => (
                    <button
                      key={quality}
                      className={`quality-button ${settings.graphicsQuality === quality ? 'active' : ''}`}
                      onClick={() => handleGraphicsChange(quality)}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="quality-description">
                {settings.graphicsQuality === 'low' && (
                  <p>Minimal effects, optimized for performance</p>
                )}
                {settings.graphicsQuality === 'medium' && (
                  <p>Balanced graphics and performance</p>
                )}
                {settings.graphicsQuality === 'high' && (
                  <p>Enhanced visuals with good performance</p>
                )}
                {settings.graphicsQuality === 'ultra' && (
                  <p>Maximum visual quality, requires powerful hardware</p>
                )}
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Enable Particle Effects
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Enable Bloom Effects
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Show FPS Counter
                </label>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="controls-settings">
              <div className="keybinds-list">
                {settings.keybinds.map(keybind => (
                  <div key={keybind.action} className="keybind-item">
                    <span className="keybind-description">{keybind.description}</span>
                    <button
                      className={`keybind-button ${editingKeybind === keybind.action ? 'editing' : ''}`}
                      onClick={() => handleKeybindEdit(keybind.action)}
                    >
                      {editingKeybind === keybind.action ? 'Press any key...' : keybind.key}
                    </button>
                  </div>
                ))}
              </div>

              <div className="controls-info">
                <p>Click on a keybind to change it. Press Escape to cancel.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button className="reset-button" onClick={resetSettings}>
            Reset to Default
          </button>
          <div className="footer-buttons">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="save-button" onClick={saveSettings}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
