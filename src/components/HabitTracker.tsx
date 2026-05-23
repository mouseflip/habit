import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../FirebaseContext';
import { 
  Book, CheckCircle2, Circle, Droplets, Laptop, Timer, Plus, 
  Minus, Trophy, Zap, Ghost, Skull, Shield, Heart, Sparkles, 
  Activity, Flame, Activity as GameIcon, Target, Brain
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import confetti from 'canvas-confetti';

export default function HabitTracker() {
  const { theme } = useTheme();
  const { habits, updateHabit, userData, updateGameStats } = useFirebase();

  // Focus Timer States
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins

  // Interactive Shot Animation States
  const [isShooting, setIsShooting] = useState(false);
  const [shotType, setShotType] = useState<'jumper' | 'stepback' | 'skyhook' | 'buzzer'>('jumper');
  const [shotResult, setShotResult] = useState<'idle' | 'success' | 'miss' | 'blocked'>('idle');
  const [shotMessage, setShotMessage] = useState('');

  // Define All Habit Categories according to the SLIDE requirements
  const habitCategories = {
    academic: [
      { id: 'study', name: 'Focused Study Session', icon: Book, target: 30, unit: 'mins', desc: 'Improves Playbook IQ' },
      { id: 'homework', name: 'Homework Complete (by 8PM)', icon: Laptop, target: 1, unit: 'task', desc: 'Unlocks Step-Back Skill Move' },
    ],
    hydration: [
      { id: 'hydration', name: 'The Hydration Game', icon: Droplets, target: 8, unit: 'cups', desc: 'Avoids energy-stealing fatigue' }
    ],
    foundation: [
      { id: 'sleep', name: '8-Hour Sleep Cycle', icon: Ghost, target: 8, unit: 'hours', desc: 'Defeats Midnight Nightcrawler' },
      { id: 'nutrition', name: 'Clean Nutrition Plan', icon: Sparkles, target: 1, unit: 'day', desc: 'Blocks Junk-Food Giant' },
      { id: 'vitamins', name: 'Take Vitamins', icon: Heart, target: 1, unit: 'dose', desc: 'Daily vitals booster' },
      { id: 'stretching', name: 'Daily Agility Stretching', icon: Activity, target: 1, unit: 'routine', desc: 'Unlocks Skyhook Shot' },
      { id: 'meditation', name: 'Clutch Mind Focus', icon: Brain, target: 1, unit: 'session', desc: 'Reduces opponent steals' },
    ]
  };

  const getHabitValue = (type: string) => {
    const h = habits.find(h => h.type === type);
    return h ? h.value : 0;
  };

  const handleAdjust = async (type: string, delta: number, target: number) => {
    const current = getHabitValue(type);
    const newValue = Math.max(0, current + delta);
    await updateHabit(type, newValue, target);

    // Dynamic Game State Update: If they complete a habit, give them gold booster
    const label = type.toUpperCase().replace('_', ' ');
    if (newValue >= target && current < target) {
      const currentGold = userData?.gold || 0;
      const currentXP = userData?.xp || 0;
      await updateGameStats({
        gold: currentGold + 30,
        xp: currentXP + 50
      });
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `🏆 DRILL COMPLETED! ${label} TARGET REACHED. +30 Gold & +50 XP!`, type: "success" } 
      }));
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.8 }
      });
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `Progress updated: ${label} is now ${newValue}/${target}`, type: "info" } 
      }));
    }
  };

  // Timer logic for focus mode
  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleAdjust('study', 30, 30);
      setTimerRunning(false);
      setTimeLeft(1800);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- DERIVE FULL ACCURACY & ACTIVE OBSTACLES ACCORDING TO SLIDE ---
  const studyVal = getHabitValue('study');
  const homeworkVal = getHabitValue('homework');
  const hydrationVal = getHabitValue('hydration');
  const sleepVal = getHabitValue('sleep');
  const nutritionVal = getHabitValue('nutrition');
  const vitaminsVal = getHabitValue('vitamins');
  const stretchingVal = getHabitValue('stretching');
  const meditationVal = getHabitValue('meditation');

  // Completed counts for health category to add boost
  const completedHealth = [
    hydrationVal >= 8,
    sleepVal >= 8,
    nutritionVal >= 1,
    vitaminsVal >= 1,
    stretchingVal >= 1,
    meditationVal >= 1
  ].filter(Boolean).length;

  // Acc boosts
  const baseShootingAccuracy = 50; // Slide: "50% base shooting chance"
  const accuracyBoost = completedHealth * 5; // Slide: "Every health habit completed adds +5% shooting accuracy"
  const academicIncomplete = studyVal < 30 || homeworkVal < 1;
  const coldHandPenalty = academicIncomplete ? -20 : 0; // Slide: "-20% Cold Hand Penalty if skills/academic practice is incomplete"
  
  // Total calculated accuracy
  const shootingAccuracy = Math.max(5, Math.min(100, baseShootingAccuracy + accuracyBoost + coldHandPenalty));

  // Adversary Active States
  const isJunkFoodGiantActive = nutritionVal < 1; // Sleep nutritional habits missed
  const isMidnightNightcrawlerActive = sleepVal < 8; // Under 8 hours sleep target

  // Game Score & Stats (YOU vs OPPONENT)
  const playerScore = userData?.playerScore !== undefined ? userData?.playerScore : 50;
  const opponentScore = userData?.opponentScore !== undefined ? userData?.opponentScore : 50;
  const hp = userData?.hp !== undefined ? userData?.hp : 100;
  const gameClock = userData?.gameClock || "Q4 3:15";

  // Parse game clock to simulate countdown
  const advanceGameClock = () => {
    // Generates a mock basketball countdown look
    try {
      const parts = gameClock.split(' ');
      const q = parts[0] || "Q4";
      const timeStr = parts[1] || "3:15";
      const [mins, secs] = timeStr.split(':').map(Number);
      let newSecs = secs - 15;
      let newMins = mins;
      if (newSecs < 0) {
        newSecs = 45;
        newMins = Math.max(0, mins - 1);
      }
      if (newMins === 0 && newSecs === 0) {
        return "FINAL";
      }
      return `${q} ${newMins}:${newSecs.toString().padStart(2, '0')}`;
    } catch {
      return "Q4 2:30";
    }
  };

  // Interactive Live Basketball Launch Attempt!
  const handleShotAttempt = async (selectedType: 'jumper' | 'stepback' | 'skyhook' | 'buzzer') => {
    if (isShooting || hp <= 0) return;

    setShotType(selectedType);
    setIsShooting(true);
    setShotResult('idle');
    setShotMessage('Releasing the leather...');

    // Simulate shot delays
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Custom modifiers per shot type
    let finalAccuracy = shootingAccuracy;
    let points = 2;
    let descType = "Standard Jumper";

    if (selectedType === 'stepback') {
      points = 3;
      descType = "Step-Back 3-Pointer";
      if (isJunkFoodGiantActive) {
        finalAccuracy -= 30; // Junk-food giant block active on 3-pointers
      }
    } else if (selectedType === 'skyhook') {
      points = 2;
      finalAccuracy += 10; // Accuracy bonus
      descType = "Unstoppable Skyhook";
    } else if (selectedType === 'buzzer') {
      points = 5;
      finalAccuracy = Math.floor(shootingAccuracy * 0.4); // Very risky high points
      descType = "Half-Court Buzzer Beater";
    }

    // Determine lockouts
    if (selectedType === 'stepback' && homeworkVal < 1) {
      setShotResult('blocked');
      setShotMessage("Locked! (Finish Homework to unlock Step-Back Skill Move!)");
      setIsShooting(false);
      return;
    }
    if (selectedType === 'skyhook' && stretchingVal < 1) {
      setShotResult('blocked');
      setShotMessage("Locked! (Stretch Daily to unlock the Skyhook!)");
      setIsShooting(false);
      return;
    }

    // Roll probability
    const roll = Math.random() * 100;

    // Check Block logic under Junk-Food Giant
    if (selectedType === 'stepback' && isJunkFoodGiantActive && Math.random() < 0.4) {
      // Junk Food Giant blocks!
      setShotResult('blocked');
      setShotMessage("BLOCKED! The soda-can Junk-Food Giant swatted your shot!");
      const nextClock = advanceGameClock();
      await updateGameStats({
        hp: Math.max(0, hp - 10), // HP reduction
        opponentScore: opponentScore + 2, // Opponent scores on rebound fastbreak!
        gameClock: nextClock,
        streak: 0
      });
      setIsShooting(false);
      return;
    }

    const success = roll < finalAccuracy;

    if (success) {
      // Swish!
      setShotResult('success');
      const messages = ["SWISH! NOTHING BUT NET!", "BANG! IT'S GOOD!", "BOOMSHAKALAKA! DOWNTOWN!", "SICK DRILL WORK COOP!"];
      setShotMessage(messages[Math.floor(Math.random() * messages.length)]);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });

      // Gold and XP calculations
      const coreGold = points * 100;
      const and1Bonus = (userData?.streak || 0) >= 3 ? 50 : 0; // Streaks bonus
      const earnedGold = coreGold + and1Bonus;
      const earnedXP = points * 150;

      const nextClock = advanceGameClock();

      await updateGameStats({
        playerScore: playerScore + points,
        gold: (userData?.gold || 0) + earnedGold,
        xp: (userData?.xp || 0) + earnedXP,
        streak: (userData?.streak || 0) + 1,
        gameClock: nextClock,
        clutchFocus: (userData?.clutchFocus || 0) + (selectedType === 'skyhook' ? 2 : 1)
      });
    } else {
      // Miss
      setShotResult('miss');
      setShotMessage(Math.random() < 0.5 ? "BRICK! Caught the back iron." : "AIR BALL! Coach is crying on the sideline.");

      // Opponent steals & scores
      const meditatedBoost = meditationVal >= 1 ? 5 : 0; // Clutch focus reduces opponent steal scores
      const opponentEarned = Math.max(0, Math.random() * 100 < (50 - meditatedBoost) ? points : 0);
      const nextClock = advanceGameClock();

      await updateGameStats({
        opponentScore: opponentScore + opponentEarned,
        hp: Math.max(0, hp - 10), // Every mixed habit results in fatigue penalty
        gameClock: nextClock,
        streak: 0
      });
    }

    setIsShooting(false);
  };

  const handleRehab = async () => {
    // Rehab session to patch HP back up
    if (hp >= 100) return;
    await updateGameStats({
      hp: Math.min(100, hp + 20),
      gold: Math.max(0, (userData?.gold || 0) - 50) // Expenses 50 gold for Gatorade
    });
    confetti({
      particleCount: 50,
      colors: ['#4ade80', '#06b6d4']
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. VISUAL BASKETBALL COURT SCOREBOARD OVERLAY */}
      <div className={`p-6 rounded-[2.5rem] border-4 ${theme === 'gamer' ? 'bg-slate-900 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'bg-stone-50 border-stone-900'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase text-cyan-400">YOU</p>
            <p className="text-4xl font-extrabold italic tracking-tight">{playerScore}</p>
          </div>
          
          <div className="text-center px-4 py-2 rounded-2xl bg-black/40 min-w-[120px] border border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400">STATE MATCHUP</p>
            <p className="text-sm font-semibold tracking-tighter text-white animate-pulse">{gameClock}</p>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase text-red-500">OPPONENT</p>
            <p className="text-4xl font-extrabold italic tracking-tight text-red-500">{opponentScore}</p>
          </div>
        </div>

        {/* Stamina Fatigue Status Bar (Fatigue Penalty) */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" />
              STAMINA POWER
            </span>
            <span className={hp < 30 ? "text-red-500 font-bold animate-pulse" : ""}>
              {hp <= 0 ? "INJURED" : `${hp} HP`}
            </span>
          </div>
          
          <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${hp}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                hp <= 0 ? 'bg-slate-700' :
                hp < 30 ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' : 
                'bg-gradient-to-r from-green-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
              }`}
            />
          </div>
          
          <div className="flex justify-between items-center text-[8px] font-mono opacity-50">
            <span>FATIGUE COLD: -10 HP AT HABIT DRAFT MISS</span>
            {hp <= 0 && (
              <button 
                onClick={handleRehab}
                className="px-2 py-0.5 rounded bg-green-500 text-slate-900 font-black tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                REHAB CLINIC (Cost: 50G)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC HOOP SHOOTING INTERACTIVE CHAMBER */}
      <div className={`p-6 rounded-[2.5rem] border-4 overflow-hidden relative shadow-inner flex flex-col items-center justify-center
        ${theme === 'gamer' ? 'bg-slate-950/80 border-white/5' : 'bg-white border-stone-200'}`}>
        
        {/* Abstract basketball court vectors layout */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-48 border-2 border-dashed border-cyan-400 rounded-full" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 h-72 border-r-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 right-0 h-10 border-t-2 border-cyan-400" />
        </div>

        {/* Visual Gym Goal / Opponent Blockades Overlay */}
        <div className="relative w-full aspect-[16/9] bg-black/60 rounded-3xl border border-white/5 overflow-hidden flex flex-col items-center justify-between p-4 mb-6">
          
          {/* Basket Net */}
          <div className="flex flex-col items-center relative">
            <div className="w-16 h-3 bg-red-600 rounded-full border border-orange-500 shadow-md relative z-10" />
            <div className="w-12 h-14 border-t-0 border-x-2 border-b-2 border-dashed border-white/40 rounded-b-2xl relative -mt-0.5 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-orange-600/20 animate-ping absolute" />
            </div>
          </div>

          {/* Shooting Projectile Ball Animation */}
          <AnimatePresence>
            {isShooting && (
              <motion.div
                key="ball"
                initial={{ y: 80, x: 0, scale: 1.2, rotate: 0 }}
                animate={{ 
                  y: -100, 
                  scale: 0.6,
                  rotate: 360,
                  x: shotType === 'stepback' ? -15 : shotType === 'skyhook' ? 15 : 0 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-4xl absolute bottom-6 z-20 pointer-events-none filter drop-shadow-lg"
              >
                🏀
              </motion.div>
            )}
          </AnimatePresence>

          {/* Blockade Defenders Visualized */}
          <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 pointer-events-none">
            {isMidnightNightcrawlerActive && (
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center opacity-80"
              >
                <div className="p-1 rounded bg-fuchsia-950/80 border border-fuchsia-500 text-fuchsia-400 text-[8px] font-black uppercase tracking-tighter">Nightcrawler Active</div>
                <Ghost className="w-8 h-8 text-fuchsia-500 animate-pulse mt-1" />
              </motion.div>
            )}

            {isJunkFoodGiantActive && (
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center opacity-80"
              >
                <div className="p-1 rounded bg-yellow-950/80 border border-yellow-500 text-yellow-500 text-[8px] font-black uppercase tracking-tighter">Soda Giant Blocks</div>
                <Skull className="w-8 h-8 text-yellow-500 animate-bounce mt-1" />
              </motion.div>
            )}
          </div>

          {/* Live Outcome Overlay */}
          <div className="text-center z-10">
            {shotResult !== 'idle' ? (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-1"
              >
                <p className={`text-xl font-black italic tracking-tight uppercase ${
                  shotResult === 'success' ? 'text-green-400' : 'text-red-500'
                }`}>
                  {shotMessage}
                </p>
                <p className="text-[9px] font-mono opacity-60 uppercase">DRILL CONSOLIDATION COMPLETE</p>
              </motion.div>
            ) : (
              <p className="text-xs text-white/40 uppercase font-mono tracking-widest text-center mt-2">
                {isShooting ? "SINKING THE LEATHER..." : "SELECT DRILL SHOT BELOW"}
              </p>
            )}
          </div>
        </div>

        {/* ACCURACY CHROME DISPLAY SPEEDOMETER */}
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          <div className="p-4 rounded-2xl bg-black/10 text-center relative border border-white/5">
            <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Base Shooting</p>
            <p className="text-2xl font-black italic text-cyan-400">50%</p>
            <span className="text-[8px] tracking-tighter opacity-30">DRILL BASE</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/10 text-center relative border border-white/5">
            <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Glow Accuracy Boost</p>
            <p className={`text-2xl font-black italic ${completedHealth > 0 ? "text-green-400" : "text-white/40"}`}>
              +{accuracyBoost}%
            </p>
            <span className="text-[8px] tracking-tighter opacity-30">+{completedHealth * 5}% ACC / HEALTH DRILL</span>
          </div>
        </div>

        {/* Live Gauges for Penalties */}
        {academicIncomplete && (
          <div className="w-full text-center p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase mb-6 flex justify-center items-center gap-2 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            COLD HAND ACTIVE: -20% (Incomplete Study/Homework)
          </div>
        )}

        <div className="text-center space-y-1 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">CURRENT FORM ACCURACY</span>
          <h2 className="text-5xl font-black italic font-sans text-yellow-400 tracking-tighter">
            {shootingAccuracy}% <span className="text-lg opacity-40 text-white uppercase italic">Chance</span>
          </h2>
        </div>

        {/* Live Court Shooting Action Selectors */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            disabled={isShooting || hp <= 0}
            onClick={() => handleShotAttempt('jumper')}
            className="p-4 rounded-2xl border bg-black/20 hover:bg-slate-900 border-white/5 flex flex-col items-center justify-center text-center hover:scale-105 active:scale-95 transition-all gap-1"
          >
            <Target className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tight">Standard Jumper</span>
            <span className="text-[8px] opacity-40 font-mono">Worth +2 pts • Unlocked</span>
          </button>

          <button
            disabled={isShooting || hp <= 0}
            onClick={() => handleShotAttempt('stepback')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all gap-1
              ${homeworkVal >= 1 
                ? 'bg-black/20 border-fuchsia-500/30 hover:scale-105 active:scale-95 hover:bg-slate-900' 
                : 'bg-black/5 border-neutral-800 opacity-30 cursor-not-allowed'
              }`}
          >
            <Zap className="w-5 h-5 text-fuchsia-400 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tight">Step-Back 3PT</span>
            <span className="text-[8px] opacity-40 font-mono">
              {homeworkVal >= 1 ? "Worth +3 pts • Unlocked" : "Requires Homework"}
            </span>
          </button>

          <button
            disabled={isShooting || hp <= 0}
            onClick={() => handleShotAttempt('skyhook')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all gap-1
              ${stretchingVal >= 1 
                ? 'bg-black/20 border-green-500/30 hover:scale-105 active:scale-95 hover:bg-slate-900' 
                : 'bg-black/5 border-neutral-800 opacity-30 cursor-not-allowed'
              }`}
          >
            <Sparkles className="w-5 h-5 text-green-400 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tight">Skyhook Blockbuster</span>
            <span className="text-[8px] opacity-40 font-mono">
              {stretchingVal >= 1 ? "Worth +2 pts • +10% Accuracy" : "Requires Stretching"}
            </span>
          </button>

          <button
            disabled={isShooting || hp <= 0}
            onClick={() => handleShotAttempt('buzzer')}
            className="p-4 rounded-2xl border bg-black/20 hover:bg-slate-900 border-white/5 flex flex-col items-center justify-center text-center hover:scale-105 active:scale-95 transition-all gap-1"
          >
            <Activity className="w-5 h-5 text-yellow-400 mb-1 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-tight">Buzzer Beater</span>
            <span className="text-[8px] opacity-40 font-mono">Worth +5 pts • 40% Shot penalty</span>
          </button>
        </div>
      </div>

      {/* 3. CORE HABIT TRACKER / SCOUTING LOGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest italic">Scouting Report Categories</h2>
          <span className="text-[10px] font-mono opacity-40 uppercase">Daily Checklists</span>
        </div>

        {/* Group A: Academic Playbook */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-500/10 pb-1 flex items-center gap-1.5">
            <Book className="w-3.5 h-3.5 text-cyan-400" /> ACADEMIC PLAYBOOK
          </p>
          {habitCategories.academic.map((habit) => (
            <div 
              key={habit.id}
              className={`p-4 rounded-2xl border-2 transition-all
                ${theme === 'gamer' 
                  ? 'bg-slate-950 border-cyan-500/10 hover:border-cyan-500/30' 
                  : 'bg-white border-stone-200'}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-cyan-500/10 text-cyan-400`}>
                    <habit.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs uppercase tracking-tight block">{habit.name}</span>
                    <span className="text-[8px] opacity-50 block">{habit.desc}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAdjust(habit.id, -1, habit.target)}
                    className="p-1 rounded-lg border border-white/5 bg-white/5 text-xs hover:bg-white/10"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="min-w-[35px] text-center font-black text-sm italic">
                    {getHabitValue(habit.id)}/{habit.target}
                  </div>
                  <button 
                    onClick={() => handleAdjust(habit.id, 1, habit.target)}
                    className="p-1 rounded-lg border border-white/5 bg-white/5 text-xs hover:bg-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors 
                      ${i < (getHabitValue(habit.id) / habit.target) * 6 
                        ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                        : 'bg-black/10'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Focus Timer Embedded */}
        <div className={`p-6 rounded-[2rem] border-2 overflow-hidden relative mb-4
          ${theme === 'gamer' ? 'bg-fuchsia-950/10 border-fuchsia-500/20' : 'bg-stone-900 text-white border-stone-800'}`}>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-fuchsia-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Deep Playbook Focus Lock</span>
            </div>
            
            <div className="text-4xl font-extrabold italic tracking-tighter tabular-nums text-white">
              {formatTime(timeLeft)}
            </div>
            
            <button 
              onClick={() => setTimerRunning(!timerRunning)}
              className={`w-full py-3 rounded-xl font-black uppercase tracking-tighter transition-all text-xs
                ${timerRunning 
                  ? 'bg-red-500/20 text-red-500 border-2 border-red-500/40' 
                  : 'bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)]'}`}
            >
              {timerRunning ? 'ABORT FOCUS DRILL' : 'INITIATE focus target'}
            </button>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap className="w-16 h-16" />
          </div>
        </div>

        {/* Group B: The Hydration Game */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-500/10 pb-1 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> THE HYDRATION GAME
          </p>
          {habitCategories.hydration.map((habit) => (
            <div 
              key={habit.id}
              className={`p-4 rounded-2xl border-2 transition-all
                ${theme === 'gamer' 
                  ? 'bg-slate-950 border-cyan-500/10 hover:border-cyan-500/30' 
                  : 'bg-white border-stone-200'}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-cyan-500/10 text-cyan-400`}>
                    <habit.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs uppercase tracking-tight block">{habit.name}</span>
                    <span className="text-[8px] opacity-50 block">{habit.desc}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAdjust(habit.id, -1, habit.target)}
                    className="p-1 rounded-lg border border-white/5 bg-white/5 text-xs hover:bg-white/10"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="min-w-[35px] text-center font-black text-sm italic">
                    {getHabitValue(habit.id)}/{habit.target}
                  </div>
                  <button 
                    onClick={() => handleAdjust(habit.id, 1, habit.target)}
                    className="p-1 rounded-lg border border-white/5 bg-white/5 text-xs hover:bg-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
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

        {/* Group C: The Health Foundation */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest border-b border-yellow-500/10 pb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-yellow-400" /> THE HEALTH FOUNDATION
          </p>
          {habitCategories.foundation.map((habit) => (
            <div 
              key={habit.id}
              className={`p-4 rounded-2xl border-2 transition-all
                ${theme === 'gamer' 
                  ? 'bg-slate-950 border-white/5 hover:border-yellow-500/20' 
                  : 'bg-white border-stone-200'}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-yellow-400/10 text-yellow-400`}>
                    <habit.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs uppercase tracking-tight block">{habit.name}</span>
                    <span className="text-[8px] opacity-50 block">{habit.desc}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAdjust(habit.id, -1, habit.target)}
                    className="p-1 rounded-lg border border-white/5 bg-white/5 text-xs hover:bg-white/10"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="min-w-[35px] text-center font-black text-sm italic">
                    {getHabitValue(habit.id)}/{habit.target}
                  </div>
                  <button 
                    onClick={() => handleAdjust(habit.id, 1, habit.target)}
                    className="p-1 rounded-lg border border-white/5 bg-white/5 text-xs hover:bg-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Adversary Alerts Overlay Warnings panel */}
      <AnimatePresence>
        {(isJunkFoodGiantActive || isMidnightNightcrawlerActive) && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="p-5 rounded-[2rem] bg-red-950/20 border-2 border-red-500/30 text-white space-y-3"
          >
            <div className="flex items-center gap-2 text-red-500">
              <Skull className="w-5 h-5 animate-bounce" />
              <h3 className="text-xs font-black uppercase tracking-widest leading-none">Adversary Alerts</h3>
            </div>
            
            <div className="space-y-2">
              {isJunkFoodGiantActive && (
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1" />
                  <p className="text-[10px] opacity-80 uppercase leading-normal">
                    <span className="font-bold text-yellow-400">Junk-Food Giant</span> blocking step-backs! -30% ACC penalty to 3PT. Log Clean Nutrition to clear.
                  </p>
                </div>
              )}

              {isMidnightNightcrawlerActive && (
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1" />
                  <p className="text-[10px] opacity-80 uppercase leading-normal">
                    <span className="font-bold text-fuchsia-400">Midnight Nightcrawler</span> draining stamina! -10 HP per missed check. Log Sleep to clear.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
