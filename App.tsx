
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LogoParams, GeneratedImage } from './types';
import { FONT_OPTIONS, COLOR_PALETTES, DISTRIBUTION_OPTIONS, LOGO_TYPE_OPTIONS } from './constants';
import { generateLogo, editLogo } from './services/geminiService';
import Button from './components/Button';

// Extendiendo el objeto window para aistudio
// Se define la interfaz AIStudio para evitar conflictos de tipos globales
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

interface SavedLogo {
  id: string;
  url: string;
  base64: string; 
  name: string;
  dimensions: string;
  timestamp: number;
  params?: Partial<LogoParams>;
}

const App: React.FC = () => {
  const [params, setParams] = useState<LogoParams>({
    name: '',
    slogan: '',
    colors: COLOR_PALETTES[0].colors,
    fontStyle: FONT_OPTIONS[0].name,
    iconDescription: '',
    elementDistribution: DISTRIBUTION_OPTIONS[0].name,
    logoType: LOGO_TYPE_OPTIONS[2].name,
    width: 1024,
    height: 1024,
    nameColor: '#0f172a',
    sloganColor: '#64748b'
  });

  const [colorInput, setColorInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedLogos, setSavedLogos] = useState<SavedLogo[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('gengraphic_pro_collection');
    if (stored) {
      try {
        setSavedLogos(JSON.parse(stored));
      } catch (e) {
        console.error("Error cargando colección", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gengraphic_pro_collection', JSON.stringify(savedLogos));
  }, [savedLogos]);

  const autoSaveToCollection = useCallback((url: string, base64: string, name: string, dimensions: string) => {
    setSavedLogos(prev => {
      const newLogo: SavedLogo = {
        id: crypto.randomUUID(),
        url,
        base64,
        name: name || 'Diseño Pro',
        dimensions,
        timestamp: Date.now()
      };
      const updated = [newLogo, ...prev.filter(l => l.url !== url)];
      return updated.slice(0, 10);
    });
  }, []);

  const detectedRatioLabel = useMemo(() => {
    if (params.height === 0) return "N/A";
    const ratio = params.width / params.height;
    if (ratio > 1.5) return "16:9 (Panorámico)";
    if (ratio > 1.1) return "4:3 (Estándar)";
    if (ratio < 0.6) return "9:16 (Vertical)";
    if (ratio < 0.9) return "3:4 (Retrato)";
    return "1:1 (Cuadrado)";
  }, [params.width, params.height]);

  const selectedLogoTypeDescription = useMemo(() => {
    return LOGO_TYPE_OPTIONS.find(o => o.name === params.logoType)?.description || '';
  }, [params.logoType]);

  const checkApiKey = async () => {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      // Procedemos asumiendo éxito según directrices para evitar race conditions
    }
  };

  const addColor = (color: string) => {
    const trimmed = color.trim();
    if (!trimmed) return;
    let finalColor = trimmed;
    if (/^[0-9A-F]{3,6}$/i.test(trimmed)) finalColor = `#${trimmed}`;
    setParams(prev => ({ ...prev, colors: [...prev.colors, finalColor] }));
    setColorInput('');
  };

  const removeColor = (index: number) => {
    setParams(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
  };

  const processImageToExactSize = (base64: string, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const finalW = Math.max(1, Math.round(targetWidth));
        const finalH = Math.max(1, Math.round(targetHeight));
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, finalW, finalH);
          const hRatio = finalW / img.width;
          const vRatio = finalH / img.height;
          const ratio = Math.min(hRatio, vRatio);
          const centerShift_x = (finalW - img.width * ratio) / 2;
          const centerShift_y = (finalH - img.height * ratio) / 2;
          ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.src = `data:image/png;base64,${base64}`;
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.name && params.elementDistribution !== 'Solo Icono' && params.logoType !== 'Isotipo (Pictorial)') {
      setError('Se requiere el nombre de la marca.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await checkApiKey();
      const base64 = await generateLogo(params);
      const finalUrl = await processImageToExactSize(base64, params.width, params.height);
      setResult({ base64, url: finalUrl, promptUsed: `Diseño para ${params.name}` });
      autoSaveToCollection(finalUrl, base64, params.name || 'Logo', `${params.width}x${params.height}`);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setError('Error de configuración. Por favor, selecciona una API Key válida.');
        await window.aistudio.openSelectKey();
      } else {
        setError('Fallo en la generación. Verifica tu conexión o API Key.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!result || !editPrompt) return;
    setEditing(true);
    setError(null);
    try {
      await checkApiKey();
      const newBase64 = await editLogo(result.base64, editPrompt);
      const finalUrl = await processImageToExactSize(newBase64, params.width, params.height);
      setResult({ ...result, base64: newBase64, url: finalUrl });
      autoSaveToCollection(finalUrl, newBase64, `${params.name || 'Logo'} (Ajustado)`, `${params.width}x${params.height}`);
      setEditPrompt('');
    } catch (err) {
      setError('No se pudo procesar el ajuste.');
      console.error(err);
    } finally {
      setEditing(false);
    }
  };

  const setFullHD = () => setParams(prev => ({ ...prev, width: 1920, height: 1080 }));
  const setSquare = () => setParams(prev => ({ ...prev, width: 1024, height: 1024 }));

  const handleDownloadFullHD = async () => {
    if (!result) return;
    setExporting(true);
    try {
      const fullHDUrl = await processImageToExactSize(result.base64, 1920, 1080);
      const link = document.createElement('a');
      link.href = fullHDUrl;
      link.download = `FHD_DESIGN_${params.name.replace(/\s+/g, '_')}_1920x1080.png`;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = (url: string, name: string, dimensions: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRO_DESIGN_${name.replace(/\s+/g, '_')}_${dimensions}.png`;
    link.click();
  };

  const handleDeleteSaved = (id: string) => {
    setSavedLogos(savedLogos.filter(logo => logo.id !== id));
  };

  const handleLoadToWorkspace = (logo: SavedLogo) => {
    setResult({ base64: logo.base64, url: logo.url, promptUsed: `Cargado: ${logo.name}` });
    const [w, h] = logo.dimensions.split('x').map(n => parseInt(n));
    if (w && h) setParams(prev => ({ ...prev, width: w, height: h, name: logo.name.split(' (')[0] }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputClasses = "w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm font-medium transition-all text-base md:text-sm bg-white text-slate-900 placeholder:text-slate-400";
  const selectClasses = "w-full px-4 py-4 rounded-xl border-2 border-slate-200 shadow-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-base md:text-sm bg-white appearance-none cursor-pointer";

  return (
    <div className="min-h-screen pb-12 bg-[#f8fafc]">
      <header className="bg-white border-b border-slate-200 py-6 px-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white shadow-lg">
              <i className="fa-solid fa-bezier-curve text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                GenGraphic <span className="text-indigo-600">Pro</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Professional Design Studio</p>
            </div>
          </div>
          <button 
            onClick={() => window.aistudio.openSelectKey()}
            className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-key"></i> Configurar API Key
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-2">
                <i className="fa-solid fa-compass-drafting text-indigo-500"></i> Parámetros de Marca
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-wide">Nombre de Marca</label>
                    <input type="text" placeholder="Ej: Aether Dynamics" className={inputClasses} value={params.name} onChange={(e) => setParams({ ...params, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-wide">Tagline / Eslogan</label>
                    <input type="text" placeholder="Ej: Future Ready" className={inputClasses} value={params.slogan} onChange={(e) => setParams({ ...params, slogan: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-wide">Tipo de Logo</label>
                    <div className="relative">
                      <select className={selectClasses} value={params.logoType} onChange={(e) => setParams({ ...params, logoType: e.target.value })}>
                        {LOGO_TYPE_OPTIONS.map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <i className="fa-solid fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-wide">Distribución</label>
                      <div className="relative">
                        <select className={selectClasses} value={params.elementDistribution} onChange={(e) => setParams({ ...params, elementDistribution: e.target.value })}>
                          {DISTRIBUTION_OPTIONS.map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <i className="fa-solid fa-chevron-down"></i>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-wide">Tipografía</label>
                      <div className="relative">
                        <select className={selectClasses} value={params.fontStyle} onChange={(e) => setParams({ ...params, fontStyle: e.target.value })}>
                          {FONT_OPTIONS.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <i className="fa-solid fa-chevron-down"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-700">Lienzo: {params.width}x{params.height}px</span>
                    <span className="text-indigo-600">{detectedRatioLabel}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={setSquare} className={`flex-grow py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${params.width === 1024 && params.height === 1024 ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>1:1 Square</button>
                    <button type="button" onClick={setFullHD} className={`flex-grow py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${params.width === 1920 && params.height === 1080 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>16:9 Full HD</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-wide">Concepto del Icono</label>
                  <textarea 
                    placeholder="Describe el icono deseado..." 
                    className={`${inputClasses} min-h-[100px] resize-none`}
                    value={params.iconDescription} 
                    onChange={(e) => setParams({ ...params, iconDescription: e.target.value })} 
                  />
                </div>

                <Button type="submit" className="w-full py-5 text-base font-black uppercase tracking-widest shadow-2xl rounded-2xl" isLoading={loading}>
                  Diseñar Ahora <i className="fa-solid fa-wand-sparkles ml-2"></i>
                </Button>
              </form>
            </div>

            {error && <div className="bg-red-50 border-2 border-red-100 text-red-600 p-5 rounded-2xl text-sm font-bold flex items-center gap-4 shadow-xl animate-bounce"><i className="fa-solid fa-triangle-exclamation text-xl"></i>{error}</div>}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-2xl border border-slate-100 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6 px-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Workspace</h2>
                {result && (
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => handleDownload(result.url, params.name, `${params.width}x${params.height}`)} className="text-[11px] font-black uppercase h-12 px-6 rounded-2xl border-2">
                      <i className="fa-solid fa-download mr-2"></i> Std
                    </Button>
                    <Button variant="primary" onClick={handleDownloadFullHD} isLoading={exporting} className="text-[11px] font-black uppercase h-12 px-8 rounded-2xl shadow-xl relative group">
                      <i className="fa-solid fa-cloud-arrow-down mr-2 text-sm"></i> Full HD
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-grow flex items-center justify-center bg-slate-100/50 rounded-3xl relative overflow-hidden shadow-inner border-2 border-slate-50">
                {loading ? (
                  <div className="text-center space-y-8 p-12">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                      <i className="fa-solid fa-bolt absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 text-xl animate-pulse"></i>
                    </div>
                    <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Diseñando tu Identidad...</p>
                  </div>
                ) : result ? (
                  <div className="relative p-4 sm:p-10 flex items-center justify-center animate-in fade-in zoom-in duration-700 w-full h-full">
                    <img src={result.url} alt="Logo Result" className="shadow-2xl rounded-2xl border-[8px] sm:border-[16px] border-white bg-white max-w-full max-h-[550px] object-contain transition-all hover:scale-[1.02]" />
                  </div>
                ) : (
                  <div className="text-center text-slate-300 p-12 max-w-sm">
                    <i className="fa-solid fa-pen-nib text-7xl opacity-20 mb-8"></i>
                    <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-3">Estudio Pro</h3>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">Completa el formulario para iniciar el proceso creativo con Gemini 3 Pro.</p>
                  </div>
                )}
              </div>

              {result && !loading && (
                <div className="mt-10 pt-10 border-t-2 border-slate-50 px-2">
                  <label className="block text-xs font-black text-slate-900 uppercase mb-5 tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i> Ajustar con IA
                  </label>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Ej: 'Añadir más brillo'..." className={`${inputClasses} flex-grow`} value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEdit()} />
                    <Button variant="primary" onClick={handleEdit} isLoading={editing} disabled={!editPrompt} className="h-[56px] px-8 rounded-2xl shadow-xl">
                      <i className="fa-solid fa-magic text-lg"></i>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-slate-100">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-10 flex items-center gap-3">
            <i className="fa-solid fa-layer-group text-indigo-500 text-lg"></i> Historial del Estudio
          </h2>

          {savedLogos.length === 0 ? (
            <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[32px]">
              <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">Sin diseños previos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {savedLogos.map((logo) => (
                <div key={logo.id} className="group relative bg-white border-2 border-slate-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-square bg-slate-50/50 flex items-center justify-center p-4 relative">
                    <img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                    <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 px-4">
                      <div className="flex gap-3">
                        <button onClick={() => handleLoadToWorkspace(logo)} className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:scale-110 shadow-xl transition-all">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onClick={() => handleDownload(logo.url, logo.name, logo.dimensions)} className="w-10 h-10 rounded-2xl bg-white text-slate-900 flex items-center justify-center hover:scale-110 shadow-xl transition-all">
                          <i className="fa-solid fa-download"></i>
                        </button>
                      </div>
                      <button onClick={() => handleDeleteSaved(logo.id)} className="text-[9px] font-black text-red-400 uppercase tracking-widest">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
