
import React, { useState, useRef } from 'react';
import { X, FileJson, Upload, FileText } from 'lucide-react';
import { BrainrotJson } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (data: BrainrotJson) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      // Validação básica de estrutura
      if (parsed.players && Array.isArray(parsed.players)) {
        onImport(parsed);
        onClose();
      } else {
        alert("JSON inválido: A estrutura não parece ser do Brainrot Collector.");
      }
    } catch (e) {
      alert("Erro ao ler JSON: Certifique-se de que o formato está correto.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => processJson(event.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => processJson(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl w-full max-w-[500px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#1a1a1a] rounded-lg">
              <Upload className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Import Data</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#1a1a1a] rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-[#444] group-hover:text-white" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* File Drop Zone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all
              ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#222] bg-[#080808] hover:border-[#333]'}
            `}
          >
            <FileJson className="w-10 h-10 text-[#333]" />
            <p className="text-[#666] text-sm font-medium">
              Drop JSON file here or <button onClick={() => fileInputRef.current?.click()} className="text-blue-500 hover:underline">browse</button>
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json" 
              className="hidden" 
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#1a1a1a]"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-[#333] uppercase tracking-[0.2em]">
              OR PASTE JSON
            </span>
            <div className="flex-grow border-t border-[#1a1a1a]"></div>
          </div>

          {/* Paste Area */}
          <div className="relative">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder='[{"brainrot": "...", "generation": 0, ...}]'
              className="w-full h-40 bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 text-xs font-mono text-[#555] focus:text-indigo-300 focus:border-indigo-500/50 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => processJson(pastedText)}
              disabled={!pastedText.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-[#a78bfa] hover:bg-[#9061f9] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
