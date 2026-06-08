import type { Metadata } from 'next';
import { Syne } from 'next/font/google';
import { Providers } from '@/components/shared/providers';
import { getSiteOrigin, siteConfig } from '@/config/site';
import './globals.css';

const syne = Syne({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: '/images/FInal-logo.png', type: 'image/png' }],
    shortcut: ['/images/FInal-logo.png'],
    apple: [{ url: '/images/FInal-logo.png', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
