import { useEffect, useState } from 'react';

export default function Toast({ message, visible }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl
        bg-emerald-600 text-white font-semibold text-sm shadow-2xl
        transition-all duration-300
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
    >
      <span className="text-base">✓</span>
      <span>{message}</span>
    </div>
  );
}
