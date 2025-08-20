'use client';

import { type UseReadContractParameters } from 'wagmi';
import { useReadContract } from 'wagmi';

const useReadConractData = (params: UseReadContractParameters) => {
  const isAptos = params.chainId?.toString().startsWith('Aptos:');
  const isAptosAddress = params.address && params.address.length > 42;

  // Always call the hook at the top level
  const { isError, error, data } = useReadContract(params) as any;

  if (isAptos || isAptosAddress) {
    return {
      isError: false,
      data: null,
      message:
        'Aptos network or address detected - using Aptos-specific data fetching'
    };
  }

  if (isError) {
    console.error('Error fetching contract data', error);
    return {
      message: 'Error fetching contract data',
      isError: true
    };
  }

  return { isError: false, data };
};

export default useReadConractData;
