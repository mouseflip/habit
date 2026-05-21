import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useFirebase } from './FirebaseContext';
import VideoUploadZone from './components/VideoUploadZone';
import HistoryTab from './components/HistoryTab';
import ResultModal from './components/ResultModal';
import StudyAssistant from './components/StudyAssistant';
import HabitTracker from './components/HabitTracker';
import AvatarPage from './components/AvatarPage';
import RewardShop from './components/RewardShop';
import WeeklyReview from './components/WeeklyReview';
import { Gamepad2, Microscope, Zap, Database, User, Settings, LogOut, TrendingUp, BookOpen, LogIn, ShoppingBag, LayoutGrid, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface LogEntry {
  timestamp: string;
  type: string;
  score: number;
  feedbackPoints?: string[];
}

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { user, userData, signIn, logout, updateGameStats, addLog, loading, habits } = useFirebase();
  const [activeTab, setActiveTab] = useState<'hub' | 'avatar' | 'shop' | 'weekly' | 'study' | 'settings'>('hub');
  const [lastResult, setLastResult] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derived Values
  const gold = userData?.gold || 0;
  const xp = userData?.xp || 0;
  const hp = userData?.hp || 100;

  const handleAnalysis = async (data: any) => {
    if (data.score) {
      const newEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        type: 'workout',
        score: data.score,
        feedbackPoints: data.feedbackPoints || []
      };

      if (user) {
        await addLog(newEntry);
        // "Shot Attempt" Logic: 
        const completedHabits = habits.filter(h => h.completed).length;
        const accuracyBoost = completedHabits * 5;
        const totalAccuracy = 50 + accuracyBoost;
        const isSuccess = Math.random() * 100 < totalAccuracy;

        if (isSuccess) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
          await updateGameStats({
            gold: gold + 200,
            xp: xp + 500,
            streak: (userData?.streak || 0) + 1,
            tacticalIntelligence: (userData?.tacticalIntelligence || 0) + 1
          });
        } else {
          await updateGameStats({
            hp: Math.max(0, hp - 10),
            streak: 0
          });
        }
      }

      setLastResult(newEntry);
      setIsModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-4xl font-black italic text-cyan-500"
        >
          SYNCING...
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'hub', label: 'Playground', icon: LayoutGrid },
    { id: 'avatar', label: 'Pro Avatar', icon: User },
    { id: 'shop', label: 'Kicks', icon: ShoppingBag },
    { id: 'weekly', label: 'Scouting', icon: Calendar },
    { id: 'study', label: 'Playbook', icon: BookOpen },
    { id: 'settings', label: 'System', icon: Settings },
  ];

  return (
    <div className={`h-full flex flex-col ${theme === 'gamer' ? 'bg-slate-950 text-white' : 'bg-stone-50 text-stone-900'}`}>
      <ResultModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        result={lastResult} 
      />

      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">GRIT &<br/>GLOW-UP</h1>
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">The Hall of Fame Journey</p>
          </div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-48 h-48 rounded-full border-4 border-cyan-500/20 flex items-center justify-center relative"
          >
             <Zap className="w-20 h-20 text-cyan-500" />
             <div className="absolute inset-0 border-4 border-dashed border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
          </motion.div>
          <button 
            onClick={signIn}
            className="w-full max-w-[280px] py-4 bg-cyan-500 text-slate-900 font-black uppercase rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.4)] active:scale-95 transition-all text-sm"
          >
            BEGIN MISSION
          </button>
        </div>
      ) : (
        <>
          <header className={`px-6 py-4 flex items-center justify-between border-b ${theme === 'gamer' ? 'border-white/5' : 'border-black/5'}`}>
            <div className="flex items-center gap-3">
               <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-cyan-500/50" />
               <div className="leading-tight">
                  <h1 className="text-lg font-black italic uppercase truncate max-w-[120px]">
                    {user.displayName?.split(' ')[0]}
                  </h1>
                  <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400">LVL {Math.floor(xp / 1000) + 1}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] font-black text-yellow-400 italic">{gold} G</span>
                <span className="text-[10px] font-black text-white/40 uppercase mt-1">HP: {hp}</span>
              </div>
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-xl border-2 transition-all
                  ${theme === 'gamer' ? 'bg-slate-900 border-cyan-500/20 text-cyan-400' : 'bg-white border-stone-200'}`}
              >
                {theme === 'gamer' ? <Gamepad2 className="w-4 h-4" /> : <Microscope className="w-4 h-4" />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-32">
            <AnimatePresence mode="wait">
              {activeTab === 'hub' && (
                <motion.div 
                  key="hub"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="p-6 space-y-8"
                >
                  <HabitTracker />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-black uppercase tracking-tighter italic">Shot Attempts</h2>
                      <span className="text-[10px] font-mono opacity-40 uppercase">Video Drill Analysis</span>
                    </div>
                    <VideoUploadZone onAnalysisComplete={handleAnalysis} />
                  </div>
                </motion.div>
              )}
              {activeTab === 'avatar' && <motion.div key="avatar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><AvatarPage /></motion.div>}
              {activeTab === 'shop' && <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><RewardShop /></motion.div>}
              {activeTab === 'weekly' && <motion.div key="weekly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6"><WeeklyReview /></motion.div>}
              {activeTab === 'study' && <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4"><StudyAssistant /></motion.div>}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                   <div className={`p-6 rounded-3xl border-2 ${theme === 'gamer' ? 'bg-slate-900 border-white/5' : 'bg-stone-50 border-stone-100'}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <img src={user.photoURL || ''} alt="" className="w-16 h-16 rounded-2xl border-2 border-cyan-500 p-0.5" />
                      <div>
                        <h3 className="font-black italic text-lg uppercase leading-tight">{user.displayName}</h3>
                        <p className="text-[10px] uppercase opacity-40 font-mono mt-1">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={logout}
                      className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Terminate Session
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <nav className={`fixed bottom-0 left-0 right-0 h-24 px-6 flex items-center justify-between z-40 border-t backdrop-blur-xl
            ${theme === 'gamer' ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-stone-100'}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center gap-1 transition-all
                  ${activeTab === tab.id 
                    ? (theme === 'gamer' ? 'text-cyan-400' : 'text-stone-900') 
                    : 'text-stone-400/50 hover:text-stone-400'
                  }`}
              >
                <div className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? (theme === 'gamer' ? 'bg-cyan-500/10' : 'bg-stone-100') : ''}`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

function PhoneLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <div className={`h-screen w-screen flex items-center justify-center transition-colors duration-500 overflow-hidden ${
      theme === 'gamer' ? 'bg-slate-950' : 'bg-stone-200'
    }`}>
      <div className={`relative w-full max-w-[450px] h-full flex flex-col shadow-2xl overflow-hidden transition-colors duration-500 ${
        theme === 'gamer' ? 'bg-slate-950 border-x border-white/5' : 'bg-stone-50 border-x border-stone-200'
      }`}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PhoneLayout>
        <Dashboard />
      </PhoneLayout>
    </ThemeProvider>
  );
}
