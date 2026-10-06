import React, { useEffect, useRef, useState } from 'react';

export default function PeakTransition({ onComplete }) {
  const canvasRef = useRef(null);
  const [stage, setStage] = useState(0); // 0: grid/start, 1: peak line rising, 2: DUOALPHA morph, 3: tagline, 4: exit fade

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Timeline control
    const startTime = performance.now();

    // Generate realistic stock chart peak points
    const pointsCount = 45;
    const peakPoints = [];
    let currentY = height * 0.75;
    for (let i = 0; i <= pointsCount; i++) {
      const x = (i / pointsCount) * width;
      // Upward bullish rally with realistic pullbacks and high sharp peaks
      const progress = i / pointsCount;
      const targetBaseY = height * 0.75 - progress * (height * 0.45);
      const noise = (Math.sin(i * 1.3) * 35 + Math.cos(i * 2.7) * 25) * (1 - progress * 0.3);
      currentY = targetBaseY + noise;
      peakPoints.push({ x, y: currentY, progress });
    }

    // Glowing particles along the chart
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 2 - 0.5,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.5 ? '#00E676' : '#00E5FF'
    }));

    const render = (time) => {
      const elapsed = (time - startTime) / 1000;

      // Update stage based on elapsed seconds
      if (elapsed >= 4.5) {
        setStage(4);
      } else if (elapsed >= 3.2) {
        setStage(3);
      } else if (elapsed >= 2.0) {
        setStage(2);
      } else if (elapsed >= 0.4) {
        setStage(1);
      } else {
        setStage(0);
      }

      if (elapsed >= 5.0) {
        onComplete();
        return;
      }

      ctx.fillStyle = '#07080A';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle futuristic cyber trading grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw background ambient glow
      const radialGlow = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, Math.max(width, height) * 0.6
      );
      radialGlow.addColorStop(0, 'rgba(0, 230, 118, 0.08)');
      radialGlow.addColorStop(0.5, 'rgba(0, 229, 255, 0.04)');
      radialGlow.addColorStop(1, 'rgba(7, 8, 10, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render floating upward particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Stage 1 & 2: Animate glowing market-style peak line rising upward
      if (elapsed > 0.4 && elapsed < 3.2) {
        const lineDrawProgress = Math.min((elapsed - 0.4) / 1.6, 1.0);
        const activeCount = Math.floor(peakPoints.length * lineDrawProgress);

        if (activeCount > 1) {
          // Draw Neon Chart Area Gradient under peaks
          ctx.beginPath();
          ctx.moveTo(peakPoints[0].x, height);
          for (let i = 0; i < activeCount; i++) {
            ctx.lineTo(peakPoints[i].x, peakPoints[i].y);
          }
          ctx.lineTo(peakPoints[activeCount - 1].x, height);
          ctx.closePath();

          const areaGradient = ctx.createLinearGradient(0, height * 0.3, 0, height);
          areaGradient.addColorStop(0, 'rgba(0, 230, 118, 0.22)');
          areaGradient.addColorStop(0.6, 'rgba(0, 229, 255, 0.08)');
          areaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = areaGradient;
          ctx.fill();

          // Outer Glow Line
          ctx.beginPath();
          for (let i = 0; i < activeCount; i++) {
            if (i === 0) ctx.moveTo(peakPoints[i].x, peakPoints[i].y);
            else ctx.lineTo(peakPoints[i].x, peakPoints[i].y);
          }
          ctx.strokeStyle = '#00E5FF';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#00E5FF';
          ctx.shadowBlur = 25;
          ctx.stroke();

          // Inner Vibrant Neon Green Peak Line
          ctx.beginPath();
          for (let i = 0; i < activeCount; i++) {
            if (i === 0) ctx.moveTo(peakPoints[i].x, peakPoints[i].y);
            else ctx.lineTo(peakPoints[i].x, peakPoints[i].y);
          }
          ctx.strokeStyle = '#00E676';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00E676';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Draw Candlesticks & Bullish Indicators at key peaks
          for (let i = 2; i < activeCount; i += 4) {
            const pt = peakPoints[i];
            const candleH = 22 + Math.sin(i) * 10;
            ctx.fillStyle = '#00E676';
            ctx.fillRect(pt.x - 2, pt.y - candleH / 2, 4, candleH);
            ctx.strokeStyle = 'rgba(0, 230, 118, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y - candleH / 2 - 8);
            ctx.lineTo(pt.x, pt.y + candleH / 2 + 8);
            ctx.stroke();
          }

          // Glowing Head Tracker at the leading edge
          const lead = peakPoints[activeCount - 1];
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00E5FF';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(lead.x, lead.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080A] transition-opacity duration-700 ${
      stage === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Background Interactive Market Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Center Transform Stage: DUOALPHA + Tagline */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 select-none">
        {/* Morphing Word DUOALPHA */}
        <div
          className={`transform transition-all duration-1000 ease-out ${
            stage >= 2
              ? 'opacity-100 scale-100 translate-y-0 filter-none'
              : 'opacity-0 scale-75 translate-y-8 blur-sm'
          }`}
        >
          {/* Neon Logo Badge */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#00E676]" />
            <div className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
              Institutional Terminal
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#00E5FF]" />
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight font-sans">
            <span className="bg-gradient-to-r from-[#00E676] via-[#00E5FF] to-white bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,230,118,0.4)]">
              DUOALPHA
            </span>
          </h1>
        </div>

        {/* Tagline: "Trade Together. Grow Together." */}
        <div
          className={`mt-6 transform transition-all duration-1000 delay-300 ease-out ${
            stage >= 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm sm:text-base font-semibold tracking-[0.25em] uppercase font-mono">
            <span className="text-[#00E676] drop-shadow-[0_0_12px_rgba(0,230,118,0.6)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              Trade Together.
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="text-[#00E5FF] drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] flex items-center gap-2">
              Grow Together.
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
            </span>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#00E676] border-t-transparent rounded-full" />
            Synchronizing DuoAlpha Trading Core...
          </div>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 z-20 text-xs font-mono tracking-widest text-white/40 hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-white/30 transition-all bg-[#07080A]/80 backdrop-blur"
      >
        SKIP INTRO →
      </button>
    </div>
  );
}
