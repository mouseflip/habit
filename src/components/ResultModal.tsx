import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2, XCircle, Star, Zap, Target } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    score: number;
    feedbackPoints?: string[];
  } | null;
}

export default function ResultModal({ isOpen, onClose, result }: ResultModalProps) {
  const { theme } = useTheme();

  if (!result) return null;

  const isSuccess = result.score >= 70;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-sm rounded-[2.5rem] border-4 p-8 overflow-hidden
              ${theme === 'gamer' ? 'bg-slate-900 border-cyan-500 shadow-[0_20px_50px_rgba(6,182,212,0.3)]' : 'bg-white border-stone-900'}`}
          >
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Trophy className="w-40 h-40" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 
                ${isSuccess ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {isSuccess ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Drill Performance Result</p>
              <h2 className="text-4xl font-black italic uppercase leading-none mb-2">
                {isSuccess ? 'NOTHING BUT NET' : 'AIR BALL'}
              </h2>
              
              <div className="flex items-center gap-1 mb-6">
                <div className="text-5xl font-black italic tracking-tighter text-cyan-500">{result.score}</div>
                <div className="text-xl font-black opacity-20 uppercase">PTS</div>
              </div>

              <div className="w-full space-y-2 mb-8">
                {result.feedbackPoints?.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 text-left p-3 rounded-xl bg-black/5">
                    <Target className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold uppercase leading-tight opacity-70">{point}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className={`w-full py-4 rounded-2xl font-black uppercase text-xs transition-all shadow-lg
                  ${theme === 'gamer' ? 'bg-cyan-500 text-slate-900' : 'bg-stone-900 text-white'}`}
              >
                BACK TO GYM
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
