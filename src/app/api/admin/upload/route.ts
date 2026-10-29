import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { StorageService } from '@/lib/services/storage.service';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/security/session';
import { safeMessage } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const FOLDERS = ['services', 'plans', 'portfolio', 'workspace', 'promotions', 'products', 'pets', 'config'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)?.authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') || 'misc');

    if (!(file instanceof Blob)) return NextResponse.json({ error: 'Arquivo ausente.' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Formato não suportado. Use JPG, PNG ou WebP.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Imagem acima de 5 MB.' }, { status: 400 });

    const url = await StorageService.uploadImage(
      Buffer.from(await file.arrayBuffer()),
      file.type,
      FOLDERS.includes(folder) ? folder : 'misc'
    );
    return NextResponse.json({ url });
  } catch (e) {
    console.error('Erro no upload:', e);
    return NextResponse.json({ error: safeMessage(e) }, { status: 500 });
  }
}
