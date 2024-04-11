import {
  LENSPOST_TWITTER_USERNAME,
  LENSPOST_APP_URL,
  DESCRIPTION,
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
  const slug = params.slug;

  const { imageUrl } = await getCollectionData(slug);

  return {
    twitter: {
      creator: LENSPOST_TWITTER_USERNAME,
      site: LENSPOST_TWITTER_USERNAME,
      card: 'summary_large_image',
      description: DESCRIPTION,
      images: [imageUrl],
      title: APP_NAME
    },
    keywords: [
      'Lenspost Mint',
      'Lenspost NFT',
      'Lenspost',
      'Poster',
      'Mint',
      'NFT'
    ],
    openGraph: {
      description: DESCRIPTION,
      images: [imageUrl],
      title: APP_NAME,
      url: APP_URL
    },
    authors: [{ url: LENSPOST_APP_URL, name: AUTHOR }],
    metadataBase: new URL(APP_URL),
    description: DESCRIPTION,
    icons: ['/favicon.ico'],
    creator: AUTHOR,
    title: APP_NAME
  };
};

const Home = async ({ params }: Props) => {
  const { contractAddress, contractType, imageUrl, chainId, message, title } =
    await getCollectionData(params?.slug);

  if (message) {
    return <Default text={message} />;
  }

  return (
    <NFTCard
      contractAddress={contractAddress}
      contractType={contractType}
      imageUrl={imageUrl}
      chainId={chainId}
      title={title}
    />
  );
};

export default Home;
