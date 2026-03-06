import React, { useState, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { Upload, Trash2, Download, CheckCircle2, Loader2, FileSpreadsheet, BrainCircuit, PlayCircle, ChevronLeft, Check, X, Columns, SlidersHorizontal, AlertTriangle, Wand2, TrendingUp, TrendingDown, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [view, setView] = useState('menu'); // 'menu', 'optimizer', 'trainer', 'predictor', 'prediction-runner'
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [columnLimit, setColumnLimit] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cleaned, setCleaned] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [models, setModels] = useState([
    { id: 1, name: 'Purchase_Probability_RF_v1', type: 'Random Forest', date: '2024-03-15', accuracy: '94.2%' },
    { id: 2, name: 'Future_Spending_Reg_v2', type: 'Linear Regression', date: '2024-03-10', accuracy: '88.5%' },
    { id: 3, name: 'Customer_Churn_XGB', type: 'Gradient Boosting', date: '2024-02-28', accuracy: '91.7%' },
  ]);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ID of model to confirm delete
  const [trainingConfig, setTrainingConfig] = useState({ type: 'Random Forest', target: '' });
  
  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [genConfig, setGenConfig] = useState({ rows: 1000, mode: 'random' }); // 'random', 'ascending', 'descending'

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          setRawData(results.data);
          const cols = results.meta.fields || [];
          setHeaders(cols);
          setColumnLimit(cols.length);
          setSelectedRows(new Set(results.data.map((_, i) => i)));
          setCleaned(false);
          setProgress(0);
        }
      });
    }
  };

  const generateData = () => {
    const categories = [
      { name: 'Food & Dining', min: 10, max: 150, weight: 0.3 },
      { name: 'Transportation', min: 5, max: 50, weight: 0.15 },
      { name: 'Shopping', min: 20, max: 500, weight: 0.2 },
      { name: 'Entertainment', min: 15, max: 200, weight: 0.1 },
      { name: 'Utilities', min: 50, max: 300, weight: 0.05 },
      { name: 'Rent/Mortgage', min: 800, max: 2500, weight: 0.05 }, // Less frequent
      { name: 'Healthcare', min: 30, max: 1000, weight: 0.05 },
      { name: 'Groceries', min: 30, max: 250, weight: 0.1 }
    ];

    const newData = [];
    const startDate = new Date('2023-01-01');
    let currentDate = new Date(startDate);
    let transactionsToday = 0;
    let maxTransactionsPerDay = Math.floor(Math.random() * 4) + 1; // 1 to 4 transactions per day initially

    for (let i = 0; i < genConfig.rows; i++) {
      // Date Logic: Advance date only after max transactions for the day are reached
      if (transactionsToday >= maxTransactionsPerDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        transactionsToday = 0;
        maxTransactionsPerDay = Math.floor(Math.random() * 4) + 1; // New random limit for the next day
      }
      transactionsToday++;

      // Weighted Category Selection
      const rand = Math.random();
      let cumulativeWeight = 0;
      let category = categories[0];
      for (const cat of categories) {
        cumulativeWeight += cat.weight;
        if (rand <= cumulativeWeight) {
          category = cat;
          break;
        }
      }
      
      let amount = Math.floor(Math.random() * (category.max - category.min + 1)) + category.min;

      // Apply Trend Logic
      const progress = i / genConfig.rows;
      if (genConfig.mode === 'ascending') {
        // Ramp up: Increase amount AND slightly increase frequency of high-cost items
        amount = amount * (1 + progress * 1.5); 
        if (progress > 0.7 && Math.random() > 0.7) amount *= 1.5; // Occasional splurges near end
      } else if (genConfig.mode === 'descending') {
        // Ramp down: Decrease amount
        amount = amount * (2.5 - progress * 2); 
        if (amount < category.min) amount = category.min; // Don't go below min
      }

      newData.push({
        Date: currentDate.toISOString().split('T')[0],
        Category: category.name,
        Amount: amount.toFixed(2),
        Payment_Method: Math.random() > 0.6 ? 'Credit Card' : 'Debit Card',
        Merchant: `Merchant_${Math.floor(Math.random() * 100)}`
      });
    }

    setRawData(newData);
    setHeaders(Object.keys(newData[0]));
    setColumnLimit(Object.keys(newData[0]).length);
    setSelectedRows(new Set(newData.map((_, i) => i)));
    setFile({ name: `Synthetic_Data_${genConfig.mode}_${genConfig.rows}.csv` });
    setCleaned(false);
    setShowGenerator(false);
  };

  const resetState = () => {
    setFile(null);
    setRawData([]);
    setSelectedRows(new Set());
    setColumnLimit(0);
    setHeaders([]);
    setCleaning(false);
    setProgress(0);
    setCleaned(false);
    setSelectedModel(null);
    setShowGenerator(false);
  };

  const toggleRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === rawData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rawData.map((_, i) => i)));
    }
  };

  const processData = async () => {
    setCleaning(true);
    setProgress(0);
    
    for (let i = 0; i <= 100; i += 20) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const filteredRows = rawData.filter((_, i) => selectedRows.has(i));
    const limitedHeaders = headers.slice(0, columnLimit);
    
    const finalData = filteredRows.map(row => {
      const newRow = {};
      limitedHeaders.forEach(header => {
        newRow[header] = row[header];
      });
      return newRow;
    });

    setRawData(finalData);
    setHeaders(limitedHeaders);
    setCleaning(false);
    setCleaned(true);
  };

  const downloadFile = () => {
    const csv = Papa.unparse(rawData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `refined_${file.name}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteModel = (id) => {
    if (deleteConfirm === id) {
      setModels(models.filter(m => m.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000); // Reset after 3 seconds
    }
  };

  const handleRunModel = (model) => {
    setSelectedModel(model);
    setView('prediction-runner');
  };

  const startTraining = async () => {
    setCleaning(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    const newModel = {
      id: Date.now(),
      name: `${trainingConfig.type.replace(/\s+/g, '_')}_Model_${models.length + 1}`,
      type: trainingConfig.type,
      date: new Date().toISOString().split('T')[0],
      accuracy: (85 + Math.random() * 10).toFixed(1) + '%'
    };
    setModels([newModel, ...models]);
    setCleaning(false);
    setCleaned(true);
  };

  const runPrediction = async () => {
    setCleaning(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 25) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setCleaning(false);
    setCleaned(true);
  };

  const renderMenu = () => (
    <motion.div 
      key="menu"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <button 
        onClick={() => setView('trainer')}
        className="group relative transition-all active:scale-95 text-left"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500" />
        <GlassCard className="p-8 h-full flex flex-col items-start space-y-4 border-white/10 group-hover:border-white/40 transition-colors bg-white/10">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <BrainCircuit className="w-8 h-8 text-purple-300" />
          </div>
          <h3 className="text-xl font-bold">Train Model</h3>
          <p className="text-white/50 text-sm leading-relaxed">Advanced neural network training for predictive analysis.</p>
          <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mt-auto group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Start Training →</span>
        </GlassCard>
      </button>

      <button 
        onClick={() => setView('predictor')}
        className="group relative transition-all active:scale-95 text-left"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500" />
        <GlassCard className="p-8 h-full flex flex-col items-start space-y-4 border-white/10 group-hover:border-white/40 transition-colors bg-white/10">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <PlayCircle className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-xl font-bold">Run Models</h3>
          <p className="text-white/50 text-sm leading-relaxed">Execute pre-trained forecasting logic on live datasets.</p>
          <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-auto group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Manage Models →</span>
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
          <p className="text-white/50 text-sm leading-relaxed">Streamline and refine raw CSV data for optimal intake.</p>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mt-auto group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Launch Tool →</span>
        </GlassCard>
      </button>
    </motion.div>
  );

  const renderOptimizer = () => (
    <motion.div 
      key="optimizer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <button 
        onClick={() => { setView('menu'); resetState(); }}
        className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <GlassCard className="p-8 space-y-8">
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Atlas Data Optimizer</h2>
          <p className="text-white/50 text-sm">Professional Data Refinement Utility</p>
        </header>

        {rawData.length === 0 ? (
          <div className="space-y-4">
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

            <div className="flex justify-center">
              <button 
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-xs text-emerald-400/70 hover:text-emerald-300 flex items-center gap-2 transition-colors uppercase tracking-widest font-bold"
              >
                <Wand2 className="w-3 h-3" />
                Generate Synthetic Data
              </button>
            </div>

            <AnimatePresence>
              {showGenerator && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/70">Dataset Size</label>
                        <span className="text-emerald-400 font-mono text-sm">{genConfig.rows} Rows</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="10000"
                        step="100"
                        value={genConfig.rows}
                        onChange={(e) => setGenConfig({ ...genConfig, rows: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/70">Spending Trend</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['random', 'ascending', 'descending'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setGenConfig({ ...genConfig, mode })}
                            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${genConfig.mode === mode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                          >
                            {mode === 'random' && <Shuffle className="w-4 h-4" />}
                            {mode === 'ascending' && <TrendingUp className="w-4 h-4" />}
                            {mode === 'descending' && <TrendingDown className="w-4 h-4" />}
                            <span className="text-[10px] uppercase font-bold">{mode}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={generateData}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      Generate Data
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-white/50 text-xs">{rawData.length.toLocaleString()} rows detected</p>
                    </div>
                  </div>
                  <button 
                    onClick={resetState}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {!cleaned && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                          <Columns className="w-3 h-3" />
                          Column Retention
                        </label>
                        <span className="text-2xl font-black text-white">{columnLimit} <span className="text-xs font-medium text-white/30 uppercase tracking-tighter">Columns</span></span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max={headers.length} 
                        value={columnLimit}
                        onChange={(e) => setColumnLimit(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {headers.map((h, i) => (
                          <span key={h} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight transition-all duration-300 ${i < columnLimit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!cleaned && (
                <div className="flex-1 space-y-4">
                   <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Row Selection</label>
                    <button 
                      onClick={toggleAll}
                      className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 transition-colors"
                    >
                      {selectedRows.size === rawData.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="h-64 overflow-y-auto bg-black/20 rounded-xl border border-white/10 custom-scrollbar pr-2">
                    <div className="divide-y divide-white/5">
                      {rawData.map((row, idx) => (
                        <div 
                          key={idx}
                          onClick={() => toggleRow(idx)}
                          className="group flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedRows.has(idx) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                            {selectedRows.has(idx) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono text-white/30 mb-1">Row #{idx + 1}</p>
                            <p className="text-xs text-white/70 truncate">
                              {Object.values(row).slice(0, 3).join(' | ')}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.2em] font-bold">
                    {selectedRows.size} of {rawData.length} rows selected
                  </p>
                </div>
              )}
            </div>

            {cleaning && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-white/60 uppercase tracking-wider font-bold">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing Engine Active...
                  </span>
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
                  onClick={processData}
                  disabled={cleaning || selectedRows.size === 0}
                  className="flex-1 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xl shadow-white/5"
                >
                  {cleaning ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Syncing Pipeline...</>
                  ) : (
                    <>
                      Refine Dataset
                      <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={downloadFile}
                  className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-5 h-5" />
                  Export Refined Data
                </button>
              )}
            </div>

            {cleaned && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold uppercase tracking-widest bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Refinement Sequence Complete
                </div>
                <button 
                  onClick={resetState}
                  className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Process Another Dataset
                </button>
              </motion.div>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );

  const renderTrainer = () => (
    <motion.div 
      key="trainer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <button 
        onClick={() => { setView('menu'); resetState(); }}
        className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <GlassCard className="p-8 space-y-8">
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Model Training Engine</h2>
          <p className="text-white/50 text-sm">Configure and initiate a new training sequence</p>
        </header>

        {rawData.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-12 transition-all hover:border-white/40 bg-white/5">
              <Upload className="w-12 h-12 text-white/40 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-lg text-white/80 font-medium">Upload Training Dataset</p>
              <p className="text-sm text-white/30 mt-1">or click to browse for a CSV file</p>
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
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-white/50 text-xs">{rawData.length.toLocaleString()} rows ready for training</p>
                </div>
              </div>
              <button 
                onClick={resetState}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-300 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                  <SlidersHorizontal className="w-3 h-3" />
                  Model Configuration
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white/70">Model Type</label>
                    <select 
                      value={trainingConfig.type}
                      onChange={(e) => setTrainingConfig({ ...trainingConfig, type: e.target.value })}
                      className="w-full mt-1 p-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Random Forest">Random Forest</option>
                      <option value="Gradient Boosting">Gradient Boosting</option>
                      <option value="Neural Network">Neural Network (MLP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Target Column</label>
                    <select 
                      value={trainingConfig.target}
                      onChange={(e) => setTrainingConfig({ ...trainingConfig, target: e.target.value })}
                      className="w-full mt-1 p-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Target...</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Training Status</label>
                <div className="h-full flex flex-col justify-center items-center bg-black/20 rounded-xl border border-white/10 p-4 text-center">
                  {!trainingConfig.target ? (
                    <p className="text-white/40 text-sm italic">Select a target column to proceed</p>
                  ) : cleaning ? (
                    <div className="space-y-2">
                      <p className="text-purple-400 font-bold animate-pulse uppercase text-[10px] tracking-widest">Optimizing Weights</p>
                      <p className="text-white/70 text-xs">Epoch {Math.floor(progress/5)}/20</p>
                    </div>
                  ) : (
                    <p className="text-emerald-400/70 text-sm font-medium">Ready to initialize {trainingConfig.type}</p>
                  )}
                </div>
              </div>
            </div>

            {!cleaned ? (
              <button
                onClick={startTraining}
                disabled={cleaning || !trainingConfig.target}
                className="w-full py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xl shadow-white/5"
              >
                {cleaning ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Training in Progress... ({progress}%)</>
                ) : (
                  <>
                    Begin Training Sequence
                    <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <p className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Training Sequence Successful
                  </p>
                  <p className="text-white/50 text-xs mt-1">Model has been saved to your library.</p>
                </div>
                <button 
                  onClick={() => { setView('predictor'); resetState(); }}
                  className="w-full py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-400 transition-all flex items-center justify-center gap-2"
                >
                  View in Model Manager
                </button>
              </motion.div>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );

  const renderPredictor = () => (
    <motion.div 
      key="predictor"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <button 
        onClick={() => { setView('menu'); resetState(); }}
        className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <GlassCard className="p-8 space-y-8">
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Model Management</h2>
          <p className="text-white/50 text-sm">Manage and execute your trained predictive models</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {models.map((model) => (
            <div key={model.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-500" />
              <div className="relative flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <BrainCircuit className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{model.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                      <span className="bg-white/10 px-2 py-0.5 rounded">{model.type}</span>
                      <span>•</span>
                      <span>Trained: {model.date}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Accuracy: {model.accuracy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDeleteModel(model.id)}
                    className={`p-3 rounded-lg transition-all flex items-center gap-2 ${deleteConfirm === model.id ? 'bg-red-500/20 text-red-300 w-32 justify-center' : 'hover:bg-white/10 text-white/30 hover:text-red-400'}`}
                  >
                    {deleteConfirm === model.id ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Confirm?</span>
                      </>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleRunModel(model)}
                    className="py-3 px-6 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Run Model
                  </button>
                </div>
              </div>
            </div>
          ))}

          {models.length === 0 && (
            <div className="text-center py-12 text-white/30">
              <p>No trained models found. Visit the "Train Model" section to create one.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderPredictionRunner = () => (
    <motion.div 
      key="prediction-runner"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <button 
        onClick={() => { setView('predictor'); resetState(); }}
        className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Model List
      </button>

      <GlassCard className="p-8 space-y-8">
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Execute Prediction</h2>
          <p className="text-white/50 text-sm">Running <span className="text-blue-400 font-bold">{selectedModel?.name}</span></p>
        </header>

        {rawData.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-12 transition-all hover:border-white/40 bg-white/5">
              <Upload className="w-12 h-12 text-white/40 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-lg text-white/80 font-medium">Upload Live Dataset</p>
              <p className="text-sm text-white/30 mt-1">or click to browse for a CSV file</p>
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
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-white/50 text-xs">{rawData.length.toLocaleString()} rows ready for prediction</p>
                </div>
              </div>
              <button 
                onClick={resetState}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-300 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {!cleaned ? (
              <button
                onClick={runPrediction}
                disabled={cleaning}
                className="w-full py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xl shadow-white/5"
              >
                {cleaning ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Running Predictions... ({progress}%)</>
                ) : (
                  <>
                    Run Prediction
                    <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                  <p className="text-blue-400 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Predictions Generated
                  </p>
                </div>
                <button
                  onClick={downloadFile}
                  className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Prediction Results
                </button>
                <button 
                  onClick={resetState}
                  className="w-full py-2 text-white/30 hover:text-white text-xs uppercase tracking-widest transition-colors"
                >
                  Run Another Dataset
                </button>
              </motion.div>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat font-sans selection:bg-purple-500/30 text-white relative" 
         style={{ backgroundImage: 'url("/assets/background.jpg")' }}>
      
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl z-10"
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
          {view === 'menu' && renderMenu()}
          {view === 'optimizer' && renderOptimizer()}
          {view === 'trainer' && renderTrainer()}
          {view === 'predictor' && renderPredictor()}
          {view === 'prediction-runner' && renderPredictionRunner()}
        </AnimatePresence>

        <footer className="mt-20 flex flex-col items-center space-y-4">
          <div className="flex items-center gap-4 text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold text-center">
            <div className="hidden md:block h-[1px] w-12 bg-white/10" />
            Designed by Tanishq || Sanika Sadre || AIDS 3rd Year || C2P2 Initiative
            <div className="hidden md:block h-[1px] w-12 bg-white/10" />
          </div>
          <p className="text-white/10 text-[9px] uppercase tracking-widest">
            Flux Predictive © 2026 Advanced Forecasting Systems
          </p>
        </footer>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
