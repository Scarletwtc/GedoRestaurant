import { useState } from 'react';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ro', label: 'RO' },
];

export default function LanguageToggle({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === value) || LANGS[0];
  return (
    <div className="relative">
      <button className="px-3 py-1.5 rounded-full border text-sm" onClick={() => setOpen((v) => !v)}>
        {current.label}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white shadow-card rounded overflow-hidden z-50">
          {LANGS.map((l) => (
            <div key={l.code} className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer" onClick={() => { onChange?.(l.code); setOpen(false); }}>
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

