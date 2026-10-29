/**
 * Gerador de BR Code PIX estático (padrão EMV do Banco Central).
 */
function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitize(text: string, max: number): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, max);
}

export function buildPixPayload(params: { amount: number; txid?: string; description?: string }): string {
  const key = process.env.PIX_KEY || '65717579000153';
  const name = sanitize(process.env.PIX_MERCHANT_NAME || 'CAMILLY DIAS COSTA', 25);
  const city = sanitize(process.env.PIX_MERCHANT_CITY || 'CONTAGEM', 15);
  const txid = (params.txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';

  const merchantAccount = tlv('00', 'br.gov.bcb.pix') + tlv('01', key) +
    (params.description ? tlv('02', sanitize(params.description, 40)) : '');

  let payload =
    tlv('00', '01') +
    tlv('26', merchantAccount) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', params.amount.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', name) +
    tlv('60', city) +
    tlv('62', tlv('05', txid));

  payload += '6304';
  return payload + crc16(payload);
}
