import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { MintFunction } from '@/types';

const useApprove = (approveParams: any) => {
  const {
    writeContract: handleApprove,
    isError: isApproveWriteError,
    error: approveWriteError,
    isPending: isApproving,
    data: approveWriteData
  } = useWriteContract();

  const {
    isLoading: isApproveTxConfirming,
    isSuccess: isApproveTxSuccess,
    isError: isApproveTxError,
    error: approveTxError,
    data: approveTxData
  } = useWaitForTransactionReceipt({
    hash: approveWriteData
  });

  const approve: MintFunction = () => {
    handleApprove(approveParams as any);
  };

  return {
    tx: {
      isApproveTxConfirming,
      isApproveTxSuccess,
      isApproveTxError,
      approveTxError,
      approveTxData
    },
    write: {
      isApproveWriteError,
      approveWriteError,
      approveWriteData,
      isApproving,
      approve
    }
  };
};

export default useApprove;
