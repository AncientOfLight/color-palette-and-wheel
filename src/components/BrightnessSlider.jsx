import { hsvToRgb, rgbToHex } from '../utils/colorUtils';

export default function BrightnessSlider({ hue, saturation, brightness, onChange }) {
  const colorAt0 = '#000000';
  const colorAt100 = rgbToHex(...Object.values(hsvToRgb(hue, saturation, 100)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Brillo
        </label>
        <span className="text-xs font-mono font-bold text-slate-300">{Math.round(brightness)}%</span>
      </div>
      <div className="relative h-4 rounded-full overflow-hidden" style={{ background: `linear-gradient(to right, ${colorAt0}, ${colorAt100})` }}>
        <input
          type="range"
          min="5"
          max="100"
          step="1"
          value={brightness}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 10 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all duration-75"
          style={{
            left: `calc(${brightness}% - 10px)`,
            background: rgbToHex(...Object.values(hsvToRgb(hue, saturation, brightness))),
          }}
        />
      </div>
    </div>
  );
}
