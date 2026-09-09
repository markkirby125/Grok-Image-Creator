import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Settings, 
  Image as ImageIcon, 
  Download, 
  Copy, 
  AlertCircle, 
  Loader2, 
  Key, 
  Zap, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Info
} from 'lucide-react';

// --- Types ---

interface Generation {
  id: string;
  url: string;
  prompt: string;
  revised_prompt?: string;
  model: string;
  timestamp: number;
}

interface AppConfig {
  model: string;
  n: number;
  response_format: 'url' | 'b64_json';
}

const MODELS = [
  { id: 'grok-2-image', name: 'Grok 2 Image (Standard)' },
  { id: 'grok-2-image-1212', name: 'Grok 2 Image (v1212)' },
];

// --- Components ---

const App = () => {
  // State
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Configuration State
  const [config, setConfig] = useState<AppConfig>({
    model: 'grok-2-image',
    n: 1,
    response_format: 'url'
  });

  // Load API Key from api-keys.txt or local storage on mount
  useEffect(() => {
    const loadApiKey = async () => {
      let foundKey = '';

      // 1. Try to load from api-keys.txt
      try {
        const response = await fetch('./api-keys.txt');
        if (response.ok) {
          const text = await response.text();
          // Look for grok_api="xai-..."
          const match = text.match(/grok_api\s*=\s*["'](xai-[^"']+)["']/);
          if (match && match[1]) {
            foundKey = match[1].trim();
          }
        }
      } catch (e) {
        // file not found or error, ignore
      }

      // 2. Fallback to local storage if not found in file
      if (!foundKey) {
        foundKey = localStorage.getItem('xai_api_key') || '';
      }

      if (foundKey) {
        setApiKey(foundKey.trim());
        // Sync to local storage for consistency
        localStorage.setItem('xai_api_key', foundKey.trim());
      }
    };

    loadApiKey();
  }, []);

  // Save API Key to local storage
  const handleSaveKey = (key: string) => {
    const trimmedKey = key.trim();
    setApiKey(trimmedKey);
    localStorage.setItem('xai_api_key', trimmedKey);
  };

  const handleClearKey = () => {
    setApiKey('');
    localStorage.removeItem('xai_api_key');
    setShowKeyInput(true);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please enter your xAI API Key first.");
      setShowKeyInput(true);
      return;
    }
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('https://api.x.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          prompt: prompt,
          n: Number(config.n),
          response_format: config.response_format,
          // size, style, quality are NOT supported by Grok API
        })
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // If JSON parse fails, try text (e.g. for HTML 404 pages)
          const errorText = await response.text().catch(() => '');
          if (errorText) errorMessage = `API Error (${response.status}): ${errorText.slice(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const newGenerations: Generation[] = data.data.map((item: any) => ({
        id: crypto.randomUUID(),
        url: config.response_format === 'b64_json' 
          ? `data:image/jpeg;base64,${item.b64_json}` 
          : item.url,
        prompt: prompt,
        revised_prompt: item.revised_prompt,
        model: config.model,
        timestamp: Date.now()
      }));

      setGenerations(prev => [...newGenerations, ...prev]);
      setPrompt(''); // Optional: clear prompt after success
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  // UI Components
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* --- Header --- */}
      <header className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-bold">
              G
            </div>
            <span className="font-semibold text-white tracking-tight">Grok Image Creator</span>
          </div>
          
          <button 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              apiKey ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <Key size={14} />
            {apiKey ? 'API Key Set' : 'Set API Key'}
          </button>
        </div>

        {/* API Key Drawer */}
        {showKeyInput && (
          <div className="border-t border-white/5 bg-[#121217] p-4">
            <div className="max-w-2xl mx-auto flex gap-2">
              <input 
                type="password" 
                placeholder="xai-..."
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
              {apiKey && (
                <button 
                  onClick={handleClearKey}
                  className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="max-w-2xl mx-auto mt-2 text-xs text-slate-500">
              Your key is stored locally in your browser and sent directly to xAI.
            </p>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
        
        {/* --- Hero / Input Section --- */}
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-2 tracking-tight">
            Visualize with <span className="text-emerald-400">Grok</span>
          </h1>
          <p className="text-center text-slate-400 mb-8 text-sm md:text-base">
            Minimalist interface for the xAI Image Generation API.
          </p>

          <div className="bg-[#18181b] rounded-xl border border-white/5 p-2 shadow-2xl shadow-black/50">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full bg-transparent text-white p-4 min-h-[120px] focus:outline-none resize-none placeholder:text-slate-600 text-lg"
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            
            {/* Controls Bar inside Input */}
            <div className="flex items-center justify-between px-4 pb-2 pt-2 border-t border-white/5">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  showSettings ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings size={14} />
                <span>Config</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono">
                  {prompt.length} chars
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                    isGenerating || !prompt.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20'
                  }`}
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Generate
                </button>
              </div>
            </div>

            {/* Expanded Settings Panel */}
            {showSettings && (
              <div className="px-4 py-4 bg-black/20 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
                  <div className="relative">
                    <select 
                      value={config.model}
                      onChange={(e) => setConfig({...config, model: e.target.value})}
                      className="w-full appearance-none bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500/50 focus:outline-none"
                    >
                      {MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Image Count ({config.n})
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10"
                    value={config.n}
                    onChange={(e) => setConfig({...config, n: parseInt(e.target.value)})}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Response Format</label>
                  <div className="flex bg-[#09090b] p-1 rounded-lg border border-white/10">
                    {['url', 'b64_json'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setConfig({...config, response_format: fmt as any})}
                        className={`flex-1 text-[10px] py-1.5 rounded-md font-medium transition-colors ${
                          config.response_format === fmt 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {fmt === 'url' ? 'URL (Temp)' : 'Base64 (Perm)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* --- Gallery --- */}
        {generations.length > 0 && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ImageIcon size={20} className="text-emerald-500" />
                Recent Generations
              </h2>
              <button 
                onClick={() => setGenerations([])}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={12} /> Clear History
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((gen) => (
                <ImageCard key={gen.id} generation={gen} />
              ))}
            </div>
          </div>
        )}

        {generations.length === 0 && !isGenerating && (
          <div className="text-center py-20 text-slate-600">
            <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-4 flex items-center justify-center">
              <ImageIcon size={32} className="opacity-50" />
            </div>
            <p>Your generated images will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Subcomponent: Image Card ---

const ImageCard: React.FC<{ generation: Generation }> = ({ generation }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const downloadImage = async () => {
    try {
      const response = await fetch(generation.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grok-${generation.id.slice(0, 8)}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed", e);
      // Fallback for base64
      const a = document.createElement('a');
      a.href = generation.url;
      a.download = `grok-${generation.id.slice(0, 8)}.jpg`;
      a.click();
    }
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  return (
    <div className="group relative bg-[#18181b] rounded-xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-black/50">
      
      {/* Image Area */}
      <div className="aspect-square relative bg-black/50">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={24} className="text-emerald-500 animate-spin" />
          </div>
        )}
        <img 
          src={generation.url} 
          alt={generation.prompt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button 
            onClick={downloadImage}
            className="p-2 bg-white text-black rounded-full hover:bg-emerald-400 transition-colors"
            title="Download"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={() => window.open(generation.url, '_blank')}
            className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            title="Open Fullscreen"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
          {generation.model}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <p className="text-sm text-slate-300 line-clamp-1 font-medium">{generation.prompt}</p>
          <button 
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            {showPrompt ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Revised Prompt Drawer */}
        {showPrompt && (
          <div className="mt-3 pt-3 border-t border-white/5 animate-in slide-in-from-top-2">
            
            {generation.revised_prompt && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Revised Prompt</span>
                  <button 
                    onClick={() => copyPrompt(generation.revised_prompt!)}
                    className="text-slate-600 hover:text-emerald-400"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-black/30 p-2 rounded border border-white/5">
                  {generation.revised_prompt}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Original Prompt</span>
                <button 
                  onClick={() => copyPrompt(generation.prompt)}
                  className="text-slate-600 hover:text-emerald-400"
                  title="Copy"
                >
                  <Copy size={12} />
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {generation.prompt}
              </p>
            </div>

          </div>
        )}
        
        <div className="mt-2 text-[10px] text-slate-600 flex justify-between">
           <span>{new Date(generation.timestamp).toLocaleTimeString()}</span>
           <span>ID: {generation.id.slice(0, 4)}</span>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);