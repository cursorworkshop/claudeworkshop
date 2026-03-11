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
const LINKEDIN_PARTNER_ID = '8633770';
const LINKEDIN_INSIGHT_ENABLED = siteConfig.branding.key === 'cursor';

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
        {LINKEDIN_INSIGHT_ENABLED ? (
          <Script id='linkedin-insight-tag' strategy='afterInteractive'>
            {`
              _linkedin_partner_id = "${LINKEDIN_PARTNER_ID}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              (function(l) {
                if (!l) {
                  window.lintrk = function(a, b) {
                    window.lintrk.q.push([a, b]);
                  };
                  window.lintrk.q = [];
                }
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";
                b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);
              })(window.lintrk);
            `}
          </Script>
        ) : null}
      </head>
      <body className={inter.className}>
        {LINKEDIN_INSIGHT_ENABLED ? (
          <noscript>
            {/* LinkedIn requires a raw noscript pixel fallback here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=''
              height='1'
              src={`https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_PARTNER_ID}&fmt=gif`}
              style={{ display: 'none' }}
              width='1'
            />
          </noscript>
        ) : null}
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
            {siteConfig.branding.leadMagnetEnabled ? <ExitIntentModal /> : null}
            <Toaster />
          </TrackingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
