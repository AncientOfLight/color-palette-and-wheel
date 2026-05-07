import { useState, useCallback } from 'react';
import ColorWheelCanvas from './components/ColorWheelCanvas';
import BrightnessSlider from './components/BrightnessSlider';
import ColorInfoPanel from './components/ColorInfoPanel';
import ColorPalette from './components/ColorPalette';
import Toast from './components/Toast';
import { buildColorObject } from './utils/colorUtils';

const WHEEL_SIZE = 320;
const MAX_PALETTE = 20;

export default function App() {
  const [hue, setHue] = useState(217);
  const [saturation, setSaturation] = useState(75);
  const [brightness, setBrightness] = useState(95);
  const [palette, setPalette] = useState([]);
  const [toast, setToast] = useState({ message: '', key: 0 });

  const currentColor = buildColorObject(hue, saturation, brightness);

  const showToast = useCallback((message) => {
    setToast(prev => ({ message, key: prev.key + 1 }));
  }, []);

  const handleWheelChange = useCallback((newHue, newSat) => {
    setHue(newHue);
    setSaturation(newSat);
  }, []);

  const handleAddToPalette = useCallback(() => {
    setPalette(prev => {
      if (prev.includes(currentColor.hex)) {
        showToast('Este color ya está en la paleta');
        return prev;
      }
      if (prev.length >= MAX_PALETTE) {
        showToast('Paleta llena (máximo 20 colores)');
        return prev;
      }
      showToast('Color guardado en la paleta');
      return [currentColor.hex, ...prev];
    });
  }, [currentColor.hex, showToast]);

  const handleRemoveFromPalette = useCallback((color) => {
    setPalette(prev => prev.filter(c => c !== color));
  }, []);

  const handleExportPalette = useCallback(() => {
    if (palette.length === 0) {
      showToast('La paleta está vacía');
      return;
    }
    const data = { colores: palette, fecha: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paleta-de-colores-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Paleta exportada como JSON');
  }, [palette, showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Toast message={toast.message} visible={toast.key > 0} key={toast.key} />

      {/* Header */}
      <header className="pt-12 pb-6 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Herramienta de color
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          <span className="text-gradient">Rueda de Colores</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-md mx-auto">
          Selecciona, explora y guarda colores con precision. Copia el codigo en un clic.
        </p>
      </header>

      {/* Main layout */}
      <main className="max-w-5xl mx-auto px-4 pb-16 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* Left: Color Wheel */}
          <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Selector de color</h2>

            <div className="flex flex-col items-center gap-6">
              {/* Wheel */}
              <div
                className="relative rounded-full shine-border overflow-hidden shadow-2xl
                  transition-shadow duration-500"
                style={{
                  width: WHEEL_SIZE,
                  maxWidth: '100%',
                  aspectRatio: '1 / 1',
                  boxShadow: `0 0 60px ${currentColor.hex}33, 0 20px 60px rgba(0,0,0,0.6)`,
                }}
              >
                <ColorWheelCanvas
                  size={WHEEL_SIZE}
                  hue={hue}
                  saturation={saturation}
                  onChange={handleWheelChange}
                />
              </div>

              {/* Brightness slider */}
              <div className="w-full max-w-sm">
                <BrightnessSlider
                  hue={hue}
                  saturation={saturation}
                  brightness={brightness}
                  onChange={setBrightness}
                />
              </div>
            </div>
          </div>

          {/* Right: Color info + actions */}
          <div className="space-y-4">
            {/* Color info panel */}
            <div className="glass rounded-3xl p-5 space-y-4">
              <h2 className="text-lg font-bold text-slate-200">Codigo del color</h2>
              <ColorInfoPanel color={currentColor} />
            </div>

            {/* HSV values display */}
            <div className="glass rounded-3xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-slate-200">Valores HSV</h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Tono', value: `${Math.round(hue)}°`, color: 'text-blue-400' },
                  { label: 'Saturacion', value: `${Math.round(saturation)}%`, color: 'text-emerald-400' },
                  { label: 'Brillo', value: `${Math.round(brightness)}%`, color: 'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass-light rounded-xl p-3 text-center">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                    <p className={`font-mono font-bold text-sm ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to palette button */}
            <button
              onClick={handleAddToPalette}
              className="w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide
                bg-gradient-to-r from-blue-600 to-cyan-600
                hover:from-blue-500 hover:to-cyan-500
                active:scale-95 shadow-lg transition-all duration-200
                flex items-center justify-center gap-2"
              style={{ boxShadow: `0 8px 32px ${currentColor.hex}44` }}
            >
              + Guardar en paleta
            </button>
          </div>
        </div>

        {/* Palette section */}
        <section className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">
              Mi paleta
              {palette.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full">
                  {palette.length}/{MAX_PALETTE}
                </span>
              )}
            </h2>
            {palette.length > 0 && (
              <button
                onClick={handleExportPalette}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200
                  bg-slate-700/60 hover:bg-slate-700 px-3 py-1.5 rounded-lg
                  transition-all duration-200 active:scale-95"
              >
                Exportar JSON
              </button>
            )}
          </div>
          <ColorPalette
            colors={palette}
            onRemove={handleRemoveFromPalette}
            onClear={() => setPalette([])}
          />
        </section>

        {/* Instructions */}
        <section className="glass rounded-3xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Como usar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Gira la rueda', desc: 'Haz clic o arrastra sobre la rueda para elegir el tono y la saturacion.' },
              { step: '2', title: 'Ajusta el brillo', desc: 'Desliza la barra inferior para cambiar la luminosidad del color.' },
              { step: '3', title: 'Copia o guarda', desc: 'Clic en HEX, RGB o HSL para copiar. Guarda colores en tu paleta personal.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-light rounded-2xl p-4 space-y-1.5">
                <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center
                  text-blue-400 font-bold text-xs mb-2">
                  {step}
                </div>
                <p className="font-semibold text-slate-200 text-sm">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
