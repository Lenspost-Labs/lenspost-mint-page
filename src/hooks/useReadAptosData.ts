'use client';

import { useEffect, useState } from 'react';
import { AptosConfig, Aptos, Network } from '@aptos-labs/ts-sdk';

const getAptosNetwork = (chainId: undefined | string) => {
  if (chainId?.endsWith('1')) return Network.MAINNET;
  if (chainId?.endsWith('2')) return Network.TESTNET;
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
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsError(false);

      try {
        const aptosConfig = new AptosConfig({
          network: getAptosNetwork(chainId)
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
        const [maxSupply, totalMinted, price, maxPerWallet, isMintEnabled] =
          result;

        const formattedData: AptosCollectionData = {
          maxSupply: maxSupply?.toString() || '0',
          totalMinted: totalMinted?.toString() || '0',
          price:
            typeof price === 'bigint'
              ? price
              : BigInt(price?.toString() || '0'),
          maxPerWallet: maxPerWallet?.toString() || '0',
          isMinting: Boolean(isMintEnabled)
        };

        console.log('Aptos collection data fetched:', formattedData);
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
          isMinting: false
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
