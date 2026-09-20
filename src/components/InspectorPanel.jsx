import React from 'react';
import { Sliders, Upload, Music, Image as ImageIcon, Palette, Type, Maximize } from 'lucide-react';
import { DEMO_SONGS } from '../types/templates';

export default function InspectorPanel({ 
  selectedTemplate, 
  metadata, 
  onUpdateMetadata,
  currentSong,
  onSelectSong,
  customAspectRatio,
  onAspectRatioChange,
  customWidth,
  customHeight,
  onDimensionsChange
}) {
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateMetadata({ coverImage: url });
    }
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateMetadata({ bgImage: url });
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSelectSong({
        id: 'custom-' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Uploaded Audio',
        url: url
      });
    }
  };

  const currentRatio = customAspectRatio || selectedTemplate.aspectRatio || '3:4';

  return (
    <div className="sidebar-panel right">
      <div className="panel-header">
        <div className="panel-title">
          <Sliders size={18} color="#a855f7" />
          <span>Design Inspector</span>
        </div>
      </div>

      <div className="panel-content">
        {/* Canvas Size & Aspect Ratio Control */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Maximize size={14} color="#38bdf8" />
            <span>Canvas Size & Aspect Ratio</span>
          </label>

          <select 
            className="form-select"
            value={currentRatio}
            onChange={(e) => onAspectRatioChange(e.target.value)}
          >
            <option value="1:1">1:1 Square (Instagram / Spotify)</option>
            <option value="9:16">9:16 Story / Reels (310x550)</option>
            <option value="9:19">9:19 Mobile Tall (310x650)</option>
            <option value="4:5">4:5 Portrait Post (340x425)</option>
            <option value="3:4">3:4 Standard Card (330x440)</option>
            <option value="16:9">16:9 Landscape Banner (480x270)</option>
            <option value="custom">Manual Custom (px)</option>
          </select>

          {/* Manual Width & Height Inputs if custom ratio is selected */}
          {currentRatio === 'custom' && (
            <div className="form-row" style={{ marginTop: '8px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Width (px)</span>
                <input 
                  type="number"
                  className="form-input"
                  value={customWidth}
                  onChange={(e) => onDimensionsChange(parseInt(e.target.value) || 300, customHeight)}
                  min="200"
                  max="1200"
                />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Height (px)</span>
                <input 
                  type="number"
                  className="form-input"
                  value={customHeight}
                  onChange={(e) => onDimensionsChange(customWidth, parseInt(e.target.value) || 300)}
                  min="200"
                  max="1600"
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Track & Song Selection */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Music size={14} />
            <span>Song Track & Preset Audio</span>
          </label>
          <select 
            className="form-select"
            value={currentSong.id}
            onChange={(e) => {
              const song = DEMO_SONGS.find(s => s.id === e.target.value);
              if (song) onSelectSong(song);
            }}
          >
            {DEMO_SONGS.map(s => (
              <option key={s.id} value={s.id}>{s.title} — {s.artist}</option>
            ))}
          </select>
          <label className="btn-secondary" style={{ marginTop: '4px', justifyContent: 'center' }}>
            <Upload size={14} />
            <span>Upload MP3 Audio</span>
            <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Text Fields */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Type size={14} />
            <span>Song Details & Typography</span>
          </label>
          <div className="form-row">
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Song Title</span>
              <input 
                type="text" 
                className="form-input"
                value={metadata.songTitle || ''}
                onChange={(e) => onUpdateMetadata({ songTitle: e.target.value })}
                placeholder="Track Title"
              />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Artist Name</span>
              <input 
                type="text" 
                className="form-input"
                value={metadata.artist || ''}
                onChange={(e) => onUpdateMetadata({ artist: e.target.value })}
                placeholder="Artist"
              />
            </div>
          </div>

          {/* Optional Lyric Quote / Caption */}
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Lyric Quote / Top Caption</span>
            <textarea 
              className="form-textarea"
              rows={2}
              value={metadata.caption || metadata.quoteText || ''}
              onChange={(e) => onUpdateMetadata({ caption: e.target.value, quoteText: e.target.value })}
              placeholder="Enter lyric phrase or caption..."
            />
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Image Uploads */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ImageIcon size={14} />
            <span>{selectedTemplate?.id === 't18_dj_breakbeat_visualizer' ? 'Logo Tengah & Background' : 'Images & Cover Art'}</span>
          </label>

          <div className="form-row">
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {selectedTemplate?.id === 't18_dj_breakbeat_visualizer' ? 'Logo Tengah (Center)' : 'Cover Photo'}
              </span>
              <label className="btn-secondary" style={{ marginTop: '4px', width: '100%', justifyContent: 'center' }}>
                <Upload size={14} />
                <span>Ganti Logo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      onUpdateMetadata({ coverImage: url, centerLogo: url, centerTextMode: false });
                    }
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Background</span>
              <label className="btn-secondary" style={{ marginTop: '4px', width: '100%', justifyContent: 'center' }}>
                <Upload size={14} />
                <span>Ganti BG</span>
                <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Quick Background Presets for DJ Template */}
          {selectedTemplate?.id === 't18_dj_breakbeat_visualizer' && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '4px 6px', fontSize: '0.68rem', justifyContent: 'center' }}
                onClick={() => onUpdateMetadata({ bgImage: '/dj_desk_setup.jpg' })}
              >
                BG Studio RGB
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '4px 6px', fontSize: '0.68rem', justifyContent: 'center' }}
                onClick={() => onUpdateMetadata({ bgImage: '/dj_desk_setup_original.jpg' })}
              >
                BG Original Video
              </button>
            </div>
          )}
        </div>

        {/* DJ Specific Center Badge & Typography Controls */}
        {selectedTemplate?.id === 't18_dj_breakbeat_visualizer' && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} color="#eab308" />
                <span>Kustomisasi Teks DJ Logo</span>
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => onUpdateMetadata({ centerTextMode: false })}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '8px',
                    border: !metadata.centerTextMode ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                    background: !metadata.centerTextMode ? 'rgba(250,204,21,0.15)' : 'transparent',
                    color: !metadata.centerTextMode ? '#facc15' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Mode Gambar Logo
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateMetadata({ centerTextMode: true })}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '8px',
                    border: metadata.centerTextMode ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                    background: metadata.centerTextMode ? 'rgba(250,204,21,0.15)' : 'transparent',
                    color: metadata.centerTextMode ? '#facc15' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Mode Teks DJ
                </button>
              </div>

              {metadata.centerTextMode && (
                <div className="form-row">
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DJ Name</span>
                    <input 
                      type="text" 
                      className="form-input"
                      value={metadata.djName || 'Keyra'}
                      onChange={(e) => onUpdateMetadata({ djName: e.target.value })}
                      placeholder="e.g. Keyra"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DJ Subtitle</span>
                    <input 
                      type="text" 
                      className="form-input"
                      value={metadata.djSubtitle || 'Fvnky'}
                      onChange={(e) => onUpdateMetadata({ djSubtitle: e.target.value })}
                      placeholder="e.g. Fvnky"
                    />
                  </div>
                </div>
              )}

              {/* Effects Toggles */}
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={metadata.particlesEnabled !== false}
                    onChange={(e) => onUpdateMetadata({ particlesEnabled: e.target.checked })}
                  />
                  <span>Aktifkan Partikel Komet Terbang</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={metadata.bassShake !== false}
                    onChange={(e) => onUpdateMetadata({ bassShake: e.target.checked })}
                  />
                  <span>Efek Getar Bass (Jedag-Jedug Shake)</span>
                </label>
              </div>
            </div>
          </>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Color & Glow customization */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={14} />
            <span>Neon Glow & Theme Color</span>
          </label>

          {/* Quick Neon Presets for DJ Visualizer */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {[
              { name: 'Kuning', color: '#facc15', label: 'Yellow' },
              { name: 'Hijau', color: '#22c55e', label: 'Lime' },
              { name: 'Cyan', color: '#38bdf8', label: 'Cyan' },
              { name: 'Ungu', color: '#a855f7', label: 'Purple' },
              { name: 'Merah', color: '#ef4444', label: 'Red' }
            ].map(preset => (
              <button
                key={preset.color}
                type="button"
                onClick={() => onUpdateMetadata({ glowColor: preset.color, particleColor: preset.color })}
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${preset.color}`,
                  background: metadata.glowColor === preset.color ? preset.color : 'transparent',
                  color: metadata.glowColor === preset.color ? '#09090b' : preset.color,
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="color-picker-row">
            <input 
              type="color" 
              className="color-swatch-input"
              value={metadata.glowColor || '#38bdf8'}
              onChange={(e) => onUpdateMetadata({ glowColor: e.target.value })}
            />
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Neon Color: <code>{metadata.glowColor || '#38bdf8'}</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
