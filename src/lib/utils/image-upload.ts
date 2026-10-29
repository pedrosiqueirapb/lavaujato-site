'use client';

const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif';

/** Converte (inclusive HEIC de iPhone), redimensiona e comprime a imagem no navegador. */
async function normalizeImage(file: File, maxSize = 1600): Promise<Blob> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ACCEPTED_EXT.includes(ext) && !file.type.startsWith('image/')) {
    throw new Error('Formato não suportado. Use JPG, PNG, WebP ou HEIC.');
  }

  let source: Blob = file;
  const isHeic = ['heic', 'heif'].includes(ext) || /heic|heif/i.test(file.type);
  if (isHeic) {
    const heic2any = (await import('heic2any')).default;
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    source = Array.isArray(out) ? out[0] : out;
  }

  const bitmap = await createImageBitmap(source).catch(() => {
    throw new Error('Não foi possível ler esta imagem. Tente salvar como JPG ou PNG.');
  });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/webp', 0.85));
  if (blob && blob.type === 'image/webp') return blob;
  const jpeg = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.85));
  if (!jpeg) throw new Error('Falha ao processar a imagem.');
  return jpeg;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const blob = await normalizeImage(file);
  const form = new FormData();
  form.append('file', blob, `upload.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`);
  form.append('folder', folder);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha no upload.');
  return data.url as string;
}
