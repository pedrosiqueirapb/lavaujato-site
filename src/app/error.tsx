'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF6F0] p-6 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-brand-navy">Não foi possível carregar a página</h1>
        <p className="text-brand-navy/70 font-medium">Tente novamente em alguns instantes.</p>
        <button onClick={reset} className="px-6 py-3 rounded-xl bg-brand-caramel text-white font-bold">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
