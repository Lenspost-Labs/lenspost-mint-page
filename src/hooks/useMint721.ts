import {
  type UseSimulateContractParameters,
  useWaitForTransactionReceipt,
  useSimulateContract,
  useWriteContract
} from 'wagmi';
import { MintFunction } from '@/types';

const useMint721 = (mintParams: UseSimulateContractParameters) => {
  const {
    refetch: refetchSimulation,
    isError: isSimulateError,
    isLoading: isSimulating,
    error: simulateError,
    data: simulateData
  } = useSimulateContract(mintParams);

  const {
    writeContract: handleMint721,
    isError: isWriteError,
    isPending: isWriting,
    error: writeError,
    data: writeData
  } = useWriteContract();

  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    isError: isTxError,
    error: txError,
    data: txData
  } = useWaitForTransactionReceipt({
    hash: writeData
  });

  const mint721: MintFunction = () => {
    handleMint721(mintParams as any);
  };

  return {
    simulation: {
      refetchSimulation,
      isSimulateError,
      simulateError,
      isSimulating,
      simulateData
    },
    write: {
      isWriteError,
      writeError,
      isWriting,
      writeData,
      mint721
    },
    tx: {
      isTxConfirming,
      isTxSuccess,
      isTxError,
      txError,
      txData
    }
  };
};

export default useMint721;
