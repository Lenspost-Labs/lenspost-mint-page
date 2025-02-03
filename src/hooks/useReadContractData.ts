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

  return data;
};

export default useReadConractData;
