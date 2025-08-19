'use client';

import { type UseReadContractParameters } from 'wagmi';
import { useReadContract } from 'wagmi';

const useReadConractData = (params: UseReadContractParameters) => {
  const isAptos = params.chainId?.toString().startsWith('Aptos:');

  // Check if the address is an Aptos address (32 bytes instead of 20 bytes for EVM)
  const isAptosAddress = params.address && params.address.length > 42; // 0x + 40 chars = 42, Aptos addresses are longer

  if (isAptos || isAptosAddress) {
    return {
      isError: false,
      data: null,
      message:
        'Aptos network or address detected - using Aptos-specific data fetching'
    };
  }

  const { isError, error, data } = useReadContract(params) as any;

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
