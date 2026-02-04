
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
    // Verificar se a API KEY existe no ambiente injetado
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
      setState(prev => ({ ...prev, error: 'Configuração necessária: A variável de ambiente API_KEY não foi encontrada.' }));
      return;
    }

    if (!brandName.trim()) {
      setState(prev => ({ ...prev, error: 'Por favor, digite o nome da sua marca.' }));
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
      <div className="min-h-screen bg-black text-white">
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

        <main className="max-w-7xl mx-auto px-6 py-12">
          {apiKeyMissing && (
            <div className="mb-10 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span><strong>Atenção:</strong> Adicione sua <strong>API_KEY</strong> nas configurações para que o gerador funcione.</span>
            </div>
          )}

          <Routes>
            <Route path="/" element={
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-10">
                  <header className="space-y-4">
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter leading-none gradient-text">
                      Design de Logo <br /> Inteligente.
                    </h1>
                    <p className="text-zinc-400 text-xl max-w-lg leading-relaxed">
                      Gere logotipos exclusivos para sua marca usando o poder do Gemini 2.5 Flash Image.
                    </p>
                  </header>

                  <div className="glass p-8 rounded-3xl space-y-8 shadow-2xl">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome da Empresa</label>
                      <input 
                        type="text"
                        placeholder="Ex: Innova Tech"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Detalhes (Opcional)</label>
                      <textarea 
                        placeholder="Ex: Minimalista, moderno, cores escuras..."
                        rows={3}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Estilo Visual</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(LogoStyle).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedStyle(value as LogoStyle)}
                            className={`px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                              selectedStyle === value 
                              ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                              : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                            }`}
                          >
                            {key === 'TECH' ? 'Moderno' : 
                             key === 'MINIMALIST' ? 'Minimalista' :
                             key === 'RETRO' ? 'Vintage' :
                             key === 'LUXURY' ? 'Elegante' :
                             key === 'PLAYFUL' ? 'Divertido' : 'Abstrato'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {state.error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
                        <svg className="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{state.error}</span>
                      </div>
                    )}

                    <Button 
                      className="w-full h-16 text-lg rounded-2xl shadow-xl transition-all active:scale-95" 
                      isLoading={state.isGenerating}
                      onClick={handleGenerate}
                    >
                      Gerar Agora
                    </Button>
                  </div>
                </div>

                <div className="lg:sticky lg:top-28">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800 rounded-[2.5rem] blur-2xl opacity-10"></div>
                    <div className="relative glass aspect-square rounded-[2.5rem] flex items-center justify-center overflow-hidden border border-zinc-800/50 bg-zinc-950/40">
                      {state.isGenerating ? (
                        <div className="text-center space-y-6">
                          <div className="w-72 h-72 shimmer rounded-3xl mx-auto shadow-2xl"></div>
                          <p className="text-zinc-200 font-semibold text-lg">Processando...</p>
                        </div>
                      ) : state.currentLogo ? (
                        <div className="w-full h-full relative group/image p-12">
                          <img 
                            src={state.currentLogo.url} 
                            alt="Logo" 
                            className="w-full h-full object-contain animate-in zoom-in duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="primary" 
                              className="px-8 py-4 rounded-xl shadow-2xl"
                              onClick={() => downloadLogo(state.currentLogo!.url, state.currentLogo!.prompt)}
                            >
                              <DownloadIcon />
                              Salvar PNG
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-10 space-y-4">
                          <div className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center mx-auto text-zinc-800">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          </div>
                          <p className="text-zinc-600 font-medium">Sua criação aparecerá aqui.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            } />
            
            <Route path="/history" element={
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-500">
                <header>
                  <h2 className="text-4xl font-bold tracking-tight">Meus Logos</h2>
                </header>

                {state.history.length === 0 ? (
                  <div className="glass p-24 rounded-[2rem] text-center">
                    <p className="text-zinc-600 text-lg">Nenhum logo gerado ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {state.history.map((item) => (
                      <div key={item.id} className="glass rounded-[2rem] overflow-hidden border border-zinc-800/30 hover:border-zinc-600 transition-all shadow-lg">
                        <div className="aspect-square bg-zinc-950/50 p-8 flex items-center justify-center">
                          <img src={item.url} alt={item.prompt} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-6 flex items-center justify-between bg-zinc-900/20">
                          <div className="truncate pr-4">
                            <p className="font-bold truncate text-sm text-zinc-200">{item.prompt}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase">{new Date(item.timestamp).toLocaleDateString()}</p>
                          </div>
                          <button 
                            onClick={() => downloadLogo(item.url, item.prompt)}
                            className="p-3 bg-zinc-800/50 hover:bg-white hover:text-black rounded-xl transition-all"
                          >
                            <DownloadIcon />
                          </button>
                        </div>
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
