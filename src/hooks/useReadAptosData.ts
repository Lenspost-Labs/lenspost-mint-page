'use client';

import { useEffect, useState } from 'react';
import { AptosConfig, Aptos, Network } from '@aptos-labs/ts-sdk';

const getAptosNetwork = (chainId: undefined | string) => {
  if (!chainId) return Network.DEVNET;
  if (chainId.endsWith('1')) return Network.MAINNET;
  if (chainId.endsWith('2')) return Network.TESTNET;
  return Network.DEVNET;
};

type UseReadAptosDataParameters = {
  moduleAddress: `0x${string}` | undefined;
  collectionId: `0x${string}` | undefined;
  chainId: undefined | string;
};

type AptosCollectionData = {
  maxPerWallet: string;
  isMinting: boolean;
  maxSupply: string;
  totalMinted: string;
  price: bigint;
  royaltyAddress: string;
  name: string;
  description: string;
  imageUri: string;
  royaltyPercentage: string;
  royaltyRecipients: string[];
};

const useReadAptosData = ({
  moduleAddress,
  collectionId,
  chainId
}: UseReadAptosDataParameters) => {
  const [data, setData] = useState<AptosCollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!moduleAddress || !collectionId || !chainId) {
        console.log('useReadAptosData: Missing required parameters:', {
          moduleAddress,
          collectionId,
          chainId
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsError(false);

      try {
        const aptosConfig = new AptosConfig({
          network: Network.TESTNET
        });
        const aptos = new Aptos(aptosConfig);

        // Call the specific Move function with the collectionId
        const result = await aptos.view({
          payload: {
            function: `${moduleAddress}::poster_test_two::get_collection_info_two`,
            typeArguments: [],
            functionArguments: [collectionId]
          }
        });

        // Map the array-based result to a clear object
        const [
          maxSupply,
          totalMinted,
          price,
          maxPerWallet,
          isMintEnabled,
          royaltyAddress,
          name,
          description,
          imageUri,
          royaltyPercentageVec,
          royaltyRecipientsVec
        ] = result;

        // Extract royalty percentage from the vector format
        const royaltyPercentage = Array.isArray(royaltyPercentageVec)
          ? royaltyPercentageVec[0]?.toString() || '0'
          : typeof royaltyPercentageVec === 'object' &&
              royaltyPercentageVec &&
              'vec' in royaltyPercentageVec
            ? (royaltyPercentageVec as { vec: any[] }).vec[0]?.toString() || '0'
            : '0';

        // Validate royalty percentage is a valid number
        const validatedRoyaltyPercentage = (() => {
          const num = Number(royaltyPercentage);
          return isNaN(num) || num < 0 ? '0' : royaltyPercentage;
        })();

        // Extract royalty recipients from the vector format
        const royaltyRecipients = Array.isArray(royaltyRecipientsVec)
          ? royaltyRecipientsVec.map((r: any) => r?.toString() || '')
          : typeof royaltyRecipientsVec === 'object' &&
              royaltyRecipientsVec &&
              'vec' in royaltyRecipientsVec
            ? (royaltyRecipientsVec as { vec: any[] }).vec.map(
                (r: any) => r?.toString() || ''
              )
            : [];

        const formattedData: AptosCollectionData = {
          maxSupply: maxSupply?.toString() || '0',
          totalMinted: totalMinted?.toString() || '0',
          price:
            typeof price === 'bigint'
              ? price
              : BigInt(price?.toString() || '0'),
          maxPerWallet: maxPerWallet?.toString() || '0',
          isMinting: Boolean(isMintEnabled),
          royaltyAddress: royaltyAddress?.toString() || '',
          name: name?.toString() || '',
          description: description?.toString() || '',
          imageUri: imageUri?.toString() || '',
          royaltyPercentage: validatedRoyaltyPercentage,
          royaltyRecipients
        };

        console.log('Aptos collection data fetched:', formattedData);
        console.log('Raw Move function result:', result);
        console.log('Parsed values:', {
          maxSupply,
          totalMinted,
          price,
          maxPerWallet,
          isMintEnabled,
          royaltyAddress,
          name,
          description,
          imageUri,
          royaltyPercentageVec,
          royaltyRecipientsVec
        });
        setData(formattedData);
      } catch (error) {
        console.error('Aptos data read error:', error);
        setIsError(true);
        // Set default data on error to prevent crashes
        setData({
          maxSupply: '0',
          totalMinted: '0',
          price: 0n,
          maxPerWallet: '0',
          isMinting: false,
          royaltyAddress: '',
          name: '',
          description: '',
          imageUri: '',
          royaltyPercentage: '0',
          royaltyRecipients: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [moduleAddress, collectionId, chainId]);

  return { data, isLoading, isError };
};

export default useReadAptosData;
