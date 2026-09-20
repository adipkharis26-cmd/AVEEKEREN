import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Disc3, Volume2 } from 'lucide-react';

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

  const glowColor = data.glowColor || '#facc15';
  const accentColor = data.accentColor || '#22c55e';
  const displayLogo = data.centerLogo || data.coverImage || '/dj_default_logo.svg';
  const displayBg = data.bgImage || '/dj_desk_setup.jpg';

  const djName = data.djName || 'Keyra';
  const djSubtitle = data.djSubtitle || 'Fvnky';
  const songTitle = data.songTitle || 'DJ THE ONE THAT GOT AWAY';
  const artist = data.artist || 'BREAKBEAT REMIX FULL BASS VIRAL';

  // Initialize flying comet particles
  useEffect(() => {
    const count = 32;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 70 + Math.random() * 180,
        speed: 2 + Math.random() * 4.5,
        length: 12 + Math.random() * 22,
        width: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
        color: Math.random() > 0.4 ? glowColor : accentColor
      });
    }
    particlesRef.current = particles;
  }, [glowColor, accentColor]);

  // 60FPS Visualizer Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const render = () => {
      time += isPlaying ? 0.045 : 0.012;
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.18;

      // Bass beat pulse calculation
      const beatFreq = time * 8;
      const rawBeat = Math.sin(beatFreq);
      const beatPulse = isPlaying && rawBeat > 0.3 ? (rawBeat - 0.3) * 1.4 : 0;
      const pulsedRadius = baseRadius * (1 + beatPulse * 0.09);

      // 1. Draw Flying Comet Particles / Shards
      if (data.particlesEnabled !== false) {
        ctx.save();
        ctx.lineCap = 'round';

        particlesRef.current.forEach(p => {
          if (isPlaying) {
            p.dist += p.speed * (1 + beatPulse * 1.6);
          } else {
            p.dist += p.speed * 0.3;
          }

          const maxDist = Math.max(width, height) * 0.75;
          if (p.dist > maxDist) {
            p.dist = pulsedRadius + 5;
            p.angle = Math.random() * Math.PI * 2;
            p.speed = 2 + Math.random() * 4.5;
            p.color = Math.random() > 0.4 ? glowColor : accentColor;
          }

          const headX = cx + Math.cos(p.angle) * p.dist;
          const headY = cy + Math.sin(p.angle) * p.dist;
          const tailDist = Math.max(pulsedRadius, p.dist - p.length * (1 + beatPulse * 1.2));
          const tailX = cx + Math.cos(p.angle) * tailDist;
          const tailY = cy + Math.sin(p.angle) * tailDist;

          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = p.width;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.stroke();

          // Bright diamond particle tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(headX, headY, p.width * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // 2. Outer Radial Audio Wave Spectrum
      const numBars = data.waveBars || 72;
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = glowColor;

      for (let i = 0; i < numBars; i++) {
        const theta = (i / numBars) * Math.PI * 2;
        
        // Multi-harmonic audio frequency simulation
        const harmonic1 = Math.sin(i * 0.35 + time * 4);
        const harmonic2 = Math.cos(i * 0.7 - time * 6);
        const harmonic3 = Math.sin(i * 1.4 + time * 9);
        let freqMag = Math.abs(harmonic1 * 0.5 + harmonic2 * 0.35 + harmonic3 * 0.25);

        if (isPlaying) {
          freqMag = freqMag * (0.6 + beatPulse * 1.1) + 0.15;
        } else {
          freqMag = freqMag * 0.25 + 0.05;
        }

        const barLength = Math.min(width, height) * 0.14 * freqMag;
        const innerX = cx + Math.cos(theta) * pulsedRadius;
        const innerY = cy + Math.sin(theta) * pulsedRadius;
        const outerX = cx + Math.cos(theta) * (pulsedRadius + barLength);
        const outerY = cy + Math.sin(theta) * (pulsedRadius + barLength);

        // Gradient color along the bar
        const grad = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
        grad.addColorStop(0, glowColor);
        grad.addColorStop(1, accentColor);

        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(2, (Math.PI * 2 * pulsedRadius / numBars) * 0.65);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Glowing Perimeter Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, pulsedRadius, 0, Math.PI * 2);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 22;
      ctx.shadowColor = glowColor;
      ctx.stroke();

      // Inner Dark Base Circle
      ctx.beginPath();
      ctx.arc(cx, cy, pulsedRadius - 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
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
      background: '#050508',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Background Image with Ambient Vignette & Bass Shake */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }}>
        <img
          src={displayBg}
          alt="DJ Setup Background"
          onError={handleImgError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.65,
            filter: 'contrast(1.15) brightness(0.85)',
            transform: isPlaying && data.bassShake ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.15s ease'
          }}
        />
        {/* Cinematic Vignette Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.7) 85%, #000000 100%)',
          mixBlendMode: 'multiply'
        }} />
        {/* Neon Ambient Color Splash */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at center, ${glowColor}18 0%, transparent 65%)`,
          pointerEvents: 'none'
        }} />
      </div>

      {/* 60FPS Interactive Visualizer Canvas (Audio Spectrum & Comets) */}
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

      {/* Center DJ Badge (Logo / Typography) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '32%',
        maxWidth: '190px',
        aspectRatio: '1/1',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: `0 0 35px ${glowColor}66`,
        transform: isPlaying ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {data.centerTextMode ? (
          // Text Mode: Bold DJ Typography
          <div style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #18181b 0%, #09090b 90%)',
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
              fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
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
          // Image / Logo Mode: Full Customizable Center Logo Image
          <img
            src={displayLogo}
            alt="Center DJ Logo"
            onError={handleImgError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%'
            }}
          />
        )}
      </div>

      {/* Bottom Track Information Bar (Avee Player Signature Style) */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        right: '16px',
        zIndex: 20,
        background: 'rgba(9, 10, 15, 0.82)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: `1px solid rgba(255, 255, 255, 0.12)`,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.7)'
      }}>
        {/* Play / Pause Toggle Button */}
        <button
          onClick={onTogglePlay}
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            borderRadius: '50%',
            background: glowColor,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#09090b',
            cursor: 'pointer',
            boxShadow: `0 0 16px ${glowColor}88`,
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
            gap: '5px'
          }}>
            <Disc3 size={12} className={isPlaying ? 'spin-slow' : ''} />
            <span>{artist}</span>
          </div>

          {/* Mini Progress Bar */}
          <div style={{
            width: '100%',
            height: '3px',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: '2px',
            marginTop: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${glowColor}, ${accentColor})`,
              boxShadow: `0 0 8px ${glowColor}`
            }} />
          </div>
        </div>

        {/* Timecode Badge */}
        <div style={{
          fontSize: '0.68rem',
          fontWeight: '700',
          color: '#cbd5e1',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap'
        }}>
          {currentTimeStr} / {durationStr}
        </div>
      </div>
    </div>
  );
}
