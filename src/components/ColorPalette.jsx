import { useState } from 'react';
import { getContrastColor } from '../utils/colorUtils';

function PaletteColor({ color, onRemove }) {
  const [copied, setCopied] = useState(false);
  const textColor = getContrastColor(color);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = color;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="relative group flex flex-col items-center justify-between rounded-xl p-2.5 cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10 animate-fade-in"
      style={{ background: color, minHeight: 80 }}
      onClick={handleCopy}
      title="Clic para copiar HEX"
    >
      <button
        onClick={e => { e.stopPropagation(); onRemove(color); }}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          bg-black/30 hover:bg-black/60 text-white text-xs leading-none"
        title="Eliminar"
      >
        x
      </button>
      <span
        className="font-mono text-xs font-bold mt-auto pt-6 select-none"
        style={{ color: textColor, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
      >
        {copied ? 'Copiado!' : color}
      </span>
    </div>
  );
}

export default function ColorPalette({ colors, onRemove, onClear }) {
  if (colors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-500 space-y-1">
        <span className="text-3xl opacity-40">+</span>
        <p className="text-sm">Guarda colores en tu paleta</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {colors.map((c, i) => (
          <PaletteColor key={`${c}-${i}`} color={c} onRemove={onRemove} />
        ))}
      </div>
      <button
        onClick={onClear}
        className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
      >
        Limpiar paleta
      </button>
    </div>
  );
}
