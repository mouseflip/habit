import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { auth, db, signInWithPopup, googleProvider, signOut } from './lib/firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  userData: any;
  habits: any[];
  inventory: any[];
  logs: any[];
  studyPlans: any[];
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateHabit: (type: string, value: number, target: number) => Promise<void>;
  buyItem: (item: any) => Promise<void>;
  updateGameStats: (stats: any) => Promise<void>;
  addLog: (log: any) => Promise<void>;
  addStudyPlan: (plan: any) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [studyPlans, setStudyPlans] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          } else {
            setDoc(userRef, {
              xp: 0,
              gold: 500,
              hp: 100,
              level: 'Undrafted Scrub',
              clutchFocus: 0,
              tacticalIntelligence: 0,
              streak: 0,
              equippedItems: [],
              lastUpdate: new Date().toISOString()
            });
          }
        });

        // Habits
        const habitsRef = collection(db, 'users', user.uid, 'habits');
        const today = new Date().toISOString().split('T')[0];
        const qHabits = query(habitsRef, where('date', '==', today));
        onSnapshot(qHabits, (snapshot) => {
          setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Inventory
        const inventoryRef = collection(db, 'users', user.uid, 'inventory');
        onSnapshot(inventoryRef, (snapshot) => {
          setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Logs
        const logsRef = collection(db, 'users', user.uid, 'logs');
        onSnapshot(query(logsRef, orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
          setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Study Plans
        const plansRef = collection(db, 'users', user.uid, 'studyPlans');
        onSnapshot(query(plansRef, orderBy('createdAt', 'desc'), limit(5)), (snapshot) => {
          setStudyPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      } else {
        setUserData(null);
        setHabits([]);
        setInventory([]);
        setLogs([]);
        setStudyPlans([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateHabit = async (type: string, value: number, target: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const habitId = `${type}_${today}`;
    await setDoc(doc(db, 'users', user.uid, 'habits', habitId), {
      type,
      value,
      target,
      completed: value >= target,
      date: today
    });
  };

  const buyItem = async (item: any) => {
    if (!user || !userData || userData.gold < item.price) return;
    const itemId = `item_${Date.now()}`;
    
    // Atomically update gold and add item
    // Note: In production we'd use a transaction or cloud function
    await setDoc(doc(db, 'users', user.uid, 'inventory', itemId), {
      itemId: item.id,
      name: item.name,
      type: item.type,
      purchasedAt: new Date().toISOString()
    });
    
    await setDoc(doc(db, 'users', user.uid), {
      gold: userData.gold - item.price
    }, { merge: true });
  };

  const updateGameStats = async (stats: any) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), {
      ...stats,
      lastUpdate: new Date().toISOString()
    }, { merge: true });
  };

  const addLog = async (log: any) => {
    if (!user) return;
    const logId = `log_${Date.now()}`;
    await setDoc(doc(db, 'users', user.uid, 'logs', logId), log);
  };

  const addStudyPlan = async (plan: any) => {
    if (!user) return;
    const planId = `plan_${Date.now()}`;
    await setDoc(doc(db, 'users', user.uid, 'studyPlans', planId), {
      ...plan,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, loading, userData, habits, inventory, logs, studyPlans,
      signIn, logout, updateHabit, buyItem, updateGameStats, addLog, addStudyPlan 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within a FirebaseProvider');
  return context;
};
