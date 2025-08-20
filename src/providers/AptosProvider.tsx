'use client';

import { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

const AptosProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect
      onError={(error) => {
        console.error('Aptos wallet error:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default AptosProvider;
