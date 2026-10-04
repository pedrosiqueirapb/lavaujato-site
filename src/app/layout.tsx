import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Lav Au Jato Banho e Tosa',
    template: '%s | Lav Au Jato Banho e Tosa',
  },
  description: 'Lav Au Jato Banho e Tosa por Camilly. Banho, tosa higiênica, tosa na tesoura, hidratação e estética canina com carinho, ambiente seguro e produtos de excelência.',
  keywords: [
    'Lav Au Jato Banho e Tosa',
    'Lav Au Jato',
    'Banho e Tosa',
    'Camilly Banho e Tosa',
    'Pet Shop',
    'Estética Pet',
    'Tosa Higiênica',
    'Hidratação Pet',
    'Tosa na Tesoura',
    'Banho de Pet',
    'Estética Canina',
    'Planos de Banho Pet'
  ],
  authors: [{ name: 'Camilly - Lav Au Jato' }],
  creator: 'Lav Au Jato',
  publisher: 'Lav Au Jato Banho e Tosa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lavaujato.com.br'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Lav Au Jato Banho e Tosa',
    description: 'Estética canina com amor e carinho para o seu melhor amigo. Agende via WhatsApp ou contrate planos recorrentes!',
    url: 'https://lavaujato.com.br',
    siteName: 'Lav Au Jato Banho e Tosa',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/logo-white-paws.png',
        width: 1200,
        height: 630,
        alt: 'Lav Au Jato Banho e Tosa Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lav Au Jato Banho e Tosa',
    description: 'Estética canina com amor e carinho para o seu melhor amigo. Agende via WhatsApp!',
    images: ['/images/logo-white-paws.png'],
  },
  icons: {
    icon: '/images/logo-transparent.png',
    apple: '/images/logo-transparent.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'PetGrooming',
  name: 'Lav Au Jato Banho e Tosa',
  image: 'https://lavaujato.com.br/images/logo-white-paws.png',
  '@id': 'https://lavaujato.com.br',
  url: 'https://lavaujato.com.br',
  telephone: '+5583999999999',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'João Pessoa',
    addressRegion: 'PB',
    addressCountry: 'BR',
  },
  description: 'Banho e tosa especializado com amabilidade e carinho. Atendimento individualizado, produtos hipoalergênicos e ambiente limpinho.',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ],
    opens: '08:00',
    closes: '18:00'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body className="antialiased selection:bg-brand-sky selection:text-brand-navy">
        {children}
      </body>
    </html>
  );
}
