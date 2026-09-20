import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Disc3, Volume2, Sparkles, Radio } from 'lucide-react';

export default function DJBreakbeatRenderer({
  data,
  isPlaying,
  progress,
  onTogglePlay,
  currentTimeStr,
  durationStr,
  handleImgError
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const freqDataRef = useRef(null);

  const glowColor = data.glowColor || '#22c55e';
  const accentColor = data.accentColor || '#facc15';
  const displayLogo = data.centerLogo || data.coverImage || '/presets/logo_fharid_fvnky.png';
  const displayBg = data.bgImage || '/presets/bg_bmw_white.jpg';
  const lightAccent = data.lightAccent || '/presets/light_accent.png';

  const djName = data.djName || 'Fharid';
  const djSubtitle = data.djSubtitle || 'Fvnky';
  const songTitle = data.songTitle || 'DJ BREAKBEAT SOUND TIKTOK VIRAL';
  const artist = data.artist || 'KHARIS SOPAN REMIX';

  // Floating comet sparkles
  useEffect(() => {
    const count = 38;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 50 + Math.random() * 200,
        speed: 1.8 + Math.random() * 4.0,
        length: 10 + Math.random() * 24,
        width: 1.2 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.75,
        color: Math.random() > 0.4 ? glowColor : accentColor,
        size: 1.5 + Math.random() * 3
      });
    }
    particlesRef.current = particles;
  }, [glowColor, accentColor]);

  // High-performance 60FPS Visualizer Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    // Smoothed bar peak array for natural Avee Player bounce decay
    const numBars = data.waveBars || 80;
    const barPeaks = new Float32Array(numBars);

    const render = () => {
      time += isPlaying ? 0.048 : 0.012;
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.48; // Centered slightly above bottom bar
      const baseRadius = Math.min(width, height) * 0.175;

      // Realistic Avee Player Bass Beat Pulse
      // Kick beat at rhythm tempo
      const beatFreq = time * 7.5;
      const rawBeat = Math.sin(beatFreq);
      const beatPulse = isPlaying && rawBeat > 0.25 ? Math.pow(rawBeat - 0.25, 1.2) * 1.6 : 0;
      const pulsedRadius = baseRadius * (1 + beatPulse * 0.10);

      // 1. Ambient Center Glow Pulse
      ctx.save();
      const radialGlow = ctx.createRadialGradient(cx, cy, pulsedRadius * 0.7, cx, cy, pulsedRadius * 1.7);
      radialGlow.addColorStop(0, `${glowColor}33`);
      radialGlow.addColorStop(0.5, `${accentColor}18`);
      radialGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, pulsedRadius * 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Flying Sparkles & Comet Particles (Avee Player Style)
      if (data.particlesEnabled !== false) {
        ctx.save();
        ctx.lineCap = 'round';

        particlesRef.current.forEach(p => {
          if (isPlaying) {
            p.dist += p.speed * (1 + beatPulse * 1.5);
          } else {
            p.dist += p.speed * 0.35;
          }

          const maxDist = Math.max(width, height) * 0.72;
          if (p.dist > maxDist) {
            p.dist = pulsedRadius + 4;
            p.angle = Math.random() * Math.PI * 2;
            p.speed = 1.8 + Math.random() * 4.0;
            p.color = Math.random() > 0.4 ? glowColor : accentColor;
          }

          const headX = cx + Math.cos(p.angle) * p.dist;
          const headY = cy + Math.sin(p.angle) * p.dist;
          const tailDist = Math.max(pulsedRadius, p.dist - p.length * (1 + beatPulse * 1.1));
          const tailX = cx + Math.cos(p.angle) * tailDist;
          const tailY = cy + Math.sin(p.angle) * tailDist;

          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = p.width;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.stroke();

          // Sparkle diamond head
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(headX, headY, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // 3. Avee Player Radial Audio Wave Spectrum (80 Bars radiating outward)
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = glowColor;

      for (let i = 0; i < numBars; i++) {
        const theta = (i / numBars) * Math.PI * 2 - Math.PI / 2;

        // Symmetric frequency harmonics like Avee Player
        const normIdx = Math.abs(i - numBars / 2) / (numBars / 2);
        const bassImpact = Math.pow(1 - normIdx, 1.8);
        const h1 = Math.sin(i * 0.42 + time * 5.2);
        const h2 = Math.cos(i * 0.85 - time * 7.1);
        const h3 = Math.sin(i * 1.6 + time * 10.4);
        let rawMag = Math.abs(h1 * 0.45 + h2 * 0.35 + h3 * 0.2);

        if (isPlaying) {
          rawMag = (rawMag * 0.65 + 0.15) * (0.8 + bassImpact * 0.8) * (1 + beatPulse * 1.1);
        } else {
          rawMag = rawMag * 0.22 + 0.06;
        }

        // Decay smoothing
        barPeaks[i] = Math.max(rawMag, barPeaks[i] * 0.86);
        const currentMag = barPeaks[i];

        const maxBarH = Math.min(width, height) * 0.16;
        const barH = Math.max(3, maxBarH * currentMag);

        const inX = cx + Math.cos(theta) * pulsedRadius;
        const inY = cy + Math.sin(theta) * pulsedRadius;
        const outX = cx + Math.cos(theta) * (pulsedRadius + barH);
        const outY = cy + Math.sin(theta) * (pulsedRadius + barH);

        // Gradient coloring from inner glow to outer accent
        const grad = ctx.createLinearGradient(inX, inY, outX, outY);
        grad.addColorStop(0, glowColor);
        grad.addColorStop(0.7, accentColor);
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(2, (Math.PI * 2 * pulsedRadius / numBars) * 0.62);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(inX, inY);
        ctx.lineTo(outX, outY);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Glowing Perimeter Circle Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, pulsedRadius, 0, Math.PI * 2);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3.2;
      ctx.shadowBlur = 24;
      ctx.shadowColor = glowColor;
      ctx.stroke();

      // Inner Dark Ring Base
      ctx.beginPath();
      ctx.arc(cx, cy, pulsedRadius - 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#060608';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, glowColor, accentColor, data.particlesEnabled, data.waveBars]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#040406',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Background Layer with BMW / Studio Texture & Avee Beat Shake */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }}>
        <img
          src={displayBg}
          alt="Avee Visualizer Background"
          onError={handleImgError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.85,
            filter: 'contrast(1.18) brightness(0.88)',
            transform: isPlaying && data.bassShake ? 'scale(1.025)' : 'scale(1)',
            transition: 'transform 0.12s ease'
          }}
        />

        {/* Top Light Accent Curve (from Avee Player .viz file) */}
        {lightAccent && (
          <div style={{
            position: 'absolute',
            top: '-5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '900px',
            opacity: 0.6,
            mixBlendMode: 'screen',
            pointerEvents: 'none'
          }}>
            <img
              src={lightAccent}
              alt="Light Accent"
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Deep Vignette Shading (internalres:vignette80 in .viz) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.12) 20%, rgba(0,0,0,0.65) 80%, #000000 100%)',
          mixBlendMode: 'multiply'
        }} />

        {/* Dynamic Neon Floor & Center Ambient Splash */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at center 48%, ${glowColor}25 0%, transparent 68%)`,
          pointerEvents: 'none'
        }} />
      </div>

      {/* 60FPS Canvas for Radial Bars, Rings, and Particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      />

      {/* Center Logo Badge - Positioned to perfectly match the visualizer ring */}
      <div style={{
        position: 'absolute',
        top: '48%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        width: '28%',
        maxWidth: '185px',
        aspectRatio: '1/1',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: `0 0 40px ${glowColor}77, inset 0 0 20px rgba(0,0,0,0.8)`,
        transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
        backgroundColor: '#07080c'
      }}>
        {data.centerTextMode ? (
          // Text Mode: DJ Name & Subtitle
          <div style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #18181b 0%, #060608 90%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}>
            <span style={{
              fontFamily: "'Montserrat', 'Impact', sans-serif",
              fontSize: 'clamp(1.1rem, 3.2vw, 1.7rem)',
              fontWeight: '900',
              color: glowColor,
              textShadow: `0 0 16px ${glowColor}aa`,
              letterSpacing: '0.05em',
              lineHeight: 1.1
            }}>
              {djName}
            </span>
            <span style={{
              fontFamily: "'Montserrat', 'Arial Black', sans-serif",
              fontSize: 'clamp(0.85rem, 2.4vw, 1.2rem)',
              fontWeight: '900',
              fontStyle: 'italic',
              color: '#ef4444',
              letterSpacing: '0.08em',
              marginTop: '2px'
            }}>
              {djSubtitle}
            </span>
          </div>
        ) : (
          // Logo Mode: Cleanly scaled center image (Fharid Fvnky / YT DAMZZ / Uploaded)
          <img
            src={displayLogo}
            alt="Center DJ Logo"
            onError={handleImgError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))'
            }}
          />
        )}
      </div>

      {/* Social Media Overlay (Avee Player visualizer_36: Kharis Sopan Branding) */}
      {data.socialOverlay && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 15,
          pointerEvents: 'none',
          width: '54%',
          maxWidth: '380px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img
            src={data.socialOverlay}
            alt="Kharis Sopan Social Overlay"
            onError={(e) => { e.target.style.display = 'none'; }}
            style={{
              width: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.9))'
            }}
          />
        </div>
      )}

      {/* Bottom Translucent Avee Player Controller Bar */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        right: '16px',
        zIndex: 20,
        background: 'rgba(7, 8, 14, 0.86)',
        backdropFilter: 'blur(18px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
      }}>
        {/* Play / Pause Toggle Button */}
        <button
          onClick={onTogglePlay}
          style={{
            width: '38px',
            height: '38px',
            minWidth: '38px',
            borderRadius: '50%',
            background: glowColor,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#09090b',
            cursor: 'pointer',
            boxShadow: `0 0 18px ${glowColor}aa`,
            transition: 'transform 0.15s ease'
          }}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} fill="#09090b" /> : <Play size={18} fill="#09090b" style={{ marginLeft: '2px' }} />}
        </button>

        {/* Track Title & Artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: '800',
            color: '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.02em'
          }}>
            {songTitle}
          </div>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            color: glowColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Disc3 size={13} className={isPlaying ? 'spin-slow' : ''} />
            <span>{artist}</span>
          </div>

          {/* Mini Neon Progress Bar */}
          <div style={{
            width: '100%',
            height: '3.5px',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: '2px',
            marginTop: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${glowColor}, ${accentColor})`,
              boxShadow: `0 0 10px ${glowColor}`
            }} />
          </div>
        </div>

        {/* Timecode Badge */}
        <div style={{
          fontSize: '0.68rem',
          fontWeight: '700',
          color: '#e2e8f0',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap'
        }}>
          {currentTimeStr} / {durationStr}
        </div>
      </div>
    </div>
  );
}
