import React, { useState, useRef } from 'react';
import { TEMPLATES } from '../types/templates';
import { Sparkles, Search, ArrowRight, Folder, LayoutGrid, Upload, Radio, Flame } from 'lucide-react';
import { parseVizFile } from '../utils/vizParser';

export default function TemplateLibraryScreen({ onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeTab, setActiveTab] = useState('template'); // 'draft' | 'template'
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  const vizInputRef = useRef(null);

  const categories = [
    'Semua', 
    'Avee Player .VIZ', 
    'DJ & Visualizer', 
    'iOS Lockscreen', 
    'Cyber & Hologram', 
    'Futuristic & Airpods', 
    'Streetwear & Aesthetic', 
    'Vinyl & Retro'
  ];

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle direct Avee Player .viz file import
  const handleVizUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const parsedTemplate = await parseVizFile(file);
      setIsImporting(false);
      onSelectTemplate(parsedTemplate);
    } catch (err) {
      console.error('Import .viz error:', err);
      setImportError(`Gagal membaca file .viz: ${err.message}`);
      setIsImporting(false);
    }
  };

  return (
    <div className="capcut-screen">
      {/* Hidden .viz file input */}
      <input 
        ref={vizInputRef}
        type="file" 
        accept=".viz,.zip" 
        onChange={handleVizUpload} 
        style={{ display: 'none' }} 
      />

      {/* Top Header */}
      <header className="capcut-header">
        <div>
          <div className="capcut-subbadge">
            <Radio size={14} color="#22c55e" />
            <span>AVEE PLAYER WEB STUDIO</span>
          </div>
          <h1 className="capcut-title">Avee Player Visualizer</h1>
          <p className="capcut-subtitle">Kloning template .viz resmi, ganti background & logo sesuka Anda</p>
        </div>

        <button className="capcut-search-btn" title="Cari Template">
          <Search size={20} color="#f8fafc" />
        </button>
      </header>

      {/* Hero Action Card: Import .viz Template File */}
      <div style={{ padding: '0 16px', marginBottom: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(56, 189, 248, 0.1) 50%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.35)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <Flame size={16} color="#facc15" />
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>Punya File .viz Sendiri?</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#cbd5e1' }}>
              Upload file .viz dari Avee Player, otomatis di-clone ke web!
            </p>
          </div>

          <button
            onClick={() => vizInputRef.current?.click()}
            disabled={isImporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#090a0f',
              fontWeight: '800',
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 16px rgba(34, 197, 94, 0.45)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Upload size={14} />
            <span>{isImporting ? 'Membaca .viz...' : 'Clone File .viz'}</span>
          </button>
        </div>

        {importError && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '0.75rem'
          }}>
            {importError}
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '8px 16px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        background: 'rgba(15, 17, 23, 0.6)'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedCategory === cat ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.08)',
              background: selectedCategory === cat ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.04)',
              color: selectedCategory === cat ? '#090a0f' : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: selectedCategory === cat ? '0 0 12px rgba(34,197,94,0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Template Grid */}
      <main className="capcut-grid-container">
        <div className="capcut-grid">
          {filteredTemplates.map(t => (
            <div 
              key={t.id} 
              className="capcut-card"
              onClick={() => onSelectTemplate(t)}
              style={{
                cursor: 'pointer',
                border: t.category === 'Avee Player .VIZ' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {/* Duration Tag Badge Top Right */}
              <div className="capcut-card-duration" style={{
                background: t.category === 'Avee Player .VIZ' ? 'rgba(34, 197, 94, 0.85)' : 'rgba(0, 0, 0, 0.75)',
                color: t.category === 'Avee Player .VIZ' ? '#090a0f' : '#ffffff',
                fontWeight: '800'
              }}>
                {t.durationTag || '0:30'}
              </div>

              {/* Cover Image Thumbnail */}
              <div className="capcut-card-img-wrapper">
                <img src={t.refImage} alt={t.name} />
              </div>

              {/* Card Footer Info */}
              <div className="capcut-card-body">
                <h3 className="capcut-card-title">{t.name}</h3>
                <div className="capcut-card-used">
                  <span>🖼️ {t.usedCount || '150+ kali digunakan'}</span>
                </div>

                <div className="capcut-card-actions">
                  <button 
                    className="capcut-btn-use"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(t);
                    }}
                    style={t.category === 'Avee Player .VIZ' ? {
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: '#090a0f'
                    } : {}}
                  >
                    <span>Gunakan</span>
                    <div className="capcut-arrow-pill" style={t.category === 'Avee Player .VIZ' ? { background: '#090a0f' } : {}}>
                      <ArrowRight size={16} color={t.category === 'Avee Player .VIZ' ? '#22c55e' : '#fff'} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom CapCut Navigation Bar */}
      <footer className="capcut-bottom-nav">
        <button 
          className={`capcut-nav-item ${activeTab === 'draft' ? 'active' : ''}`}
          onClick={() => setActiveTab('draft')}
        >
          <Folder size={18} />
          <span>Draft Project</span>
        </button>

        <button 
          className={`capcut-nav-item active-pill`}
          onClick={() => setActiveTab('template')}
        >
          <LayoutGrid size={18} />
          <span>Template</span>
        </button>
      </footer>
    </div>
  );
}
