import { useState } from 'react';
import { getContrastColor } from '../utils/colorUtils';

function CopyButton({ value, label, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      className={`group relative flex items-center justify-between w-full px-3 py-2.5 rounded-xl glass-light
        hover:border-slate-500 hover:bg-slate-700/60 active:scale-95
        transition-all duration-200 cursor-pointer ${className}`}
      title={`Copiar ${label}`}
    >
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-slate-100 truncate">
        {value}
      </span>
      <span
        className={`ml-2 shrink-0 text-xs font-bold px-2 py-0.5 rounded-md transition-all duration-300
          ${copied
            ? 'bg-emerald-500/20 text-emerald-400 scale-100 opacity-100'
            : 'bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100'
          }`}
      >
        {copied ? 'Copiado!' : 'Copiar'}
      </span>
    </button>
  );
}

export default function ColorInfoPanel({ color }) {
  const { hex, rgb, hsl } = color;
  const textColor = getContrastColor(hex);

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="space-y-3">
      {/* Color preview swatch */}
      <div
        className="w-full h-20 rounded-2xl shadow-xl flex items-end p-3 transition-all duration-500 shine-border"
        style={{ background: hex }}
      >
        <span
          className="font-mono font-bold text-lg tracking-wider"
          style={{ color: textColor, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
        >
          {hex}
        </span>
      </div>

      {/* Copy buttons for each format */}
      <div className="space-y-2">
        <CopyButton value={hex} label="HEX" />
        <CopyButton value={rgbString} label="RGB" />
        <CopyButton value={hslString} label="HSL" />
      </div>
    </div>
  );
}
