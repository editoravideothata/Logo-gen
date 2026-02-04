
import React, { useState, useEffect } from 'react';
import { LogoStyle, LogoGenerationResult, GenerationState } from './types.ts';
import { generateLogoImage } from './services/geminiService.ts';
import { Button } from './components/ui/Button.tsx';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

const App: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<LogoStyle>(LogoStyle.MINIMALIST);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    currentLogo: null,
    history: []
  });

  useEffect(() => {
    if (!process.env.API_KEY || process.env.API_KEY === "") {
      setApiKeyMissing(true);
    }

    const savedHistory = localStorage.getItem('logo_history');
    if (savedHistory) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(savedHistory) }));
      } catch (e) {
        console.error('Erro ao carregar histórico');
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (apiKeyMissing) {
      setState(prev => ({ ...prev, error: 'Variável API_KEY não configurada no servidor.' }));
      return;
    }

    if (!brandName.trim()) {
      setState(prev => ({ ...prev, error: 'Digite o nome da marca.' }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const imageUrl = await generateLogoImage(brandName, selectedStyle, description);
      
      const newLogo: LogoGenerationResult = {
        id: Math.random().toString(36).substring(7),
        url: imageUrl,
        prompt: brandName,
        style: selectedStyle,
        timestamp: Date.now()
      };

      setState(prev => {
        const newHistory = [newLogo, ...prev.history].slice(0, 10);
        localStorage.setItem('logo_history', JSON.stringify(newHistory));
        return {
          ...prev,
          isGenerating: false,
          currentLogo: newLogo,
          history: newHistory
        };
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, isGenerating: false, error: err.message }));
    }
  };

  const downloadLogo = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `logo-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <nav className="border-b border-zinc-800 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                <div className="w-4 h-4 bg-black rounded-sm rotate-45"></div>
              </div>
              <span className="font-bold text-xl tracking-tight">LogoGen AI</span>
            </Link>
            <div className="flex gap-4">
              <Link to="/history">
                <Button variant="ghost" className="hidden sm:flex text-zinc-400 hover:text-white">
                  <HistoryIcon />
                  Histórico
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="border-zinc-700">Novo Logo</Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
          {apiKeyMissing && (
            <div className="mb-10 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm flex items-center gap-3">
              <span><strong>Atenção:</strong> Configure a <strong>API_KEY</strong> na Vercel para funcionar.</span>
            </div>
          )}

          <Routes>
            <Route path="/" element={
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-10">
                  <header className="space-y-4">
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter leading-none gradient-text">
                      Design de Logo <br /> Instantâneo.
                    </h1>
                    <p className="text-zinc-400 text-xl max-w-lg leading-relaxed">
                      Crie identidades visuais profissionais usando o Gemini 2.5 Flash Image.
                    </p>
                  </header>

                  <div className="glass p-8 rounded-3xl space-y-8 shadow-2xl">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome da Empresa</label>
                      <input 
                        type="text"
                        placeholder="Ex: Innova Tech"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Descrição Visual</label>
                      <textarea 
                        placeholder="Ex: Minimalista, moderno, elegante..."
                        rows={2}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Estilo</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(LogoStyle).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedStyle(value as LogoStyle)}
                            className={`px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                              selectedStyle === value 
                              ? 'bg-white text-black border-white' 
                              : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>

                    {state.error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                        {state.error}
                      </div>
                    )}

                    <Button 
                      className="w-full h-14 text-md rounded-xl" 
                      isLoading={state.isGenerating}
                      onClick={handleGenerate}
                    >
                      Gerar Agora
                    </Button>
                  </div>
                </div>

                <div className="lg:sticky lg:top-28">
                  <div className="relative glass aspect-square rounded-[2rem] flex items-center justify-center overflow-hidden border border-zinc-800/50 bg-zinc-950/40">
                    {state.isGenerating ? (
                      <div className="text-center space-y-4">
                        <div className="w-64 h-64 shimmer rounded-2xl mx-auto"></div>
                        <p className="text-zinc-500 animate-pulse text-sm">Criando...</p>
                      </div>
                    ) : state.currentLogo ? (
                      <div className="w-full h-full p-8 group relative">
                        <img src={state.currentLogo.url} alt="Logo" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="primary" onClick={() => downloadLogo(state.currentLogo!.url, state.currentLogo!.prompt)}>
                            Download PNG
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-800 text-sm">Aguardando dados...</div>
                    )}
                  </div>
                </div>
              </div>
            } />
            
            <Route path="/history" element={
              <div className="space-y-8">
                <h2 className="text-3xl font-bold">Histórico</h2>
                {state.history.length === 0 ? (
                  <p className="text-zinc-600">Nada por aqui.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {state.history.map((item) => (
                      <div key={item.id} className="glass rounded-2xl overflow-hidden p-4 space-y-3">
                        <img src={item.url} className="w-full aspect-square object-contain" />
                        <button onClick={() => downloadLogo(item.url, item.prompt)} className="w-full py-2 bg-zinc-800 rounded-lg text-xs hover:bg-zinc-700">Baixar</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
