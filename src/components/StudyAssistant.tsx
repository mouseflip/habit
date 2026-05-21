import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Clipboard, Calendar, Video, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { useFirebase } from '../FirebaseContext';
import { GoogleGenAI, Type } from "@google/genai";

interface StudyData {
  organizedNotes: string;
  testInfo: string | null;
  studyPlan: string;
  resources: { title: string; url: string; description: string }[];
}

export default function StudyAssistant() {
  const { theme } = useTheme();
  const { user, studyPlans, addStudyPlan } = useFirebase();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [step, setStep] = useState<'input' | 'result'>('input');

  // Load from Firebase or local storage on mount
  React.useEffect(() => {
    if (studyPlans.length > 0) {
      setStudyData(studyPlans[0] as unknown as StudyData);
      setStep('result');
    } else {
      const saved = localStorage.getItem('last_study_plan');
      if (saved) {
        try {
          setStudyData(JSON.parse(saved));
          setStep('result');
        } catch (e) {
          console.error("Failed to parse saved study plan", e);
        }
      }
    }
  }, [studyPlans]);

  const handleProcess = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: `Organize these notes and create a study plan: ${input.trim()}` }] }],
        config: {
          systemInstruction: "You are a Study Planner expert. Organize notes, extract test info, create a plan, and suggest resources.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              organizedNotes: { type: Type.STRING },
              testInfo: { type: Type.STRING, nullable: true },
              studyPlan: { type: Type.STRING },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "url", "description"]
                }
              }
            },
            required: ["organizedNotes", "studyPlan", "resources"]
          }
        }
      });
      
      const data = JSON.parse(response.text);
      if (user) {
        await addStudyPlan(data);
      } else {
        localStorage.setItem('last_study_plan', JSON.stringify(data));
      }
      setStudyData(data);
      setStep('result');
    } catch (err) {
      console.error(err);
      setError('Gemini AI error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('input');
    setStudyData(null);
    setInput('');
  };

  // Custom Palette from JSON
  const palette = {
    primary: '#2f5da8',
    primaryLight: '#d7e2ff',
    secondary: '#565e71',
    neutral: '#5e5e62',
    bg: theme === 'gamer' ? '#001a40' : '#f9f9ff',
    text: theme === 'gamer' ? '#ffffff' : '#1b1b1f'
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500
      ${theme === 'gamer' ? 'border-blue-500/30 shadow-[0_0_20px_rgba(47,93,168,0.2)]' : 'border-stone-200 shadow-xl'}`}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between
        ${theme === 'gamer' ? 'bg-blue-950/50 border-blue-500/20' : 'bg-white border-stone-100'}`}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: palette.primary }} />
          <span className="text-xs font-black uppercase tracking-widest">
            Study Planner
          </span>
        </div>
        {step === 'result' && (
          <button 
            onClick={reset}
            className="text-[10px] font-bold uppercase py-1 px-3 rounded-full border border-current opacity-60 hover:opacity-100 transition-opacity"
          >
            New Notes
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: palette.primaryLight }}>
                  <Clipboard className="w-6 h-6" style={{ color: palette.primary }} />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Drop your notes</h2>
                <p className="text-xs opacity-60 max-w-[200px] mx-auto">Paste your raw notes below and I'll organize them into a study plan.</p>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your notes here..."
                className={`w-full h-40 p-4 rounded-2xl text-xs outline-none transition-all resize-none
                  ${theme === 'gamer' 
                    ? 'bg-blue-900/20 border border-blue-500/20 text-white focus:border-blue-400' 
                    : 'bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-400'}`}
              />

              {error && (
                <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest animate-pulse">
                  {error}
                </p>
              )}

              <button
                onClick={handleProcess}
                disabled={loading || !input.trim()}
                className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] shadow-lg'}`}
                style={{ backgroundColor: palette.primary, color: '#ffffff' }}
              >
                {loading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Generate Plan
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8 pb-10"
            >
              {/* Organized Notes */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 opacity-60">
                  <FileText className="w-4 h-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Organized Notes</h3>
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap
                  ${theme === 'gamer' ? 'bg-blue-900/20' : 'bg-stone-50'}`}>
                  {studyData?.organizedNotes}
                </div>
              </section>

              {/* Test Info Callout */}
              {studyData?.testInfo && (
                <section className="p-4 rounded-2xl border-2 border-dashed border-red-500/30 bg-red-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-red-500">
                    <Calendar className="w-4 h-4" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">Test Detected</h3>
                  </div>
                  <p className="text-xs font-medium">{studyData.testInfo}</p>
                  <p className="text-[9px] italic opacity-60">Note: Adding to Google Calendar is currently a manual step.</p>
                </section>
              )}

              {/* Study Plan */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 opacity-60">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Your Study Plan</h3>
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap border-l-4
                  ${theme === 'gamer' ? 'bg-blue-900/20 border-blue-500' : 'bg-stone-50 border-blue-600'}`}>
                  {studyData?.studyPlan}
                </div>
              </section>

              {/* Resources */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 opacity-60">
                  <Video className="w-4 h-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Recommended Resources</h3>
                </div>
                <div className="grid gap-3">
                  {studyData?.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] block
                        ${theme === 'gamer' ? 'bg-blue-900/10 border-blue-500/10 hover:border-blue-500/30' : 'bg-white border-stone-100 hover:border-stone-300 shadow-sm'}`}
                    >
                      <h4 className="font-bold text-xs mb-1" style={{ color: palette.primary }}>{res.title}</h4>
                      <p className="text-[10px] opacity-60 line-clamp-2">{res.description}</p>
                    </a>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
