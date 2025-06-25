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

  try {
    // Handle case where getCollectionData returns no image
    // if (!imageUrl) {
    //   return {
    //     other: {
    //       'fc:frame': JSON.stringify({
    //         button: {
    //           action: {
    //             splashImageUrl:
    //               'https://lenspost-r2.b-cdn.net/web-assets/poster_logo_trans_greenBG.png',
    //             splashBackgroundColor: '#ffffff',
    //             url: `https://mint.poster.fun`,
    //             type: 'launch_frame',
    //             name: 'Mint'
    //           },
    //           title: 'Collect',
    //           name: 'Collect'
    //         },
    //         imageUrl: 'https://mint.poster.fun/OG_logo_1200x630.png',
    //         version: 'next'
    //       })
    //     },
    //     twitter: {
    //       images: ['/OG_logo_1200x630.png'],
    //       description: APP_DESCRIPTION,
    //       card: 'summary_large_image',
    //       title: APP_NAME
    //     },
    //     openGraph: {
    //       images: ['/OG_logo_1200x630.png'],
    //       description: APP_DESCRIPTION,
    //       title: APP_NAME
    //     },
    //     description: APP_DESCRIPTION,
    //     title: APP_NAME
    //   };
    // }

    // const frameMetadata = getFrameMetadata({
    //   buttons: [
    //     {
    //       target: `${APP_URL}/mint/${slug}`,
    //       label: 'Mint on Poster',
    //       action: 'link'
    //     }
    //   ],
    //   image: {
    //     aspectRatio: '1:1',
    //     src: imageCdnUrl
    //   }
    // });

    return {
      other: {
        'fc:frame': JSON.stringify({
          button: {
            action: {
              splashImageUrl:
                'https://lenspost-r2.b-cdn.net/web-assets/poster_logo_trans_greenBG.png',
              url: `https://mint.poster.fun/mint/${slug}`,
              splashBackgroundColor: '#ffffff',
              type: 'launch_frame',
              name: 'Mint'
            },
            title: 'Collect',
            name: 'Collect'
          },
          imageUrl: `https://mint.poster.fun/api/image?slug=${slug}`,
          version: 'next'
        })
      },
      twitter: {
        images: [
          {
            url: `https://mint.poster.fun/api/image?slug=${slug}`,
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
            url: `https://mint.poster.fun/api/image?slug=${slug}`,
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
    title
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
    />
  );
};

export default Home;
