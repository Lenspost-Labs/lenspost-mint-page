import { BACKEND_ENDPOINT } from '@/data';
import { CollectionData } from '@/types';

export const getCollectionData = async (
  slug: string
): Promise<CollectionData> => {
  try {
    const endpoint = BACKEND_ENDPOINT || 'https://api-v2.poster.fun';
    const url = `${endpoint}/util/get-slug-details?slug=${slug}`;
    
    console.log('========== getCollectionData START ==========');
    console.log('Fetching slug:', slug);
    console.log('Backend endpoint:', endpoint);
    console.log('Full URL:', url);
    
    const response = await fetch(url, {
      next: {
        revalidate: 60
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Raw backend response:', data);
      console.log('📦 Full response as JSON:', JSON.stringify(data, null, 2));
      
      if (!data) {
        console.error('❌ Backend returned null/empty data');
        return {
          message: 'Backend returned empty data',
          isError: true
        };
      }

      console.log('🔍 Extracted backend fields:');
      console.log('  - contract:', data?.contract);
      console.log('  - chainId:', data?.chainId);
      console.log('  - contractType:', data?.contractType);
      console.log('  - collection_id:', data?.collection_id);
      console.log('  - image:', data?.image);
      console.log('  - metadata:', data?.metadata);

      const collectionData: CollectionData = {
        currencyAddress: data?.metadata?.currency?.startsWith('0x')
          ? data?.metadata?.currency
          : null,
        publicSaleStart: data?.metadata?.publicSaleStart,
        imageUrl: data?.image || data?.metadata?.image,
        publicSaleEnd: data?.metadata?.publicSaleEnd,
        totalMinted: data?.metadata?.totalMinted,
        price: data?.metadata?.publicSalePrice,
        royaltyBPS: data?.metadata?.royaltyBPS || data?.metadata?.royalties?.bps,
        isMinting: data?.metadata?.isMinting,
        maxSupply: data?.metadata?.maxSupply,
        contractType: data?.contractType,
        contractAddress: data?.contract,
        title: data?.metadata?.name,
        chainId: data?.chainId,
        collectionId: data?.collection_id
      };

      console.log('📤 Returning collection data:', collectionData);
      console.log('========== getCollectionData END ==========');
      return collectionData;
    } else {
      const errorText = await response.text();
      console.error('❌ Error response from backend:');
      console.error('  Status:', response.status);
      console.error('  Status text:', response.statusText);
      console.error('  Response body:', errorText);
      console.log('========== getCollectionData END (ERROR) ==========');
      return {
        message: `${response.status} - ${response.statusText}: ${errorText}`,
        isError: true
      };
    }
  } catch (error) {
    console.error('❌ Exception in getCollectionData:', error);
    console.error('  Error message:', (error as Error)?.message);
    console.error('  Error stack:', (error as Error)?.stack);
    console.log('========== getCollectionData END (EXCEPTION) ==========');
    return {
      message: "Couldn't fetch data: " + (error as Error)?.message,
      isError: true
    };
  }
};
