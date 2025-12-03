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
  
  const apiKey = process.env.NEXT_PUBLIC_SPLITS_API_KEY || 'key_prod_90845475-9b04-496a-8c74-608516889912';
  
  if (!process.env.NEXT_PUBLIC_SPLITS_API_KEY) {
    console.warn('⚠️ NEXT_PUBLIC_SPLITS_API_KEY is not set - Splits functionality may not work properly');
  }
  
  const splitsConfig = {
    apiConfig: {
      apiKey
    },
    publicClient
  };

  return <SplitsProvider config={splitsConfig}>{children}</SplitsProvider>;
};
