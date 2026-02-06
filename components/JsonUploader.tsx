
import React, { useRef, useState } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';

interface JsonUploaderProps {
  onUpload: (name: string, data: any) => void;
}

const JsonUploader: React.FC<JsonUploaderProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      setError("Por favor, selecione um arquivo JSON válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        onUpload(file.name, json);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        setError("Erro ao processar o JSON: Formato inválido.");
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 text-center
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-slate-300 hover:border-slate-400 bg-white'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <div className="p-4 bg-indigo-100 rounded-full mb-4">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Carregar seu arquivo JSON
          </h3>
          <p className="text-slate-500 mb-6">
            Arraste e solte o arquivo aqui ou clique no botão abaixo
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Selecionar Arquivo
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonUploader;
