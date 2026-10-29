import Image from 'next/image';
import { Gift, PawPrint, Stamp, Sparkles } from 'lucide-react';
import { SiteConfig } from '@/lib/types';

interface LoyaltySectionProps {
  config: SiteConfig;
}

const STEPS = [
  { icon: PawPrint, title: 'Receba seu cartão', text: 'Peça o cartão fidelidade no primeiro banho do seu pet.' },
  { icon: Stamp, title: 'Ganhe uma patinha a cada banho', text: 'A cada banho, uma patinha é marcada. Lembre-se de apresentar o cartão!' },
  { icon: Gift, title: 'O 10º é grátis', text: 'Completou 9 banhos? O próximo é por nossa conta.' },
];

export function LoyaltySection({ config }: LoyaltySectionProps) {
  const image = config.loyaltyCardImage || '/images/loyalty-card.jpg';

  return (
    <section id="fidelidade" className="py-20 bg-brand-sky/40 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-brand-caramel/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Imagem do cartão */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative w-full max-w-xl aspect-[1024/585] rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white -rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image src={image} alt="Cartão fidelidade Lav Au Jato" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 600px" unoptimized={image.startsWith('http')} />
            </div>
          </div>

          {/* Texto */}
          <div className="order-1 lg:order-2 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-brand-navy text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-caramel" />
              <span>Cartão fidelidade</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              A cada 9 banhos, o 10º é <span className="text-brand-caramel">grátis!</span>
            </h2>
            <p className="text-brand-navy/80 text-base sm:text-lg font-medium">
              Cliente fiel tem recompensa! Acumule banhos no seu cartão e ganhe um banho por nossa conta.
            </p>

            <ol className="space-y-4 text-left">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex items-start gap-4 bg-white/70 backdrop-blur rounded-2xl p-4 border border-white shadow-sm">
                  <span className="shrink-0 w-11 h-11 rounded-xl bg-brand-navy text-white flex items-center justify-center">
                    <s.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-extrabold text-brand-navy">{i + 1}. {s.title}</p>
                    <p className="text-sm text-brand-navy/70 font-medium">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
