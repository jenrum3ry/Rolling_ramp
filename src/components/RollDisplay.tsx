import React, { useState, useEffect } from 'react';
import { Aura } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RollDisplayProps {
  aura: Aura | null;
  isRolling: boolean;
  totalRolls: number;
}

const RollDisplay: React.FC<RollDisplayProps> = ({ aura, isRolling, totalRolls }) => {
  const [displayClass, setDisplayClass] = useState('opacity-0 scale-95');

  useEffect(() => {
    if (!isRolling && aura) {
      setDisplayClass('opacity-0 scale-90');
      const timer = setTimeout(() => {
        setDisplayClass('opacity-100 scale-100');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [aura, isRolling]);

  const themes: Record<string, string> = {
    Common: "border-gray-500/30 bg-gray-900/50",
    Rare: "border-blue-500/50 bg-blue-900/20 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]",
    Epic: "border-purple-500/50 bg-purple-900/20 shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]",
    Legendary: "border-yellow-500/60 bg-yellow-900/20 shadow-[0_0_50px_-10px_rgba(234,179,8,0.6)]",
    Exotic: "border-red-500/70 bg-red-900/20 shadow-[0_0_60px_-10px_rgba(239,68,68,0.7)] animate-reveal-glitch",
    Mythical: "border-emerald-500/80 bg-emerald-900/20 shadow-[0_0_70px_-10px_rgba(16,185,129,0.8)]",
    Celestial: "border-white/90 bg-white/10 shadow-[0_0_80px_-10px_rgba(255,255,255,0.9)]",
  };

  return (
    <div className="w-full max-w-2xl bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        {/* Character Preview */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-16 bg-gray-400 rounded-full relative overflow-hidden shadow-lg">
             <div className="absolute top-2 left-2 right-2 h-6 bg-gray-300 rounded-full opacity-50" />
             {/* Aura Glow on Character */}
             {aura && !isRolling && (
               <div className={`absolute inset-0 opacity-40 mix-blend-overlay ${aura.color.replace('text', 'bg')}`} />
             )}
          </div>
          
          {/* Aura Particles/Effect */}
          <AnimatePresence>
            {aura && !isRolling && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`w-32 h-32 blur-2xl rounded-full opacity-30 ${aura.color.replace('text', 'bg')}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                   {[...Array(12)].map((_, i) => (
                     <motion.div
                       key={i}
                       animate={{ 
                         y: [0, -100], 
                         x: [0, (Math.random() - 0.5) * 60],
                         opacity: [0, 1, 0],
                         scale: [0, 1, 0]
                       }}
                       transition={{ 
                         repeat: Infinity, 
                         duration: 1 + Math.random(), 
                         delay: Math.random() * 2 
                       }}
                       className={`absolute w-1 h-1 rounded-full ${aura.color.replace('text', 'bg')}`}
                     />
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rolling Spinner */}
        {isRolling && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-2 border-t-indigo-500 border-white/10 rounded-full"
            />
          </div>
        )}

        {/* Rarity Tag */}
        {aura && !isRolling && (
          <div className="absolute top-4 left-4">
             <div className={`px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] font-black uppercase tracking-widest ${aura.color}`}>
               {aura.name}
             </div>
             <p className="text-[10px] text-white/40 mt-1 ml-1">{totalRolls} rolls</p>
          </div>
        )}
      </div>

      {/* Manifested Info */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <AnimatePresence mode="wait">
          {aura && !isRolling ? (
            <motion.div
              key={aura.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <div>
                <h2 className={`text-2xl font-black tracking-tighter ${aura.color}`}>{aura.name}</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">1 in {aura.chance.toLocaleString()}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold ${aura.color}`}>
                {aura.tier}
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-center py-2">
               <p className="text-xs text-white/20 italic tracking-widest uppercase">
                 {isRolling ? 'Manifesting Aura...' : 'Ready to Manifest'}
               </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RollDisplay;
