'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, twoFactorCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Falha na autenticação');
        setLoading(false);
        return;
      }

      if (data.require2FA) {
        setRequire2FA(true);
        setLoading(false);
        return;
      }

      if (data.success) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('Erro de conexão ao tentar fazer login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy-dark via-brand-navy to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-sky/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-caramel/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Main Glass Card */}
        <div className="glass-panel-dark rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto rounded-full bg-white/10 border-2 border-brand-sky p-2 flex items-center justify-center">
              <Image
                src="/images/logo-white-paws.png"
                alt="Lav Au Jato Admin"
                fill
                className="object-contain p-1"
              />
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Painel do administrador
            </h1>
            <p className="text-xs font-semibold text-brand-sky uppercase tracking-widest">
              Lav Au Jato Banho e Tosa
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Password Step */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-sky uppercase tracking-wider block">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition-all"
                />
              </div>
            </div>

            {/* 2FA Step */}
            {require2FA && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Código de Autenticação 2FA
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-white text-center tracking-widest font-mono text-lg focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
                <p className="text-[11px] text-white/60 text-center font-medium">
                  Digite o código de 6 dígitos do seu aplicativo autenticador.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-brand-caramel to-amber-600 hover:from-amber-600 hover:to-brand-caramel text-white font-extrabold text-sm shadow-xl shadow-brand-caramel/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : require2FA ? (
                <>
                  <span>Confirmar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Acessar painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer note */}
          <div className="pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] text-white/40 font-medium">
              Acesso seguro protegido por criptografia de ponta a ponta.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
