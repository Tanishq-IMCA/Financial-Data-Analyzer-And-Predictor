import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Trash2, Download, CheckCircle2, Loader2, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
);

export default function App() {
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
    
    // Simulate processing steps for progress bar
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const cleanedData = data.filter(row => {
      // Basic cleaning: remove rows where all values are empty
      return Object.values(row).some(val => val && val.toString().trim() !== "");
    }).map(row => {
      // Trim all values
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
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat font-sans selection:bg-purple-500/30" 
         style={{ backgroundImage: 'url("/assets/background.jpg")' }}>
      
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-8 space-y-8">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
              PMAF Tool
            </h1>
            <p className="text-white/70 font-medium">Predictive Modelling & Forecasting Intake</p>
          </header>

          {!data ? (
            <div 
              onClick={() => fileInputRef.current.click()}
              className="group relative cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-2xl p-12 transition-all hover:border-white/50 bg-white/5">
                <Upload className="w-12 h-12 text-white/60 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-lg text-white/80 font-medium">Drop your CSV here</p>
                <p className="text-sm text-white/40 mt-1">or click to browse</p>
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
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-purple-300" />
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
                      <span>Cleaning Data...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-400"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  {!cleaned ? (
                    <button
                      onClick={cleanData}
                      disabled={cleaning}
                      className="flex-1 py-4 bg-white text-purple-950 font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {cleaning ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Clean Invalid Data"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={downloadFile}
                      className="flex-1 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                      <Download className="w-5 h-5" />
                      Download Cleaned CSV
                    </button>
                  )}
                </div>

                {cleaned && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-green-300 text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Data cleaned successfully!
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </GlassCard>
        
        <footer className="mt-8 text-center text-white/30 text-xs tracking-widest uppercase">
          Predictive Modelling & Forecasting Intake System
        </footer>
      </motion.div>
    </div>
  );
}
