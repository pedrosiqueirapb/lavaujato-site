'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyPixButton({ payload }: { payload: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }}
      className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold shadow-lg transition-all"
    >
      {copied ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
      {copied ? 'Código copiado!' : 'Copiar código PIX'}
    </button>
  );
}
