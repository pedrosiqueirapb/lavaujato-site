import Image from 'next/image';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { CreditCard, ShieldCheck, Repeat } from 'lucide-react';
import { StorageService } from '@/lib/services/storage.service';
import { formatCurrency } from '@/lib/utils/formatters';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { CopyPixButton } from './CopyPixButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pagamento | Lav Au Jato',
  robots: { index: false, follow: false },
};

export default async function PaymentPage({ params }: { params: { slug: string } }) {
  const link = await StorageService.getPaymentLinkBySlug(params.slug).catch(() => null);
  if (!link || link.status === 'CANCELLED') notFound();

  const config = await StorageService.getPublicSiteConfig();
  const whatsapp = config.phone.replace(/\D/g, '');
  const qr = link.pixPayload
    ? await QRCode.toDataURL(link.pixPayload, { width: 320, margin: 1, color: { dark: '#062f54', light: '#ffffff' } })
    : null;
  const isRecurrent = link.chargeType === 'RECURRENT';
  const firstName = link.customerName.split(' ')[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-navy via-[#0a3d6b] to-brand-navy flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo-transparent.png" alt="Lav Au Jato" width={160} height={80} className="h-16 w-auto drop-shadow" />
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-brand-sky/60 px-6 sm:px-8 py-6 text-center space-y-1">
            <p className="text-sm font-bold text-brand-navy/70">Olá, {firstName}! 🐾</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy">{link.itemName}</h1>
            {link.description && <p className="text-sm text-brand-navy/70 font-medium">{link.description}</p>}
            <p className="pt-3 text-4xl font-black text-brand-navy">
              {formatCurrency(link.value)}
              {isRecurrent && <span className="text-base font-bold text-brand-navy/60">/mês</span>}
            </p>
            {!isRecurrent && link.installmentCount > 1 && link.paymentMethod !== 'PIX' && (
              <p className="text-xs font-bold text-brand-caramel">
                No cartão: {link.installmentCount}x de {formatCurrency(link.value / link.installmentCount)}
              </p>
            )}
          </div>

          <div className="px-6 sm:px-8 py-8 space-y-8">
            <>
                {qr && (
                  <section className="space-y-4 text-center">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand-navy">Pagar com PIX</h2>
                    <div className="inline-block p-3 rounded-2xl border-2 border-brand-sky bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qr} alt="QR Code PIX" width={240} height={240} className="w-60 h-60" />
                    </div>
                    <p className="text-xs text-brand-navy/60 font-medium">
                      Abra o app do seu banco, escolha <b>PIX → Ler QR Code</b> ou use o código abaixo.
                    </p>
                    <CopyPixButton payload={link.pixPayload!} />
                  </section>
                )}

                {qr && link.cardUrl && (
                  <div className="flex items-center gap-3 text-xs font-bold text-brand-navy/40 uppercase">
                    <span className="flex-1 h-px bg-brand-sky" /> ou <span className="flex-1 h-px bg-brand-sky" />
                  </div>
                )}

                {link.cardUrl && (
                  <section className="space-y-3 text-center">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand-navy">
                      {isRecurrent ? 'Assinatura no cartão de crédito' : 'Pagar com cartão de crédito'}
                    </h2>
                    {isRecurrent && (
                      <p className="text-xs text-brand-navy/70 font-medium flex items-center justify-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5" /> Cobrança mensal automática. Cancele quando quiser.
                      </p>
                    )}
                    <a
                      href={link.cardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-caramel hover:brightness-110 text-white font-extrabold shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <CreditCard className="w-5 h-5" />
                      {isRecurrent ? 'Cadastrar cartão' : 'Pagar com cartão'}
                    </a>
                    <p className="text-[11px] text-brand-navy/50 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Ambiente seguro processado pelo Asaas
                    </p>
                  </section>
                )}

                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Segue o comprovante do pagamento de ${link.itemName}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" /> Enviar comprovante no WhatsApp
                </a>
            </>
          </div>
        </div>

        <p className="text-center text-xs text-white/60 mt-6">Lav Au Jato · Banho e tosa com carinho</p>
      </div>
    </main>
  );
}
