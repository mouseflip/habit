import React, { useState, useRef } from 'react';
import { Upload, Activity, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';

export default function VideoUploadZone({ onAnalysisComplete }: { onAnalysisComplete: (data: any) => void }) {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: base64Data, mimeType: file.type })
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.ok ? await response.json() : null;
      if (data) onAnalysisComplete(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 rounded-[2rem] border-4 border-dashed p-10 text-center
        ${dragActive 
          ? (theme === 'gamer' ? 'border-cyan-500 bg-cyan-500/10' : 'border-stone-900 bg-stone-100') 
          : (theme === 'gamer' ? 'border-white/10 hover:border-cyan-500/50' : 'border-stone-200 hover:border-stone-900')
        }`}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept="video/*,image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={uploading ? { rotate: 360, scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={uploading ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center 
            ${theme === 'gamer' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-stone-900 text-white'}`}
        >
          {uploading ? (
            <Activity className="w-10 h-10" />
          ) : (
            <Upload className="w-10 h-10" />
          )}
        </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl font-black italic uppercase tracking-tight">
              {uploading ? 'Analyzing Play...' : 'Record Shoot-around'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Opal Logic Engine 1PH8...
            </p>
          </div>
          
          {!uploading && (
            <div className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest
              ${theme === 'gamer' ? 'bg-cyan-500 text-slate-900' : 'bg-stone-900 text-stone-50'}`}>
              Click or Drop Video
            </div>
          )}
      </div>

      <AnimatePresence>
        {dragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-cyan-500/5 rounded-[2rem] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
