import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { useFirebase } from '../FirebaseContext';
import { BarChart3, Medal, Trophy, Star, History, TrendingUp, Target, Shield, Zap } from 'lucide-react';

export default function WeeklyReview() {
  const { theme } = useTheme();
  const { userData, logs } = useFirebase();

  const badges = [
    { title: 'The Hat Trick', icon: Trophy, color: 'text-yellow-400', desc: '3 habits completed in one day' },
    { title: 'DPOTY', icon: Shield, color: 'text-cyan-400', desc: 'Defensive Player of the Year - 7 days of hydration' },
    { title: 'Clutch King', icon: Zap, color: 'text-fuchsia-400', desc: 'Finished homework before 8PM 5 times' },
  ];

  return (
    <div className="space-y-6">
      {/* Prime Stats Hero */}
      <div className={`p-8 rounded-[2.5rem] border-4 overflow-hidden relative
        ${theme === 'gamer' ? 'bg-slate-900 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'bg-stone-50 border-stone-900'}`}>
        <div className="relative z-10 flex flex-col items-center">
          <Medal className="w-12 h-12 text-yellow-400 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Scouting Report</p>
          <h2 className="text-4xl font-black italic uppercase italic leading-none mb-4">SEASON PERFORMANCE</h2>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="text-center p-4 rounded-2xl bg-black/5">
              <p className="text-[9px] font-black uppercase opacity-40">Win Streak</p>
              <p className="text-2xl font-black italic">{userData?.streak || 0} GAMES</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-black/5">
              <p className="text-[9px] font-black uppercase opacity-40">Avg Accuracy</p>
              <p className="text-2xl font-black italic">68.4%</p>
            </div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <History className="w-32 h-32" />
        </div>
      </div>

      {/* Hall of Fame Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-tighter">Hall of Fame Badges</h3>
          <span className="text-[10px] font-mono opacity-40">COLLECTION_SYNC: OK</span>
        </div>
        
        <div className="space-y-3">
          {badges.map((badge, i) => (
            <motion.div 
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-2xl border-2 flex items-center gap-4
                ${theme === 'gamer' ? 'bg-slate-950 border-white/5' : 'bg-white border-stone-100'}`}
            >
              <div className={`p-3 rounded-xl bg-black/5 ${badge.color}`}>
                <badge.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tighter">{badge.title}</h4>
                <p className="text-[10px] opacity-40 uppercase font-mono">{badge.desc}</p>
              </div>
              <div className="ml-auto opacity-20">
                <Medal className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Motivational Quote Section */}
      <div className={`p-6 rounded-3xl border-2 italic text-center
        ${theme === 'gamer' ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400' : 'bg-stone-50 border-stone-100 text-stone-600'}`}>
        <p className="text-sm font-medium tracking-tight">
          "The separation in talent is small; the separation in focus is massive."
        </p>
        <p className="text-[10px] font-black uppercase mt-2 opacity-40">— COACH GRIND</p>
      </div>

      {/* Mini Chart Area */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-tighter">Shot Accuracy (Last 7 Days)</p>
        <div className="flex items-end justify-between h-20 gap-1 px-2">
          {[65, 82, 45, 90, 75, 88, 92].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                className={`w-full rounded-t-lg ${val > 80 ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-black/10'}`}
              />
              <span className="text-[8px] font-mono opacity-40 uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
