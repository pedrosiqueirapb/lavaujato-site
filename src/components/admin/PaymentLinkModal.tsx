'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { AsaasCustomerSummary, ServiceItem, SubscriptionPlan, PaymentLink, PaymentMethod } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface Props {
  services: ServiceItem[];
  plans: SubscriptionPlan[];
  onClose: () => void;
  onCreated: () => void;
}

const input = 'w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium';
const readonly = 'w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-medium cursor-not-allowed';
const SIZES = ['Pequeno', 'Médio', 'Grande'] as const;

export function PaymentLinkModal({ services, plans, onClose, onCreated }: Props) {
  const [customers, setCustomers] = useState<AsaasCustomerSummary[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<PaymentLink | null>(null);
  const [copied, setCopied] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [item, setItem] = useState(''); // "service:<id>" | "plan:<id>"
  const [value, setValue] = useState('');
  const [petSize, setPetSize] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BOTH');
  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    fetch('/api/admin/data?resource=asaasCustomers')
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setCustomers(d.customers || []);
      })
      .catch(e => setError(e.message || 'Não foi possível carregar os clientes do Asaas.'))
      .finally(() => setLoadingCustomers(false));
  }, []);

  const [itemType, itemId] = item.split(':') as ['service' | 'plan' | '', string];
  const customer = customers.find(c => c.id === customerId);
  const plan = itemType === 'plan' ? plans.find(p => p.id === itemId) : undefined;
  const isPlan = itemType === 'plan';
  const hasCard = isPlan || paymentMethod !== 'PIX';

  const planPrice = useMemo(() => {
    if (!plan || !petSize) return undefined;
    return { Pequeno: plan.priceSmall, Médio: plan.priceMedium, Grande: plan.priceLarge }[petSize as 'Pequeno'];
  }, [plan, petSize]);

  const onSelectItem = (v: string) => {
    setItem(v);
    setPetSize('');
    const [t, id] = v.split(':');
    if (t === 'service') {
      const s = services.find(x => x.id === id);
      setValue(s?.price ? String(s.price) : '');
      setPaymentMethod('BOTH');
    } else {
      setValue('');
      setPaymentMethod('CREDIT_CARD');
      setInstallments('1');
    }
  };

  useEffect(() => {
    if (isPlan) setValue(planPrice ? String(planPrice) : '');
  }, [isPlan, planPrice]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          resource: 'paymentLink',
          data: {
            asaasCustomerId: customerId,
            customerName: customer?.name,
            description,
            itemType,
            itemId,
            petSize: isPlan ? petSize : undefined,
            value: Number(value),
            paymentMethod: isPlan ? 'CREDIT_CARD' : paymentMethod,
            installmentCount: hasCard && !isPlan ? Number(installments) : 1,
          },
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCreated(d.link);
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar link.');
    } finally {
      setSaving(false);
    }
  };

  const linkUrl = created ? `${window.location.origin}/pagamento/${created.slug}` : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs font-bold text-slate-300 max-h-[90vh] overflow-y-auto">
        {created ? (
          <div className="space-y-5 text-center">
            <Check className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-extrabold text-white">Link gerado!</h3>
            <p className="text-slate-400 font-medium">Copie e envie para {created.customerName}.</p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-sky-300 break-all font-mono text-[11px]">{linkUrl}</div>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(linkUrl); setCopied(true); }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <button type="button" onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Fechar</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h3 className="text-lg font-extrabold text-white">Gerar link de pagamento</h3>

            <div className="space-y-1">
              <label>Cliente no Asaas *</label>
              <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className={input} disabled={loadingCustomers}>
                <option value="">{loadingCustomers ? 'Carregando clientes...' : '-- Selecione --'}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.cpfCnpj ? ` · ${c.cpfCnpj}` : ''}</option>
                ))}
              </select>
            </div>

            {customer && (
              <div className="space-y-1">
                <label>Nome do cliente</label>
                <input readOnly value={customer.name} className={readonly} />
              </div>
            )}

            <div className="space-y-1">
              <label>Descrição</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={input} />
            </div>

            <div className="space-y-1">
              <label>Serviço ou plano *</label>
              <select required value={item} onChange={e => onSelectItem(e.target.value)} className={input}>
                <option value="">-- Selecione --</option>
                {services.length > 0 && (
                  <optgroup label="Serviços">
                    {services.map(s => <option key={s.id} value={`service:${s.id}`}>{s.title}</option>)}
                  </optgroup>
                )}
                {plans.length > 0 && (
                  <optgroup label="Planos">
                    {plans.map(p => <option key={p.id} value={`plan:${p.id}`}>{p.name}</option>)}
                  </optgroup>
                )}
              </select>
            </div>

            {itemType && (
              <>
                {isPlan && (
                  <div className="space-y-1">
                    <label>Porte do pet *</label>
                    <select required value={petSize} onChange={e => setPetSize(e.target.value)} className={input}>
                      <option value="">-- Selecione --</option>
                      {SIZES.map(s => (
                        <option key={s} value={s}>
                          {s}{plan ? ` (${({ Pequeno: plan.priceSmall, Médio: plan.priceMedium, Grande: plan.priceLarge }[s]) ? formatCurrency(({ Pequeno: plan.priceSmall, Médio: plan.priceMedium, Grande: plan.priceLarge }[s]) as number) : 'sem valor'})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label>{isPlan ? 'Valor da mensalidade (R$) *' : 'Valor total (R$) *'}</label>
                    <input type="number" step="0.01" min="0.01" required value={value} onChange={e => setValue(e.target.value)} className={input} />
                  </div>
                  <div className="space-y-1">
                    <label>Tipo de cobrança</label>
                    <input readOnly value={isPlan ? 'Assinatura recorrente' : 'Cobrança única'} className={readonly} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label>Forma de pagamento</label>
                    {isPlan ? (
                      <input readOnly value="Cartão de crédito" className={readonly} />
                    ) : (
                      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className={input}>
                        <option value="BOTH">PIX ou cartão de crédito</option>
                        <option value="PIX">PIX</option>
                        <option value="CREDIT_CARD">Cartão de crédito</option>
                      </select>
                    )}
                  </div>
                  {hasCard && !isPlan && (
                    <div className="space-y-1">
                      <label>Parcelas no cartão</label>
                      <select value={installments} onChange={e => setInstallments(e.target.value)} className={input}>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <option key={n} value={n}>
                            {n}x{Number(value) > 0 ? ` de ${formatCurrency(Number(value) / n)}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Gerar link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
