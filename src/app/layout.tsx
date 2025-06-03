import type { Metadata } from 'next';

import {
  LENSPOST_TWITTER_USERNAME,
  LENSPOST_APP_URL,
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  AUTHOR
} from '@/data';
import FarcasterFrameProvider from '@/providers/FarcasterProvider';
import { EvmProvider } from '@/providers';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  twitter: {
    images: [`${APP_URL}/OG_logo_1200x630.png`],
    creator: LENSPOST_TWITTER_USERNAME,
    site: LENSPOST_TWITTER_USERNAME,
    description: APP_DESCRIPTION,
    card: 'summary_large_image',
    title: APP_NAME
  },
  // openGraph: {
  //   images: [`${APP_URL}/OG_logo_1200x630.png`],
  //   description: APP_DESCRIPTION,
  //   title: APP_NAME,
  //   url: APP_URL
  // },
  keywords: [
    'Lenspost Mint',
    'Lenspost NFT',
    'Lenspost',
    'Poster',
    'Mint',
    'NFT'
  ],
  authors: [{ url: LENSPOST_APP_URL, name: AUTHOR }],
  metadataBase: new URL(APP_URL),
  description: APP_DESCRIPTION,
  icons: ['/favicon.ico'],
  title: APP_NAME,
  creator: AUTHOR
};

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FarcasterFrameProvider>
          <EvmProvider>
            <Toaster
              position="bottom-center"
              duration={8000}
              closeButton
              richColors
            />
            <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900 p-4 sm:p-10">
              {children}
            </div>
          </EvmProvider>
        </FarcasterFrameProvider>
      </body>
    </html>
  );
};

export default RootLayout;
