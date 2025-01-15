import { BACKEND_ENDPOINT } from '@/data';
import { CollectionData } from '@/types';

export const getCollectionData = async (
  slug: string
): Promise<CollectionData> => {
  try {
    const response = await fetch(
      `${BACKEND_ENDPOINT}/util/get-slug-details?slug=${slug}`,
      {
        next: {
          revalidate: 60
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        currencyAddress: data?.metadata?.currency?.startsWith('0x')
          ? data?.metadata?.currency
          : null,
        publicSaleStart: data?.metadata?.publicSaleStart,
        imageUrl: data?.image || data?.metadata?.image,
        publicSaleEnd: data?.metadata?.publicSaleEnd,
        totalMinted: data?.metadata?.totalMinted,
        price: data?.metadata?.publicSalePrice,
        royaltyBPS: data?.metadata?.royaltyBPS,
        isMinting: data?.metadata?.isMinting,
        maxSupply: data?.metadata?.maxSupply,
        contractType: data?.contractType,
        contractAddress: data?.contract,
        title: data?.metadata?.name,
        chainId: data?.chainId
      };
    } else {
      return {
        message: response?.status + ' - ' + response?.statusText,
        isError: true
      };
    }
  } catch (error) {
    return {
      message: "Couldn't fetch data",
      isError: true
    };
  }
};
