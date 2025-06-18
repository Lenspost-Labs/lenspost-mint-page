'use client';

import { createPublicClientForChain } from '@/components/Recipients';
import { SplitsProvider } from '@0xsplits/splits-sdk-react';
import { ReactNode, FC } from 'react';

interface SplitsProviderWrapperProps {
  children: ReactNode;
  chainId?: number;
}

export const SplitsProviderWrapper: FC<SplitsProviderWrapperProps> = ({
  chainId = 1,
  children
}) => {
  const publicClient = createPublicClientForChain(chainId);
  if (!process.env.NEXT_PUBLIC_SPLITS_API_KEY) {
    throw new Error('NEXT_PUBLIC_SPLITS_API_KEY is not set');
  }
  const splitsConfig = {
    apiConfig: {
      apiKey: process.env.NEXT_PUBLIC_SPLITS_API_KEY
    },
    publicClient
  };

  return <SplitsProvider config={splitsConfig}>{children}</SplitsProvider>;
};
