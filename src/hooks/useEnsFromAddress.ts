import { formatAddress } from '@/utils';
import { useEnsName } from 'wagmi';

const useEnsFromAddress = (address: `0x${string}`) => {
  const { isLoading, isError, data } = useEnsName({
    universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    chainId: 1,
    address
  });

  return {
    ensName: data || formatAddress(address),
    isLoading,
    isError
  };
};

export default useEnsFromAddress;
