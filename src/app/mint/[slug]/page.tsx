import {
  LENSPOST_TWITTER_USERNAME,
  LENSPOST_APP_URL,
  APP_DESCRIPTION,
  CDN_IMAGE_URL,
  S3_IMAGE_URL,
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
  const imageCdnUrl = imageUrl?.replace(S3_IMAGE_URL, CDN_IMAGE_URL);
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
    other: { ...frameMetadata },
    icons: ['/favicon.ico'],
    creator: AUTHOR,
    title: APP_NAME
  };
};

const Home = async ({ params }: Props) => {
  const {
    publicSaleActive,
    contractAddress,
    contractType,
    totalMinted,
    royaltyBPS,
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
      publicSaleActive={publicSaleActive}
      contractAddress={contractAddress}
      contractType={contractType}
      totalMinted={totalMinted}
      royaltyBPS={royaltyBPS}
      maxSupply={maxSupply}
      imageUrl={imageUrl}
      chainId={chainId}
      title={title}
      price={price}
    />
  );
};

export default Home;
