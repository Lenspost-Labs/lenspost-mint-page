'use client';

import { arbitrum, optimism, mainnet, base } from 'viem/chains';
import { useSplitMetadata } from '@0xsplits/splits-sdk-react';
import { createPublicClient, http } from 'viem';
import { useEnsFromAddress } from '@/hooks';
import { formatAddress } from '@/utils';
import { CopyButton } from '@/ui';
import { FC } from 'react';

const RecipientName: FC<{ address: `0x${string}` }> = ({ address }) => {
  const { isLoading, ensName } = useEnsFromAddress(address);

  if (isLoading) {
    return (
      <span className="font-medium text-white">{formatAddress(address)}</span>
    );
  }

  return <span className="font-medium text-white">{ensName}</span>;
};

export const createPublicClientForChain = (chainId: number) => {
  const chainConfig = {
    42161: arbitrum,
    10: optimism,
    1: mainnet,
    8453: base
  }[chainId];

  if (!chainConfig) {
    return createPublicClient({
      transport: http(),
      chain: mainnet
    });
  }

  return createPublicClient({
    chain: chainConfig,
    transport: http()
  });
};

export const Recipients: FC<{
  splitAddress: `0x${string}`;
  chainId: number;
}> = ({ splitAddress, chainId }) => {
  const {
    isLoading: isSplitLoading,
    data: splitMetadata,
    error: splitError
  } = useSplitMetadata(chainId, splitAddress);

  if (isSplitLoading) {
    return (
      <div className="rounded-lg bg-gray-800 p-3">
        <p className="text-xs font-medium text-gray-400">Recipients</p>
        <p className="text-sm text-gray-300">Loading recipients...</p>
      </div>
    );
  }

  if (splitError || !splitMetadata) {
    return (
      <div className="rounded-lg bg-gray-800 p-3">
        <p className="text-xs font-medium text-gray-400">Royalty Recipient</p>
        <div className="flex items-center gap-1 text-sm font-bold text-white">
          <RecipientName address={splitAddress} />
          <CopyButton successMessage="Address copied!" text={splitAddress} />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-2 rounded-lg bg-gray-800 p-3 md:col-span-3">
      <p className="text-xs font-medium text-gray-400">Recipients</p>
      <div className="mt-2 space-y-2">
        {splitMetadata.recipients?.map((recipient: any, index: number) => (
          <div
            className="flex items-center justify-between text-sm"
            key={recipient.recipient.address || index}
          >
            <div className="flex items-center gap-1">
              <RecipientName address={recipient.recipient.address} />
              <CopyButton
                text={recipient.recipient.address}
                successMessage="Address copied!"
              />
            </div>
            <span className="text-purple-400">
              {recipient.percentAllocation}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
