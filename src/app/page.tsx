import { Default } from '@/components';
import { APP_NAME } from '@/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  other: {
    'fc:frame': JSON.stringify({
      button: {
        action: {
          splashImageUrl:
            'https://lenspost-r2.b-cdn.net/web-assets/poster_logo_trans_greenBG.png',
          splashBackgroundColor: '#ffffff',
          url: `https://mint.poster.fun`,
          type: 'launch_frame',
          name: 'Mint'
        },
        title: 'Collect'
      },
      imageUrl: 'https://mint.poster.fun/OG_logo_1200x630.png',
      version: 'next'
    })
  },
  twitter: {
    description: 'Mint your favorite NFT collections on Poster.fun',
    title: 'Poster.fun - NFT Minting Platform',
    images: ['/OG_logo_1200x630.png'],
    card: 'summary_large_image'
  },
  openGraph: {
    description: 'Mint your favorite NFT collections on Poster.fun',
    title: 'Poster.fun - NFT Minting Platform',
    images: ['/OG_logo_1200x630.png']
  },
  description: 'Mint your favorite NFT collections on Poster.fun',
  title: 'Poster.fun - NFT Minting Platform'
};

const Home = () => {
  return <Default text={APP_NAME} />;
};

export default Home;
