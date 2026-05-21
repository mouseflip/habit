import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { useFirebase } from '../FirebaseContext';
import { ShoppingBag, Star, Zap, Shield, Sparkles, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RewardShop() {
  const { theme } = useTheme();
  const { userData, buyItem, inventory } = useFirebase();

  const shopItems = [
    { 
      id: 'glow_zooms', 
      name: 'Elite Glow-Zooms', 
      price: 2000, 
      type: 'sneakers', 
      icon: '👟', 
      bonus: '+15 Speed',
      description: 'Engineered for high-intensity study sessions.'
    },
    { 
      id: 'neon_thread', 
      name: 'Neon Thread Jersey', 
      price: 1500, 
      type: 'jersey', 
      icon: '🎽', 
      bonus: '+10 Intelligence',
      description: 'Luminous fiber for ultimate visibility.'
    },
    { 
      id: 'clutch_bands', 
      name: 'Focus Wristbands', 
      price: 500, 
      type: 'accessory', 
      icon: '⌚', 
      bonus: '+5 Clutch',
      description: 'Reduces distraction interference by 12%.'
    },
    { 
      id: 'vibe_check', 
      name: 'Vibe-Check Socks', 
      price: 200, 
      type: 'socks', 
      icon: '🧦', 
      bonus: '+2 Style',
      description: 'Comfortable cotton for all-day focus.'
    },
  ];

  const handlePurchase = async (item: any) => {
    if (userData?.gold >= item.price) {
      await buyItem(item);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const isPurchased = (itemId: string) => {
    return inventory.some(i => i.itemId === itemId);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Section */}
      <div className={`p-4 rounded-3xl border-2 flex items-center justify-between
        ${theme === 'gamer' ? 'bg-slate-900 border-yellow-500/30' : 'bg-stone-50 border-stone-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.4)]">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase opacity-60">Reward Points</p>
            <p className="text-xl font-black italic">{userData?.gold || 0} G</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase opacity-60">Level Progress</p>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black">LVL {Math.floor((userData?.xp || 0) / 1000) + 1}</span>
            <div className="w-16 h-1 w-full bg-black/10 rounded-full">
              <div className="h-full bg-cyan-500" style={{ width: `${((userData?.xp || 0) % 1000) / 10}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {shopItems.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ y: -5 }}
            className={`p-5 rounded-[2rem] border-2 flex flex-col items-center text-center relative overflow-hidden
              ${theme === 'gamer' ? 'bg-slate-950 border-white/10' : 'bg-white border-stone-100'}`}
          >
            <div className="text-4xl mb-4 p-4 rounded-3xl bg-black/5">
              {item.icon}
            </div>
            
            <h4 className="text-xs font-black uppercase tracking-tighter mb-1 leading-tight">{item.name}</h4>
            <p className="text-[9px] opacity-40 uppercase font-mono mb-4">{item.description}</p>
            
            <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase mb-4
              ${theme === 'gamer' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-stone-100 text-stone-600'}`}>
              {item.bonus}
            </div>

            <button 
              disabled={isPurchased(item.id) || (userData?.gold < item.price)}
              onClick={() => handlePurchase(item)}
              className={`w-full py-2.5 rounded-2xl font-black text-xs uppercase transition-all
                ${isPurchased(item.id)
                  ? 'bg-green-500/10 text-green-500 cursor-default'
                  : userData?.gold >= item.price
                    ? theme === 'gamer' 
                      ? 'bg-yellow-400 text-slate-900 shadow-[0_4px_12px_rgba(250,204,21,0.3)] hover:scale-105'
                      : 'bg-stone-900 text-white'
                    : 'bg-black/5 text-black/20'}`}
            >
              {isPurchased(item.id) ? 'EQUIPPED' : `${item.price} G`}
            </button>

            {isPurchased(item.id) && (
              <div className="absolute top-2 right-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="p-6 border-2 border-dashed rounded-3xl opacity-30 text-center">
        <p className="text-[10px] font-black uppercase italic tracking-widest">More gear coming soon...</p>
      </div>
    </div>
  );
}
