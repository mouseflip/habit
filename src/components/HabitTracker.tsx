import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../FirebaseContext';
import { Book, CheckCircle2, Circle, Droplets, Laptop, Timer, Plus, Minus, Trophy, Zap, Ghost, Skull } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function HabitTracker() {
  const { theme } = useTheme();
  const { habits, updateHabit, userData } = useFirebase();
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins

  const habitList = [
    { id: 'study', name: 'Study Session', icon: Book, target: 30, unit: 'mins' },
    { id: 'homework', name: 'Homework Complete', icon: Laptop, target: 1, unit: 'task' },
    { id: 'hydration', name: 'Hydration', icon: Droplets, target: 8, unit: 'cups' },
  ];

  const getHabitValue = (type: string) => {
    const h = habits.find(h => h.type === type);
    return h ? h.value : 0;
  };

  const handleAdjust = async (type: string, delta: number) => {
    const current = getHabitValue(type);
    const target = habitList.find(h => h.id === type)?.target || 1;
    await updateHabit(type, Math.max(0, current + delta), target);
  };

  // Timer logic for focus mode
  React.useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleAdjust('study', 30);
      setTimerRunning(false);
      setTimeLeft(1800);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Basketball Scoreboard Overlay */}
      <div className={`p-4 rounded-3xl border-4 ${theme === 'gamer' ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-stone-50 border-stone-900'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase opacity-60">Player</p>
            <p className="text-2xl font-black italic">64</p>
          </div>
          <div className="text-center px-4 py-1 rounded bg-black/10">
            <p className="text-[10px] font-bold uppercase">Match Up</p>
            <p className="text-xs font-mono font-bold text-red-500 animate-pulse">LIVE</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase opacity-60">CPU</p>
            <p className="text-2xl font-black italic text-red-500">72</p>
          </div>
        </div>
        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${userData?.hp || 100}%` }}
            className={`h-full ${userData?.hp < 30 ? 'bg-red-500' : 'bg-green-500'}`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-black uppercase uppercase">Fatigue Level</span>
          <span className="text-[8px] font-black uppercase">{userData?.hp || 100} HP</span>
        </div>
      </div>

      {/* Main Habits */}
      <div className="space-y-3">
        {habitList.map((habit) => (
          <div 
            key={habit.id}
            className={`p-4 rounded-2xl border-2 transition-all
              ${theme === 'gamer' 
                ? 'bg-slate-950 border-cyan-500/20 hover:border-cyan-400' 
                : 'bg-white border-stone-200'}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${theme === 'gamer' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-stone-100 text-stone-900'}`}>
                  <habit.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-tight">{habit.name}</p>
                  <p className="text-[10px] opacity-60 font-mono">GOAL: {habit.target} {habit.unit}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAdjust(habit.id, -1)}
                  className="p-1 rounded-lg border border-current opacity-30 hover:opacity-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="min-w-[40px] text-center font-black text-lg italic">
                  {getHabitValue(habit.id)}
                </div>
                <button 
                  onClick={() => handleAdjust(habit.id, 1)}
                  className="p-1 rounded-lg border border-current opacity-30 hover:opacity-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors 
                    ${i < (getHabitValue(habit.id) / habit.target) * 8 
                      ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                      : 'bg-black/10'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Focus Timer */}
      <div className={`p-6 rounded-3xl border-2 overflow-hidden relative
        ${theme === 'gamer' ? 'bg-fuchsia-950/20 border-fuchsia-500/30' : 'bg-stone-900 text-white border-stone-800'}`}>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Deep Focus Lock</span>
          </div>
          
          <div className="text-5xl font-black italic tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </div>
          
          <button 
            onClick={() => setTimerRunning(!timerRunning)}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-tighter transition-all
              ${timerRunning 
                ? 'bg-red-500/20 text-red-500 border-2 border-red-500/40' 
                : 'bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)]'}`}
          >
            {timerRunning ? 'ABORT PROTOCOL' : 'INITIATE FOCUS'}
          </button>
          
          <p className="text-[9px] opacity-40 uppercase font-mono text-center">
            {timerRunning ? 'BIOMETRIC LOCK ACTIVE' : 'LOCKED UNTIL 30 MINS COMPLETED'}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap className="w-20 h-20" />
        </div>
      </div>

      {/* Enemy Alert */}
      <AnimatePresence>
        {userData?.hp < 50 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="p-4 rounded-2xl bg-red-500 text-white flex items-center gap-3 border-4 border-red-800 animate-bounce"
          >
            <Skull className="w-6 h-6 animate-pulse" />
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">The Midnight Nightcrawler</p>
              <p className="text-[10px] font-bold opacity-80 uppercase">Energy stealing protocol active!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
