import React, { useState, useEffect, useCallback } from 'react';
import { analyzeArchitecture, generateDiagramImage } from './services/geminiService';
import { fetchRepoContext } from './services/githubService';
import { AppStatus } from './types';
import { StepIndicator } from './components/StepIndicator';
import { ApiKeyModal } from './components/ApiKeyModal';

export default function App() {
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [url, setUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [promptSummary, setPromptSummary] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  // Initial key check
  useEffect(() => {
    const checkKey = async () => {
      // Use "as any" to bypass potential type conflicts with global declarations
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // Use "as any" to bypass potential type conflicts with global declarations
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume success as per instructions to avoid race condition
      setHasKey(true);
      // Clear errors on new key selection
      setError(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (inputMode === 'url' && !url.trim()) return;
    if (inputMode === 'manual' && !manualText.trim()) return;
    
    setStatus(AppStatus.FETCHING_REPO);
    setError(null);
    setResultImage(null);
    setPromptSummary(null);

    try {
      let name = "Manual Context";
      let context = manualText;

      // 1. Fetch Context (only if URL mode)
      if (inputMode === 'url') {
        const data = await fetchRepoContext(url);
        name = data.name;
        context = data.context;
      } else {
        // Skip scanning step for manual input
        setStatus(AppStatus.ANALYZING_ARCH);
      }
      
      // 2. Analyze Architecture (Text)
      setStatus(AppStatus.ANALYZING_ARCH);
      const architecturePrompt = await analyzeArchitecture(name, context);
      setPromptSummary(architecturePrompt);

      // 3. Generate Image
      setStatus(AppStatus.GENERATING_IMAGE);
      const imageUrl = await generateDiagramImage(architecturePrompt);
      
      setResultImage(imageUrl);
      setStatus(AppStatus.COMPLETED);

    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      
      const errorMessage = err.message || "";
      
      // Handle "Requested entity was not found" (expired session) 
      // AND "PERMISSION_DENIED" / 403 (invalid key scope)
      if (errorMessage.includes("Requested entity was not found") || 
          errorMessage.includes("PERMISSION_DENIED") || 
          err.status === 403) {
        setHasKey(false);
        setError("Access denied. Please select a valid API key with billing enabled.");
      } else {
        setError(errorMessage || "An unexpected error occurred during generation.");
      }
    }
  }, [url, manualText, inputMode]);

  if (!hasKey) {
    return <ApiKeyModal onSelectKey={handleSelectKey} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Repo<span className="text-indigo-600">Vision</span></h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Powered by Gemini 3 Pro Vision
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Turn Code into <span className="text-indigo-600 font-hand relative">
              Visual Stories
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-indigo-300 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none"/></svg>
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Provide a GitHub URL or paste your documentation. We'll deduce the architecture and draw a whiteboard diagram instantly.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-2xl relative group mb-8">
          
          {/* Tabs - Added relative and z-10 to ensure they sit above the absolute blur background */}
          <div className="flex justify-center mb-4 gap-4 relative z-10">
             <button 
               onClick={() => setInputMode('url')}
               className={`pb-2 px-4 font-medium text-sm transition-colors ${inputMode === 'url' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Public GitHub URL
             </button>
             <button 
               onClick={() => setInputMode('manual')}
               className={`pb-2 px-4 font-medium text-sm transition-colors ${inputMode === 'manual' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Manual Input (Private Repo)
             </button>
          </div>

          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-white rounded-xl shadow-xl p-2 flex flex-col gap-2 border border-gray-100">
            {inputMode === 'url' ? (
              <div className="flex items-center gap-2">
                <div className="pl-4 text-gray-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="https://github.com/username/repository" 
                  className="flex-grow p-3 outline-none text-gray-700 font-medium bg-transparent"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && status === AppStatus.IDLE && handleAnalyze()}
                />
              </div>
            ) : (
               <div className="p-2">
                 <textarea 
                   placeholder="Paste your README.md, llms.txt, or a description of your architecture here..." 
                   className="w-full h-32 p-3 outline-none text-gray-700 font-medium bg-gray-50 rounded-lg resize-none text-sm"
                   value={manualText}
                   onChange={(e) => setManualText(e.target.value)}
                 />
               </div>
            )}
            
            <button 
              onClick={handleAnalyze}
              disabled={status !== AppStatus.IDLE}
              className={`mx-2 mb-2 py-3 rounded-lg font-semibold text-white transition-all transform active:scale-95 ${
                status !== AppStatus.IDLE 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
              }`}
            >
              {status === AppStatus.IDLE ? 'Visualize' : 'Working...'}
            </button>
          </div>
        </div>

        {/* How It Works Section */}
        {status === AppStatus.IDLE && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left animate-fade-in">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 font-bold mb-3 text-lg">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Provide Context</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Scan a public repo or paste your private documentation (README, llms.txt).
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 font-bold mb-3 text-lg">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Analyze Logic</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Gemini Flash identifies key modules, data flows, and infrastructure components.</p>
            </div>
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 font-bold mb-3 text-lg">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Draw Diagram</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Gemini 3 Pro Vision creates a hand-drawn style whiteboard diagram of the workflow.</p>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <StepIndicator status={status} />

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg max-w-2xl w-full flex items-center gap-3 animate-fade-in">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Result Area */}
        {status === AppStatus.COMPLETED && resultImage && (
          <div className="mt-12 w-full max-w-5xl animate-fade-in-up">
            
            {/* The Generated Image Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700">Architecture Diagram</h3>
                <a 
                  href={resultImage} 
                  download={`architecture-${Date.now()}.png`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </a>
              </div>
              
              <div className="relative group bg-gray-100">
                 <img 
                  src={resultImage} 
                  alt="Generated Architecture" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur">
                    Generated with Gemini
                  </span>
                </div>
              </div>

              {/* Analysis Text details */}
              <div className="p-8 bg-white">
                <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-3">Behind the scenes</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed font-mono">
                  {promptSummary}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
      
      <footer className="w-full border-t border-gray-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} RepoVision. Built with React & Gemini.
        </div>
      </footer>
    </div>
  );
}