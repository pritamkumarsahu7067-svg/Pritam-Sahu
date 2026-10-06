import React, { useEffect, useRef } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Trophy, CheckCircle, Flame, Clock, Award, X, ArrowRight } from 'lucide-react';

export const FinishWorkoutModal: React.FC = () => {
  const { completedModalData, closeCompletedModal, settings, setActiveTab } = useWorkout();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!completedModalData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }

    // Subtle 2026 palette: neon lime, electric blue, purple, white
    const colors = ['#B7FF00', '#4D8DFF', '#8B5CF6', '#FFFFFF'];
    const particles: Particle[] = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 1) * 8 - 2,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (particles.some(p => p.y < canvas.height + 40)) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [completedModalData]);

  if (!completedModalData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-10 w-full h-full"
      />

      <div className="relative z-20 w-full max-w-md bg-[#15181D] border border-white/[0.08] rounded-[20px] p-6 shadow-2xl flex flex-col gap-5 text-center">
        <button
          onClick={closeCompletedModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#1C2026] hover:bg-white/10 flex items-center justify-center text-[#8A9099] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Victory Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#B7FF00]/10 border border-[#B7FF00]/30 flex items-center justify-center text-[#B7FF00] shadow-neon-glow">
          <Trophy className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Header */}
        <div>
          <span className="text-[10px] font-mono font-bold text-[#B7FF00] uppercase tracking-widest block mb-1">
            WORKOUT COMPLETED
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {completedModalData.title}
          </h2>
          <p className="text-xs text-[#8A9099] mt-0.5 font-mono">
            Session saved successfully
          </p>
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-3 gap-2 bg-[#1C2026] border border-white/5 rounded-2xl p-3.5">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#8A9099] font-mono flex items-center gap-1 uppercase">
              <Flame className="w-3 h-3 text-[#B7FF00]" /> Volume
            </span>
            <span className="font-mono text-base font-black text-white mt-1 tabular-nums">
              {completedModalData.totalVolume.toLocaleString()} {settings.unit.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-white/5">
            <span className="text-[10px] text-[#8A9099] font-mono flex items-center gap-1 uppercase">
              <Clock className="w-3 h-3 text-[#4D8DFF]" /> Time
            </span>
            <span className="font-mono text-base font-black text-white mt-1 tabular-nums">
              {completedModalData.durationMinutes}m
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#8A9099] font-mono flex items-center gap-1 uppercase">
              <CheckCircle className="w-3 h-3 text-[#B7FF00]" /> Sets
            </span>
            <span className="font-mono text-base font-black text-white mt-1 tabular-nums">
              {completedModalData.totalSets}
            </span>
          </div>
        </div>

        {/* PR Celebrations */}
        {completedModalData.prsAchieved.length > 0 && (
          <div className="flex flex-col gap-2 text-left bg-[#1C2026] border border-[#B7FF00]/30 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#B7FF00] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>NEW PERSONAL RECORDS ({completedModalData.prsAchieved.length})</span>
            </div>
            <div className="flex flex-col gap-2 mt-1">
              {completedModalData.prsAchieved.map((pr, idx) => (
                <div key={idx} className="bg-[#0B0D10] p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-white uppercase">{pr.exerciseName}</span>
                    <span className="font-mono font-black text-[#B7FF00]">{pr.description}</span>
                  </div>
                  {pr.previousRecord && (
                    <div className="text-[10px] text-[#8A9099] mt-0.5 font-mono">
                      Previous: {pr.previousRecord}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={() => {
              closeCompletedModal();
              setActiveTab('history');
            }}
            className="flex-1 py-3 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white font-bold text-xs transition-colors cursor-pointer border border-white/5"
          >
            View History
          </button>
          <button
            onClick={() => {
              closeCompletedModal();
              setActiveTab('home');
            }}
            className="flex-1 py-3 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] font-black text-xs transition-all cursor-pointer shadow-neon-sm"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
