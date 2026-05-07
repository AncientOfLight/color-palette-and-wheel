import { useRef, useEffect, useCallback } from 'react';
import { hsvToRgb, rgbToHex } from '../utils/colorUtils';

const WHEEL_PADDING = 12;

function drawWheel(ctx, size) {
  const radius = size / 2;
  const maxR = radius - WHEEL_PADDING;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > maxR) continue;

      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      const sat = (dist / maxR) * 100;
      const rgb = hsvToRgb(angle, sat, 100);

      const i = (y * size + x) * 4;
      data[i]     = rgb.r;
      data[i + 1] = rgb.g;
      data[i + 2] = rgb.b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawMarker(ctx, size, hue, saturation) {
  const radius = size / 2;
  const maxR = radius - WHEEL_PADDING;
  const angle = (hue * Math.PI) / 180;
  const dist = (saturation / 100) * maxR;
  const mx = radius + dist * Math.cos(angle);
  const my = radius + dist * Math.sin(angle);
  const rgb = hsvToRgb(hue, saturation, 100);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.arc(mx, my, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(mx, my, 10, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(mx, my, 14, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

export default function ColorWheelCanvas({ size = 300, hue, saturation, onChange }) {
  const canvasRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawWheel(ctx, size);
    drawMarker(ctx, size, hue, saturation);
  }, [size, hue, saturation]);

  const getColorFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const radius = size / 2;
    const dx = x - radius;
    const dy = y - radius;
    const maxR = radius - WHEEL_PADDING;

    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxR);
    const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const sat = (dist / maxR) * 100;

    onChange(angle, sat);
  }, [size, onChange]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    getColorFromEvent(e);
  }, [getColorFromEvent]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    getColorFromEvent(e);
  }, [getColorFromEvent]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="color-wheel-cursor rounded-full w-full h-full"
      style={{ touchAction: 'none', userSelect: 'none' }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  );
}
