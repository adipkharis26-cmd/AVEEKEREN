import React, { useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';
import { 
  ArrowLeft, Download, Play, Pause, SkipBack, SkipForward, 
  RotateCcw, RotateCw, Maximize2, Scissors, Music, Type, 
  Sparkles, Ratio, Bookmark, Eye, EyeOff, Plus, Check, Upload, Palette, Image as ImageIcon, Clock, Calendar, Disc3, ShieldAlert
} from 'lucide-react';

export default function CapCutEditorScreen({ 
  selectedTemplate, 
  onBackToLibrary, 
  onOpenExport,
  metadata,
  onUpdateMetadata,
  currentSong,
  onSelectSong,
  isPlaying,
  onTogglePlay,
  progress,
  onSeek,
  canvasRef,
  customAspectRatio,
  onAspectRatioChange
}) {
  const [activeBottomTool, setActiveBottomTool] = useState('edit'); // 'edit' | 'audio' | 'teks' | 'gaya' | 'rasio' | 'preset'
  const [audioError, setAudioError] = useState(null);

  const coverInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const logoInputRef = useRef(null);

  if (!selectedTemplate) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#090a0f', gap: '16px' }}>
        <span>Template tidak ditemukan.</span>
        <button onClick={onBackToLibrary} style={{ padding: '10px 20px', borderRadius: '12px', background: '#a855f7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
          Kembali ke Pilih Template
        </button>
      </div>
    );
  }

  const isAveeTemplate = selectedTemplate.category === 'Avee Player .VIZ' || 
                         selectedTemplate.category === 'DJ & Visualizer' || 
                         selectedTemplate.id.startsWith('t18') || 
                         selectedTemplate.id.startsWith('t19') || 
                         selectedTemplate.id.startsWith('t20') ||
                         selectedTemplate.id.startsWith('custom_viz');

  // Utility to format file size in human-readable units
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Convert uploaded image file to Base64 Data URL
  const handleCoverFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateMetadata({ 
          coverImage: event.target.result,
          centerLogo: event.target.result,
          centerTextMode: false
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateMetadata({ bgImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio file upload handler
  const handleAudioFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    e.target.value = '';

    const filename = file.name || 'Audio Track';
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const rawType = (file.type || '').toLowerCase();

    const supportedExts = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac', 'aiff', 'aif', 'caf', 'mp4', 'm4r', '3gp', 'amr', 'wma'];
    const isAudioMime = rawType.startsWith('audio/') || 
                        rawType.includes('mp4') || 
                        rawType.includes('mpeg') || 
                        rawType.includes('aac') || 
                        rawType.includes('wav') ||
                        rawType === 'application/octet-stream';

    const isValidExt = supportedExts.includes(ext);
    const isGenuinelyUnsupported = !isValidExt && !isAudioMime;

    if (isGenuinelyUnsupported) {
      setAudioError(`Format file "${filename}" tidak didukung. Gunakan file audio (MP3, M4A, AAC, WAV, FLAC, dll).`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setAudioError(`Ukuran file (${formatFileSize(file.size)}) terlalu besar. Maksimal 100MB.`);
      return;
    }

    setAudioError(null);

    const formattedSize = formatFileSize(file.size);
    const formatLabel = ext ? ext.toUpperCase() : (rawType.split('/')[1] || 'AUDIO').toUpperCase();
    const songTitle = filename.replace(/\.[^/.]+$/, "");

    const updateSongState = (audioUrl) => {
      onSelectSong({
        id: 'custom-' + Date.now(),
        title: songTitle,
        artist: 'Uploaded Audio',
        url: audioUrl,
        filename: filename,
        fileType: `${formatLabel} (${rawType || '.' + ext})`,
        fileSize: formattedSize
      });
      // Also update song title in metadata if user hasn't typed a custom one
      onUpdateMetadata({ songTitle });
    };

    try {
      const objectUrl = URL.createObjectURL(file);
      updateSongState(objectUrl);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        updateSongState(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentRatio = customAspectRatio || selectedTemplate.aspectRatio || (isAveeTemplate ? '16:9' : '9:16');

  const getNumericRatio = (r) => {
    switch(r) {
      case '1:1': return '1/1';
      case '4:5': return '4/5';
      case '3:4': return '3/4';
      case '16:9': return '16/9';
      case '9:19': return '9/19';
      case '9:16':
      default: return '9/16';
    }
  };

  return (
    <div className="capcut-editor-container">
      {/* Hidden File Inputs */}
      <input 
        ref={coverInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleCoverFileChange} 
        style={{ display: 'none' }} 
      />
      <input 
        ref={bgInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleBgFileChange} 
        style={{ display: 'none' }} 
      />
      <input 
        ref={audioInputRef}
        type="file" 
        accept="audio/*,audio/mpeg,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/x-wav,audio/ogg,audio/flac,.mp3,.m4a,.aac,.wav,.ogg,.flac,.aiff,.caf,.mp4,.m4r,.3gp,.amr"
        onChange={handleAudioFileChange} 
        style={{ display: 'none' }} 
      />

      {/* Top Header Bar */}
      <header className="capcut-editor-header">
        <button className="capcut-icon-btn" onClick={onBackToLibrary}>
          <ArrowLeft size={22} color="#fff" />
        </button>

        <h2 className="capcut-editor-title">{selectedTemplate.name}</h2>

        <button className="capcut-export-btn" onClick={onOpenExport}>
          <Download size={16} />
          <span>Export HD / MP4</span>
        </button>
      </header>

      {/* Main Preview Canvas Viewport */}
      <div className="capcut-canvas-viewport">
        <div 
          ref={canvasRef}
          className="capcut-canvas-stage"
          style={{
            height: isAveeTemplate ? '320px' : '380px',
            maxHeight: '44vh',
            aspectRatio: getNumericRatio(currentRatio),
            margin: '0 auto',
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <TemplateRenderer 
            template={selectedTemplate}
            metadata={metadata}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            progress={progress}
          />
        </div>

        <button className="capcut-expand-btn" title="Expand View">
          <Maximize2 size={16} color="#fff" />
        </button>
      </div>

      {/* Transport Controls Bar */}
      <div className="capcut-transport-bar">
        <div className="capcut-transport-left">
          <button className="capcut-mini-btn" title="Undo"><RotateCcw size={16} /></button>
          <button className="capcut-mini-btn" title="Redo"><RotateCw size={16} /></button>
        </div>

        <div className="capcut-transport-center">
          <button className="capcut-mini-btn" onClick={() => onSeek(0)}><SkipBack size={18} /></button>
          <button 
            className="capcut-play-circle"
            onClick={() => onTogglePlay(!isPlaying)}
            style={isAveeTemplate ? { background: metadata.glowColor || '#22c55e' } : {}}
          >
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
          </button>
          <button className="capcut-mini-btn" onClick={() => onSeek(100)}><SkipForward size={18} /></button>
          <span className="capcut-timecode">00:{Math.floor(progress * 0.15) < 10 ? '0' : ''}{Math.floor(progress * 0.15)} / 00:15</span>
        </div>

        <div className="capcut-transport-right">
          <div className="capcut-diamond-marker">◇</div>
        </div>
      </div>

      {/* CapCut Timeline Multi-Track Area */}
      <div className="capcut-timeline-area">
        {/* Timeline Ruler Header */}
        <div className="capcut-timeline-ruler">
          <span>0s</span>
          <span>5s</span>
          <span>10s</span>
          <span>15s</span>
          <div className="capcut-scrub-needle" style={{ left: `${progress}%` }} />
        </div>

        {/* Multi-Track Layers List */}
        <div className="capcut-tracks-stack">
          {/* Track 1: Logo Tengah / Foto Sampul */}
          <div className="capcut-track-row" style={{ position: 'relative', cursor: 'pointer' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCoverFileChange} 
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} 
            />
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>{isAveeTemplate ? 'Logo Tengah' : 'Foto sampul'}</span>
            </div>
            <div className="capcut-track-content cover-track">
              <div className="capcut-track-clip cover-clip" style={{ width: '100%' }}>
                <img src={metadata.centerLogo || metadata.coverImage || selectedTemplate.refImage} alt="cover" />
                <span>{isAveeTemplate ? 'Logo Tengah DJ (Klik untuk ganti logo)' : 'Foto sampul (Klik untuk ganti)'}</span>
              </div>
            </div>
          </div>

          {/* Track 2: Background Track */}
          <div className="capcut-track-row" style={{ position: 'relative', cursor: 'pointer' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleBgFileChange} 
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} 
            />
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>Background</span>
            </div>
            <div className="capcut-track-content cover-track">
              <div className="capcut-track-clip cover-clip" style={{ width: '100%' }}>
                <img src={metadata.bgImage || selectedTemplate.refImage} alt="bg" />
                <span>Background Visualizer (Klik untuk ganti gambar)</span>
              </div>
            </div>
          </div>

          {/* Track 3: Judul Lagu / DJ Text Track */}
          <div className="capcut-track-row" onClick={() => setActiveBottomTool('teks')} style={{ cursor: 'pointer' }}>
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>{isAveeTemplate ? 'Teks DJ' : 'Judul'}</span>
            </div>
            <div className="capcut-track-content text-track">
              <div className="capcut-track-clip text-clip" style={{ width: '100%' }}>
                <span>𝘛 {metadata.songTitle || (isAveeTemplate ? `${metadata.djName} ${metadata.djSubtitle}` : 'Judul')}</span>
              </div>
            </div>
          </div>

          {/* Track 4: Audio Track */}
          <div className="capcut-track-row" style={{ position: 'relative', cursor: 'pointer' }}>
            <input 
              type="file" 
              accept="audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .mp4, .caf" 
              onChange={handleAudioFileChange} 
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} 
            />
            <div className="capcut-track-meta">
              <Eye size={14} color="#94a3b8" />
              <span>Audio</span>
            </div>
            <div className="capcut-track-content audio-track">
              <div className="capcut-track-clip audio-clip" style={{ width: '100%' }}>
                {currentSong && (currentSong.filename || currentSong.title) ? (
                  <span>🎵 {currentSong.filename || currentSong.title} {currentSong.fileSize ? `(${currentSong.fileSize})` : ''} • Klik ganti</span>
                ) : (
                  <span>🎵 Belum ada audio (Klik untuk upload MP3)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CapCut Active Tool Inspector Drawer */}
      <div className="capcut-active-panel">
        {/* EDIT TOOL: GANTI BACKGROUND & GANTI LOGO TENGAH */}
        {activeBottomTool === 'edit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Direct Upload Buttons */}
            <div className="capcut-panel-row">
              <label className="capcut-upload-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverFileChange} 
                  style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 5 }} 
                />
                <Upload size={18} color="#22c55e" />
                <span>{isAveeTemplate ? 'Upload Logo Tengah' : 'Ganti Foto Sampul'}</span>
              </label>

              <label className="capcut-upload-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBgFileChange} 
                  style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 5 }} 
                />
                <ImageIcon size={18} color="#38bdf8" />
                <span>Upload Background Baru</span>
              </label>
            </div>

            {/* Quick Presets for Avee Player Visualizer */}
            {isAveeTemplate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', whiteSpace: 'nowrap' }}>Preset BG:</span>
                  <button
                    onClick={() => onUpdateMetadata({ bgImage: '/presets/bg_bmw_white.jpg' })}
                    style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    🚗 BMW Putih (D 8 DAF)
                  </button>
                  <button
                    onClick={() => onUpdateMetadata({ bgImage: '/presets/bg_bmw_black.jpg' })}
                    style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    🏎️ BMW Hitam (B 8 UAS)
                  </button>
                  <button
                    onClick={() => onUpdateMetadata({ bgImage: '/dj_desk_setup.jpg' })}
                    style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    🎧 DJ Studio Desk
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', whiteSpace: 'nowrap' }}>Preset Logo:</span>
                  <button
                    onClick={() => onUpdateMetadata({ centerLogo: '/presets/logo_fharid_fvnky.png', coverImage: '/presets/logo_fharid_fvnky.png', centerTextMode: false })}
                    style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    ⚡ Fharid Fvnky
                  </button>
                  <button
                    onClick={() => onUpdateMetadata({ centerLogo: '/presets/logo_ytdamzz.png', coverImage: '/presets/logo_ytdamzz.png', centerTextMode: false })}
                    style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    🔥 YT DAMZZ
                  </button>
                  <button
                    onClick={() => onUpdateMetadata({ centerLogo: '/presets/logo_af.png', coverImage: '/presets/logo_af.png', centerTextMode: false })}
                    style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    🛡️ AF Badge
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIO TOOL: UPLOAD AUDIO */}
        {activeBottomTool === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {audioError && (
              <div className="capcut-error-banner">
                {audioError}
              </div>
            )}

            {currentSong && (currentSong.filename || currentSong.title) ? (
              <div className="capcut-audio-meta-card">
                <div className="capcut-audio-meta-header">
                  <span className="capcut-audio-meta-title">🎵 {currentSong.filename || currentSong.title}</span>
                </div>
                <div className="capcut-audio-meta-tags">
                  <span>Format: {currentSong.fileType || 'Audio'}</span>
                  <span>•</span>
                  <span>Ukuran: {currentSong.fileSize || 'Standard'}</span>
                </div>
              </div>
            ) : (
              <div className="capcut-audio-meta-card">
                <div className="capcut-audio-meta-header">
                  <span className="capcut-audio-meta-title">🎵 Belum ada file audio</span>
                </div>
                <div className="capcut-audio-meta-tags">
                  <span>Upload file MP3 / M4A / WAV dari perangkat Anda untuk audio-reactive</span>
                </div>
              </div>
            )}

            <div className="capcut-panel-row">
              <label className="capcut-upload-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <input 
                  type="file" 
                  accept="audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .mp4, .caf" 
                  onChange={handleAudioFileChange} 
                  style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 5 }} 
                />
                <Music size={20} color="#a855f7" />
                <span>Upload MP3 / M4A / WAV Baru</span>
              </label>
            </div>
          </div>
        )}

        {/* TEKS TOOL: CUSTOMIZE TEXTS */}
        {activeBottomTool === 'teks' && (
          <div className="capcut-panel-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
            {isAveeTemplate ? (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="capcut-input-group">
                    <span className="capcut-input-label">Nama DJ</span>
                    <input 
                      type="text"
                      className="capcut-text-input"
                      value={metadata.djName || ''}
                      onChange={(e) => onUpdateMetadata({ djName: e.target.value })}
                      placeholder="Fharid / YT DAMZZ..."
                    />
                  </div>
                  <div className="capcut-input-group">
                    <span className="capcut-input-label">Subtitle DJ</span>
                    <input 
                      type="text"
                      className="capcut-text-input"
                      value={metadata.djSubtitle || ''}
                      onChange={(e) => onUpdateMetadata({ djSubtitle: e.target.value })}
                      placeholder="Fvnky / REMIX..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="capcut-input-group">
                    <span className="capcut-input-label">Judul Lagu / Sound TikTok</span>
                    <input 
                      type="text"
                      className="capcut-text-input"
                      value={metadata.songTitle || ''}
                      onChange={(e) => onUpdateMetadata({ songTitle: e.target.value })}
                      placeholder="DJ BREAKBEAT SOUND VIRAL..."
                    />
                  </div>
                  <div className="capcut-input-group">
                    <span className="capcut-input-label">Artist / Channel</span>
                    <input 
                      type="text"
                      className="capcut-text-input"
                      value={metadata.artist || ''}
                      onChange={(e) => onUpdateMetadata({ artist: e.target.value })}
                      placeholder="KHARIS SOPAN REMIX..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <button
                    onClick={() => onUpdateMetadata({ centerTextMode: !metadata.centerTextMode })}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: metadata.centerTextMode ? '#22c55e' : 'rgba(255,255,255,0.08)',
                      color: metadata.centerTextMode ? '#090a0f' : '#cbd5e1',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {metadata.centerTextMode ? '✓ Mode Teks DJ Aktif' : 'Mode Gambar Logo Aktif (Klik untuk ubah ke Teks)'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="capcut-input-group">
                    <span className="capcut-input-label">Judul Lagu</span>
                    <input 
                      type="text"
                      className="capcut-text-input"
                      value={metadata.songTitle || ''}
                      onChange={(e) => onUpdateMetadata({ songTitle: e.target.value })}
                      placeholder="Judul lagu..."
                    />
                  </div>
                  <div className="capcut-input-group">
                    <span className="capcut-input-label">Nama Artist</span>
                    <input 
                      type="text"
                      className="capcut-text-input"
                      value={metadata.artist || ''}
                      onChange={(e) => onUpdateMetadata({ artist: e.target.value })}
                      placeholder="Nama artist..."
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* GAYA TOOL: NEON GLOW, PARTICLES, BEAT SHAKE */}
        {activeBottomTool === 'gaya' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="capcut-panel-row" style={{ alignItems: 'center', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>Warna Glow:</span>
                <input 
                  type="color"
                  className="color-swatch-input"
                  value={metadata.glowColor || '#22c55e'}
                  onChange={(e) => onUpdateMetadata({ glowColor: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>Warna Accent:</span>
                <input 
                  type="color"
                  className="color-swatch-input"
                  value={metadata.accentColor || '#facc15'}
                  onChange={(e) => onUpdateMetadata({ accentColor: e.target.value })}
                />
              </div>
            </div>

            {isAveeTemplate && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                <button
                  onClick={() => onUpdateMetadata({ bassShake: !metadata.bassShake })}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '12px',
                    background: metadata.bassShake ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.06)',
                    border: metadata.bassShake ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                    color: metadata.bassShake ? '#22c55e' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {metadata.bassShake ? '✓ Beat Shake Aktif' : 'Beat Shake Mati'}
                </button>

                <button
                  onClick={() => onUpdateMetadata({ particlesEnabled: !metadata.particlesEnabled })}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '12px',
                    background: metadata.particlesEnabled !== false ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.06)',
                    border: metadata.particlesEnabled !== false ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    color: metadata.particlesEnabled !== false ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {metadata.particlesEnabled !== false ? '✓ Partikel Komet Aktif' : 'Partikel Mati'}
                </button>

                <button
                  onClick={() => onUpdateMetadata({
                    socialOverlay: metadata.socialOverlay ? '' : '/presets/overlay_kharis_sopan.png'
                  })}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '12px',
                    background: metadata.socialOverlay ? 'rgba(250, 204, 21, 0.25)' : 'rgba(255,255,255,0.06)',
                    border: metadata.socialOverlay ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                    color: metadata.socialOverlay ? '#facc15' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {metadata.socialOverlay ? '✓ Overlay Kharis Sopan' : '+ Pasang Overlay Kharis'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RASIO TOOL */}
        {activeBottomTool === 'rasio' && (
          <div className="capcut-panel-pills">
            {['16:9', '9:16', '1:1', '4:5', '3:4', '9:19'].map(r => (
              <button 
                key={r}
                className={`capcut-ratio-pill ${currentRatio === r ? 'active' : ''}`}
                onClick={() => onAspectRatioChange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Toolbar */}
      <footer className="capcut-bottom-toolbar">
        <button 
          className={`capcut-tool-item ${activeBottomTool === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('edit')}
        >
          <Scissors size={20} />
          <span>Edit</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('audio')}
        >
          <Music size={20} />
          <span>Audio</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'teks' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('teks')}
        >
          <Type size={20} />
          <span>Teks</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'gaya' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('gaya')}
        >
          <Sparkles size={20} />
          <span>Gaya</span>
        </button>

        <button 
          className={`capcut-tool-item ${activeBottomTool === 'rasio' ? 'active' : ''}`}
          onClick={() => setActiveBottomTool('rasio')}
        >
          <Ratio size={20} />
          <span>Rasio</span>
        </button>

        <button 
          className="capcut-tool-item"
          onClick={onBackToLibrary}
        >
          <Bookmark size={20} />
          <span>Preset</span>
        </button>
      </footer>
    </div>
  );
}
