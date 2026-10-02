import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lava Au Jato | Banho e Tosa por Camilly',
  description: 'Banho, tosa higiênica, hidratação e estética canina com carinho, ambiente higienizado e planos mensais recorrentes.',
  keywords: ['Banho e Tosa', 'Lava Au Jato', 'Camilly Banho e Tosa', 'Pet Shop', 'Tosa Tesoura', 'Estética Pet', 'Assinatura Pet'],
  authors: [{ name: 'Camilly - Lava Au Jato' }],
  openGraph: {
    title: 'Lava Au Jato | Banho e Tosa por Camilly',
    description: 'Estética canina com amor e carinho para o seu melhor amigo. Agende via WhatsApp ou contrate planos recorrentes!',
    url: 'https://lavaujato.com.br',
    siteName: 'Lava Au Jato',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/images/logo-transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="antialiased selection:bg-brand-sky selection:text-brand-navy">
        {children}
      </body>
    </html>
  );
}
