
import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Download, 
  Upload, 
  DollarSign, 
  ChevronDown, 
  Copy, 
  Check, 
  X,
  Info,
  Clock,
  Trash2,
  UserMinus
} from 'lucide-react';
import { BrainrotJson, AnimalEntry, PlayerData } from './types';
import { formatCurrency, formatNumber, LUA_SCRIPT } from './utils/formatters';
import { getAnimalImagePath } from './utils/imageMapper';
import ImportModal from './components/ImportModal';

const STORAGE_KEY = 'brainrot_calculator_data';

const App: React.FC = () => {
  const [data, setData] = useState<BrainrotJson | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preços simulados baseados na imagem
  const PRICE_MAP: Record<string, number> = {
    'Los Candies': 15.0,
    'Los Puggies': 15.0,
    'Mieteteira Bicicleteira': 10.0,
    'Los 67': 10.0,
    'La Taco Combinasion': 10.0,
    'Spaghetti Tualetti': 10.0,
    'La Secret Combinasion': 15.0,
    'Ketupat Kepat': 10.0,
    'Nuclearo Dinossauro': 10.0,
    'Las Sis': 10.0,
    'Los Planitos': 10.0,
    'Tictac Sahur': 10.0,
    'Jolly Jolly Sahur': 10.0,
    'Tang Tang Keletang': 10.0,
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar dados do storage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [data]);

  const calculateTotalPrice = (animals: AnimalEntry[]) => {
    return animals.reduce((sum, a) => sum + (PRICE_MAP[a.name] || 10.0), 0);
  };

  const calculateTotalGen = (animals: AnimalEntry[]) => {
    return animals.reduce((sum, a) => sum + a.generation, 0);
  };

  const handleImportData = (newData: BrainrotJson) => {
    setData((prevData) => {
      const playerMap = new Map<number, PlayerData>();
      if (prevData) {
        prevData.players.forEach(p => playerMap.set(p.userId, p));
      }
      newData.players.forEach(p => playerMap.set(p.userId, p));

      return {
        lastUpdate: new Date().toLocaleString(),
        players: Array.from(playerMap.values())
      };
    });
  };

  const removePlayer = (userId: number) => {
    if (confirm("Deseja remover esta conta da lista?")) {
      setData((prev) => {
        if (!prev) return null;
        const newPlayers = prev.players.filter(p => p.userId !== userId);
        if (newPlayers.length === 0) return null;
        return { ...prev, players: newPlayers };
      });
    }
  };

  const handleClearAll = () => {
    if (confirm("Tem certeza que deseja apagar todas as contas salvas? Isso não pode ser desfeito.")) {
      setData(null);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brainrot_full_database_${Date.now()}.json`;
    link.click();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(LUA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalBases = data?.players.length || 0;
  const totalBrainrots = data?.players.reduce((sum, p) => sum + p.animals.length, 0) || 0;
  const globalTotalPrice = data?.players.reduce((sum, p) => sum + calculateTotalPrice(p.animals), 0) || 0;
  const globalTotalGen = data?.players.reduce((sum, p) => sum + calculateTotalGen(p.animals), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 space-y-8 bg-black">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <h1 className="text-xl font-black text-[#6366f1] tracking-tighter uppercase italic">
          Brainrots Calculator
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => setShowScriptModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-xs font-bold text-green-500 rounded-lg transition-all border border-[#222]">
            <Code className="w-4 h-4" /> Script
          </button>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-xs font-bold text-indigo-400 rounded-lg transition-all border border-[#222]">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={handleExport} disabled={!data} className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-xs font-bold text-indigo-400 rounded-lg transition-all border border-[#222] disabled:opacity-30">
            <Download className="w-4 h-4" /> Export All
          </button>
          {data && (
            <button onClick={handleClearAll} className="flex items-center gap-2 px-4 py-2 bg-red-900/10 hover:bg-red-900/20 text-xs font-bold text-red-500 rounded-lg transition-all border border-red-900/30">
              <Trash2 className="w-4 h-4" /> Clear Storage
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#111] text-xs font-bold text-white rounded-lg border border-[#222] cursor-pointer">
            R$ <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="SAVED BASES" value={totalBases} />
        <StatCard label="TOTAL BRAINROTS" value={totalBrainrots} />
        <StatCard label="GLOBAL VALUE" value={formatCurrency(globalTotalPrice)} highlight />
        <StatCard label="GLOBAL GENERATION" value={`${formatNumber(globalTotalGen)}/s`} />
      </div>

      <div className="flex-1 space-y-8 pb-10">
        {data && data.players.length > 0 ? (
          data.players.sort((a,b) => calculateTotalGen(b.animals) - calculateTotalGen(a.animals)).map((player) => (
            <div key={player.userId} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#1a1a1a] bg-gradient-to-r from-transparent to-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500/20 bg-[#111]">
                      <img 
                        src={`https://www.roblox.com/headshot-thumbnail/image?userId=${player.userId}&width=150&height=150&format=png`} 
                        alt={player.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[#0a0a0a]"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white">{player.username}</h3>
                      <button onClick={() => removePlayer(player.userId)} className="p-1.5 hover:bg-red-500/10 rounded-md text-[#333] hover:text-red-500 transition-all">
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-[#444] font-bold tracking-widest uppercase">ROBLOX ID: {player.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-[#444] text-[9px] font-black uppercase tracking-widest mb-1">Individual Value</p>
                    <p className="text-white text-sm font-bold">{formatCurrency(calculateTotalPrice(player.animals))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6366f1] text-[10px] font-black uppercase tracking-tight">{player.animals.length} Brainrots</p>
                    <p className="text-[#22c55e] text-2xl font-black">{formatNumber(calculateTotalGen(player.animals))}/s</p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {player.animals.map((animal, idx) => (
                  <AnimalCard key={`${animal.slot}-${idx}`} animal={animal} price={PRICE_MAP[animal.name] || 10.0} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-[#0a0a0a] rounded-[2.5rem] flex items-center justify-center border border-[#1a1a1a] relative">
              <Upload className="w-10 h-10 text-indigo-500/20" />
            </div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Banco de Dados Vazio</h2>
            <button onClick={() => setShowImportModal(true)} className="px-8 py-3 bg-[#6366f1] hover:bg-[#5558e6] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all">
              Começar Agora
            </button>
          </div>
        )}
      </div>

      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl w-full max-w-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-xl font-black text-white italic uppercase">Coletor Lua v2.0</h2>
              <button onClick={() => setShowScriptModal(false)} className="p-2 hover:bg-[#222] rounded-full transition-colors"><X className="w-6 h-6 text-[#444]" /></button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-[#080808]">
              <pre className="text-[11px] text-green-500/80 font-mono leading-relaxed p-6 bg-[#050505] rounded-xl border border-green-500/10 select-all">{LUA_SCRIPT}</pre>
            </div>
            <div className="p-6 border-t border-[#222] flex justify-end">
              <button onClick={handleCopyScript} className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Copiado!" : "Copiar Script"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onImport={handleImportData} />}

      {data && (
        <footer className="shrink-0 flex flex-col items-center justify-center gap-2 py-8 border-t border-[#111]">
          <div className="flex items-center gap-4 text-[10px] text-[#222] font-black uppercase tracking-[0.3em]"><Clock className="w-3 h-3" /> Last Database Sync: {data.lastUpdate}</div>
        </footer>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${highlight ? 'bg-[#040f08] border-[#10301a]' : 'bg-[#0a0a0a] border-[#1a1a1a]'}`}>
    <h4 className="text-[10px] font-black text-[#333] tracking-[0.2em] uppercase mb-4">{label}</h4>
    <p className={`text-4xl font-black tracking-tighter ${highlight ? 'text-[#22c55e]' : 'text-white'}`}>{value}</p>
  </div>
);

const AnimalCard: React.FC<{ animal: AnimalEntry, price: number }> = ({ animal, price }) => {
  const isSecret = animal.rarity?.toUpperCase() === 'SECRET';
  const [imageError, setImageError] = useState(false);
  const imagePath = getAnimalImagePath(animal.name);

  // Efeito para resetar o erro caso o nome do animal mude (importação de novos dados)
  useEffect(() => {
    setImageError(false);
  }, [animal.name]);
  
  return (
    <div className={`relative p-4 rounded-xl border transition-all flex items-start gap-4 overflow-hidden group ${isSecret ? 'bg-[#0f0a12] border-[#2d1836]' : 'bg-[#111] border-[#1a1a1a] hover:border-[#222]'}`}>
      <div className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 flex items-center justify-center bg-[#0d0d0d] transition-transform group-hover:scale-105 ${isSecret ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-[#222]'}`}>
        {!imageError ? (
          <img 
            src={imagePath} 
            alt={animal.name}
            className="w-full h-full object-contain p-1"
            onError={() => {
              console.warn(`Imagem não encontrada: ${imagePath}`);
              setImageError(true);
            }}
          />
        ) : (
          <div className="text-2xl opacity-50 select-none">🐾</div>
        )}
      </div>

      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[9px] font-black uppercase tracking-tighter ${isSecret ? 'text-pink-500' : 'text-[#444]'}`}>{animal.rarity || 'COMMON'}</span>
          {isSecret && <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />}
        </div>
        <h4 className="text-sm font-black text-white truncate leading-tight mb-1 group-hover:text-indigo-300 transition-colors">{animal.name}</h4>
        <p className="text-[#22c55e] text-xs font-bold leading-none mb-4">{formatNumber(animal.generation)}/s</p>
        <div className="inline-block px-3 py-1 bg-[#1a1a1a] border border-[#222] rounded-lg">
          <span className="text-yellow-600 text-[10px] font-black">R$ {price.toFixed(2)}</span>
        </div>
      </div>
      
      {animal.mutation !== "None" && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-indigo-600/20 rounded text-[7px] font-black text-indigo-400 uppercase border border-indigo-600/30">{animal.mutation}</div>
      )}
    </div>
  );
};

export default App;
