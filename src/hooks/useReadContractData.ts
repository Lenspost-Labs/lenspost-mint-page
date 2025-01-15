'use client';

import { type UseReadContractParameters } from 'wagmi';
import { useReadContract } from 'wagmi';

const useReadConractData = (params: UseReadContractParameters) => {
  const { isError, error, data } = useReadContract(params) as any;

  if (isError) {
    console.error('Error fetching contract data', error);
    return {
      message: 'Error fetching contract data',
      isError: true
    };
  }

  console.log({ data });

  return {
    quantityLimitPerWallet: data?.[3],
    maxClaimableSupply: data?.[1],
    startTimestamp: data?.[0],
    supplyClaimed: data?.[2],
    pricePerToken: data?.[5],
    tokenAddress: data?.[6],
    merkleRoot: data?.[4],
    metadata: data?.[7]
  };
};

export default useReadConractData;
