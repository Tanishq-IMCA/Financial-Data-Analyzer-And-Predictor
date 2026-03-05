import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Trash2, Download, CheckCircle2, Loader2, FileSpreadsheet, BrainCircuit, PlayCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [view, setView] = useState('menu'); // 'menu', 'optimizer'
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cleaned, setCleaned] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      Papa.parse(uploadedFile, {
        header: true,
        complete: (results) => {
          setData(results.data);
          setCleaned(false);
          setProgress(0);
        }
      });
    }
  };

  const cleanData = async () => {
    setCleaning(true);
    setProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    const cleanedData = data.filter(row => {
      return Object.values(row).some(val => val && val.toString().trim() !== "");
    }).map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        newRow[key] = row[key] ? row[key].toString().trim() : "";
      });
      return newRow;
    });

    setData(cleanedData);
    setCleaning(false);
    setCleaned(true);
  };

  const downloadFile = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaned_${file.name}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat font-sans selection:bg-purple-500/30 text-white relative" 
         style={{ backgroundImage: 'url("/assets/background.jpg")' }}>
      
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl z-10"
      >
        <header className="text-center mb-12 space-y-4">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-6xl font-black tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            Flux Predictive
          </motion.h1>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
        </header>

        <AnimatePresence mode="wait">
          {view === 'menu' ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <button className="group relative transition-all active:scale-95 text-left">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <GlassCard className="p-8 h-full flex flex-col items-start space-y-4 border-white/10 group-hover:border-white/30 transition-colors">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <BrainCircuit className="w-8 h-8 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold">Train Model</h3>
                  <p className="text-white/50 text-sm leading-relaxed">Advanced neural network training for predictive analysis.</p>
                  <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mt-auto">Unavailable</span>
                </GlassCard>
              </button>

              <button className="group relative transition-all active:scale-95 text-left">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <GlassCard className="p-8 h-full flex flex-col items-start space-y-4 border-white/10 group-hover:border-white/30 transition-colors">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <PlayCircle className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold">Run Models</h3>
                  <p className="text-white/50 text-sm leading-relaxed">Execute pre-trained forecasting logic on live datasets.</p>
                  <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-auto">Unavailable</span>
                </GlassCard>
              </button>

              <button 
                onClick={() => setView('optimizer')}
                className="group relative transition-all active:scale-95 text-left"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500" />
                <GlassCard className="p-8 h-full flex flex-col items-start space-y-4 border-white/10 group-hover:border-white/40 transition-colors bg-white/10">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold">Atlas Data Optimizer</h3>
                  <p className="text-white/50 text-sm leading-relaxed">Streamline and sanitize raw CSV data for optimal intake.</p>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mt-auto group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Launch Tool →</span>
                </GlassCard>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="optimizer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto w-full"
            >
              <button 
                onClick={() => { setView('menu'); setData(null); setFile(null); }}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>

              <GlassCard className="p-8 space-y-8">
                <header className="text-center space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Atlas Data Optimizer</h2>
                  <p className="text-white/50 text-sm">Professional CSV Sanitization Utility</p>
                </header>

                {!data ? (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-12 transition-all hover:border-white/40 bg-white/5">
                      <Upload className="w-12 h-12 text-white/40 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-lg text-white/80 font-medium">Drop your CSV here</p>
                      <p className="text-sm text-white/30 mt-1">or click to browse</p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-white/50 text-xs">{data.length.toLocaleString()} rows detected</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setData(null); setFile(null); setCleaned(false); }}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {cleaning && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60 uppercase tracking-wider font-bold">
                          <span>Optimizing...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      {!cleaned ? (
                        <button
                          onClick={cleanData}
                          disabled={cleaning}
                          className="flex-1 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {cleaning ? (
                            <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                          ) : (
                            "Run Optimization"
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={downloadFile}
                          className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                          <Download className="w-5 h-5" />
                          Download Optimized CSV
                        </button>
                      )}
                    </div>

                    {cleaned && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 text-emerald-300 text-sm font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Sanitization complete!
                      </motion.div>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 flex flex-col items-center space-y-4">
          <div className="flex items-center gap-4 text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold">
            <div className="h-[1px] w-12 bg-white/10" />
            Designed by Tanishq || Sanika Sadre || AIDS 3rd Year || C2P2 Initiative
            <div className="h-[1px] w-12 bg-white/10" />
          </div>
          <p className="text-white/10 text-[9px] uppercase tracking-widest">
            Flux Predictive © 2026 Advanced Forecasting Systems
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
