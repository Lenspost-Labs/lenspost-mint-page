import {
  LENSPOST_TWITTER_USERNAME,
  LENSPOST_APP_URL,
  APP_DESCRIPTION,
  CDN_IMAGE_URL,
  R2_IMAGE_URL,
  APP_NAME,
  APP_URL,
  AUTHOR
} from '@/data';
import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import { Default, NFTCard } from '@/components';
import { getCollectionData } from '@/services';
import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const slug = params.slug;

  const { imageUrl } = await getCollectionData(slug);
  const imageCdnUrl = imageUrl?.replace(R2_IMAGE_URL, CDN_IMAGE_URL);
  const frameMetadata = getFrameMetadata({
    buttons: [
      {
        target: `${APP_URL}/mint/${slug}`,
        label: 'Mint on Poster',
        action: 'link'
      }
    ],
    image: {
      aspectRatio: '1:1',
      src: imageCdnUrl
    }
  });

  return {
    other: {
      ...frameMetadata,
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
          title: 'Collect'
        },
        imageUrl: imageCdnUrl,
        version: 'next'
      })
    },
    twitter: {
      images: [
        {
          url: imageCdnUrl,
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
          url: imageCdnUrl,
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
