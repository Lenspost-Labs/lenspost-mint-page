import {
  LENSPOST_TWITTER_USERNAME,
  LENSPOST_APP_URL,
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  AUTHOR
} from '@/data';
import { Default, NFTCard } from '@/components';
import { getCollectionData } from '@/services';
import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const slug = params?.slug;

  // Handle case where slug is missing
  if (!slug) {
    return {
      other: {
        'fc:frame': JSON.stringify({
          button: {
            action: {
              splashImageUrl:
                'https://lenspost-r2.b-cdn.net/web-assets/poster_logo_trans_greenBG.png',
              splashBackgroundColor: '#ffffff',
              type: 'launch_frame',
              url: `${APP_URL}`,
              name: 'Mint'
            },
            title: 'Collect'
          },
          imageUrl: `${APP_URL}/OG_logo_1200x630.png`,
          version: 'next'
        })
      },
      twitter: {
        description: 'The requested NFT collection could not be found.',
        images: ['/OG_logo_1200x630.png'],
        title: 'Collection Not Found',
        card: 'summary_large_image'
      },
      openGraph: {
        description: 'The requested NFT collection could not be found.',
        images: ['/OG_logo_1200x630.png'],
        title: 'Collection Not Found'
      },
      description: 'The requested NFT collection could not be found.',
      title: 'Collection Not Found'
    };
  }

  try {
    return {
      other: {
        'fc:frame': JSON.stringify({
          button: {
            action: {
              splashImageUrl:
                'https://lenspost-r2.b-cdn.net/web-assets/poster_logo_trans_greenBG.png',
              splashBackgroundColor: '#ffffff',
              url: `${APP_URL}/mint/${slug}`,
              type: 'launch_frame',
              name: 'Mint'
            },
            title: 'Collect',
            name: 'Collect'
          },
          imageUrl: `${APP_URL}/api/images?slug=${slug}`,
          version: 'next'
        })
      },
      twitter: {
        images: [
          {
            url: `${APP_URL}/api/images?slug=${slug}`,
            alt: 'og image',
            height: 1200,
            width: 630
          }
        ],
        creator: LENSPOST_TWITTER_USERNAME,
        site: LENSPOST_TWITTER_USERNAME,
        description: APP_DESCRIPTION,
        card: 'summary_large_image',
        title: APP_NAME
      },
      openGraph: {
        images: [
          {
            url: `${APP_URL}/api/images?slug=${slug}`,
            alt: 'og image',
            height: 1200,
            width: 630
          }
        ],
        description: APP_DESCRIPTION,
        title: APP_NAME,
        url: APP_URL
      },
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
      creator: AUTHOR,
      title: APP_NAME
    };
  } catch (error) {
    // Handle any errors from getCollectionData
    console.error('Error generating metadata:', error);
    return {
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
        description: 'The requested NFT collection could not be found.',
        images: ['/OG_logo_1200x630.png'],
        title: 'Collection Not Found',
        card: 'summary_large_image'
      },
      openGraph: {
        description: 'The requested NFT collection could not be found.',
        images: ['/OG_logo_1200x630.png'],
        title: 'Collection Not Found'
      },
      description: 'The requested NFT collection could not be found.',
      title: 'Collection Not Found'
    };
  }
};

const Home = async ({ params }: Props) => {
  const {
    contractAddress,
    currencyAddress,
    contractType,
    totalMinted,
    royaltyBPS,
    isMinting,
    maxSupply,
    imageUrl,
    chainId,
    message,
    isError,
    price,
    title,
    collectionId
  } = await getCollectionData(params?.slug);

  if (isError) {
    return <Default text={message} />;
  }

  return (
    <NFTCard
      contractAddress={contractAddress}
      currencyAddress={currencyAddress}
      contractType={contractType}
      totalMinted={totalMinted}
      royaltyBPS={royaltyBPS}
      isMinting={isMinting}
      maxSupply={maxSupply}
      imageUrl={imageUrl}
      chainId={chainId}
      title={title}
      price={price}
      collectionId={collectionId}
    />
  );
};

export default Home;
