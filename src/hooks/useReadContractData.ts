'use client';

import { type UseReadContractParameters } from 'wagmi';
import { useReadContract } from 'wagmi';

const useReadContractData = (params: UseReadContractParameters) => {
  const isAptos = params.chainId?.toString().startsWith('Aptos:');
  const isAptosAddress = params.address && params.address.length > 42;
  
  // Validate ABI is an array before calling the hook
  const isValidABI = params.abi && Array.isArray(params.abi);
  const shouldSkip = isAptos || isAptosAddress || !isValidABI || !params.chainId || !params.address;

  // Ensure ABI is always a valid array to prevent filter errors
  const safeAbi = isValidABI ? params.abi : [];

  // Always call the hook but disable it when we should skip
  const { isError, error, data } = useReadContract({
    ...params,
    abi: safeAbi,
    query: {
      enabled: !shouldSkip
    }
  }) as any;

  if (shouldSkip) {
    return {
      isError: false,
      data: null,
      message:
        'Skipping contract read - invalid parameters or Aptos network detected'
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

export default useReadContractData;
