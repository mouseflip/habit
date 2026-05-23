import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { useFirebase } from '../FirebaseContext';
import { User, Shield, Zap, Target, Star, Trophy, ShoppingBag } from 'lucide-react';

export default function AvatarPage() {
  const { theme } = useTheme();
  const { userData, inventory } = useFirebase();

  const stats = [
    { label: 'Clutch Focus', value: userData?.clutchFocus || 0, icon: Target, color: 'text-cyan-400' },
    { label: 'Tactical Intel', value: userData?.tacticalIntelligence || 0, icon: Shield, color: 'text-fuchsia-400' },
    { label: 'Energy Speed', value: 85, icon: Zap, color: 'text-yellow-400' },
  ];

  // Experience & Rank calculations according to slide
  const xp = userData?.xp || 0;
  const level = Math.floor(xp / 1000) + 1;
  
  let rank = 'Undrafted Scrub';
  let rankTier = 'Levels 1-4';
  if (level >= 5 && level <= 15) {
    rank = 'Role Player';
    rankTier = 'Levels 5-15';
  } else if (level >= 16 && level <= 19) {
    rank = 'Prime Starter';
    rankTier = 'Levels 16-19';
  } else if (level >= 20) {
    rank = 'Hall of Fame Legend';
    rankTier = 'Levels 20+';
  }

  return (
    <div className="space-y-6">
      {/* Avatar Visual Cabinet */}
      <div className={`aspect-[4/5] rounded-[2rem] border-4 overflow-hidden relative
        ${theme === 'gamer' ? 'bg-slate-950 border-cyan-500/30' : 'bg-stone-900 border-stone-800'}`}>
        
        {/* Abstract basketball court lines background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 border-2 border-white rounded-full" />
          <div className="absolute bottom-[-20%] left-0 right-0 h-[60%] border-t-2 border-white" />
        </div>

        {/* Character placeholder - simple geometric representation for now */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-40 h-64 flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-300 border-2 border-white mb-2" />
            <div className="w-32 h-44 rounded-t-xl bg-slate-800 border-x-4 border-t-4 border-cyan-500/50 relative overflow-hidden">
               {/* Training Jersey */}
               <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[40px] font-black italic opacity-20 text-white">
                 {String(level).padStart(2, '0')}
               </div>
               
               {/* Equipped items visual changes */}
               {inventory.some(i => i.itemId === 'mvp_jersey') && (
                 <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-yellow-500/20 border-t-8 border-yellow-400" />
               )}
               {inventory.some(i => i.itemId === 'glow_zooms') && (
                 <div className="absolute bottom-0 inset-x-0 h-4 bg-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
               )}
            </div>
          </motion.div>
        </div>

        {/* HUD Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Global Ranking ({rankTier})</p>
              <h2 className="text-2xl font-black italic uppercase leading-none">{rank}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-60">Season Streak</p>
              <p className="text-lg font-black italic text-yellow-400">{userData?.streak || 0} 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Block */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className={`p-3 rounded-2xl border-2 ${theme === 'gamer' ? 'bg-slate-900 border-white/5' : 'bg-white border-stone-100'}`}>
            <stat.icon className={`w-4 h-4 mb-1 ${stat.color}`} />
            <p className="text-[8px] font-black uppercase opacity-50 truncated leading-none mb-1">{stat.label}</p>
            <p className="text-lg font-black italic">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Equipped Gear Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-tighter">Current Loadout</h3>
          <span className="text-[10px] font-mono opacity-40">STORAGE_SLOTS: {inventory.length}/100</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {inventory.length === 0 ? (
            <div className="col-span-2 p-8 border-2 border-dashed rounded-2xl opacity-20 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase">No gear equipped</p>
            </div>
          ) : (
            inventory.map((item, i) => (
              <div key={i} className={`p-4 rounded-2xl border-2 flex items-center justify-between
                ${theme === 'gamer' ? 'bg-slate-900 border-cyan-500/20' : 'bg-white border-stone-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-xl">
                    {item.type === 'sneakers' ? '👟' : '🎽'}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                    <p className="text-[8px] opacity-40 uppercase">{item.type}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
