import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import VeilFooter from '@/components/footer-1';
import { ThemeProvider } from '@/components/theme-provider';
import { TrackingProvider } from '@/components/TrackingProvider';
import { ExitIntentModal } from '@/components/ExitIntentModal';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/lib/config';

const inter = Inter({ subsets: ['latin'] });
const ogImageUrl = `${siteConfig.url}${siteConfig.images.ogImage}`;

export const metadata: Metadata = {
  title: `${siteConfig.title} - AI Development Training`,
  description: `Transform your engineering team with expert ${siteConfig.branding.productName} training. In-house and offsite programs for enterprises.`,
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: siteConfig.branding.favicon,
    apple: siteConfig.branding.favicon,
  },
  openGraph: {
    title: `${siteConfig.title} - AI Development Training`,
    description: `Transform your engineering team with expert ${siteConfig.branding.productName} training. In-house and offsite programs for enterprises.`,
    url: siteConfig.url,
    siteName: siteConfig.title,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteConfig.title} - Enterprise AI Development Training`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.title} - AI Development Training`,
    description: `Transform your engineering team with expert ${siteConfig.branding.productName} training. In-house and offsite programs for enterprises.`,
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}`}
          strategy='afterInteractive'
        />
        <Script id='google-ads-gtag' strategy='afterInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}');
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          <TrackingProvider>
            <Header />
            <main>{children}</main>
            <VeilFooter />
            <ExitIntentModal />
            <Toaster />
          </TrackingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
