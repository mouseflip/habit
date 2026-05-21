import React from 'react';
import { Clock, Calendar, ChevronRight } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useFirebase } from '../FirebaseContext';

export default function HistoryTab() {
  const { theme } = useTheme();
  const { logs } = useFirebase();

  // Use logs from Firebase if available, fallback to localStorage for guests
  const currentLogs = logs.length > 0 ? logs : JSON.parse(localStorage.getItem('performance_logs') || '[]');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold uppercase tracking-tighter ${theme === 'gamer' ? 'text-cyan-400' : 'text-stone-900'}`}>
          Performance Logs
        </h2>
        <div className={`text-[10px] px-2 py-1 rounded border ${theme === 'gamer' ? 'border-cyan-500/30 text-cyan-400' : 'border-stone-200 text-stone-500'}`}>
          {logs.length > 0 ? 'CLOUD SYNC ACTIVE' : 'LAST 7 DAYS (LOCAL)'}
        </div>
      </div>

      <div className="space-y-2">
        {currentLogs.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl opacity-30">
            No data points recorded
          </div>
        ) : (
          currentLogs.map((row: any, i: number) => (
            <div 
              key={row.id || i}
              className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border
                ${theme === 'gamer' 
                  ? 'bg-slate-900/50 border-cyan-500/10 hover:border-cyan-500/40 hover:bg-slate-900' 
                  : 'bg-white border-stone-100 hover:border-emerald-200 hover:shadow-sm'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${theme === 'gamer' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-stone-50 text-stone-600'}`}>
                {row.type === 'workout' ? '🏋️' : '🥗'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold uppercase ${theme === 'gamer' ? 'text-white' : 'text-stone-900'}`}>
                    {row.type} Analysis
                  </span>
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    theme === 'gamer' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {row.score}%
                  </span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${theme === 'gamer' ? 'text-cyan-400/60' : 'text-stone-500'}`}>
                  {row.feedbackPoints ? row.feedbackPoints.join('. ') : row.feedback}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className={`text-[10px] font-mono ${theme === 'gamer' ? 'text-cyan-400/40' : 'text-stone-400'}`}>
                  {new Date(row.timestamp).toLocaleDateString()}
                </div>
                <ChevronRight className={`w-4 h-4 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                  theme === 'gamer' ? 'text-cyan-400' : 'text-stone-300'
                }`} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
