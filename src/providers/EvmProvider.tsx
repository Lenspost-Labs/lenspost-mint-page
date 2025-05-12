'use client';

import {
  campNetworkTestnetV2,
  storyAeneidTestnet,
  basecampTestnet,
  storyMainnet,
  monadTestnet,
  ham,
  og
} from '@/chains';
import {
  optimism,
  arbitrum,
  mainnet,
  polygon,
  degen,
  morph,
  base,
  zora
} from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { WALLETCONNECT_KEY } from '@/data';
import { WagmiProvider } from 'wagmi';

const config = getDefaultConfig({
  chains: [
    campNetworkTestnetV2,
    storyAeneidTestnet,
    basecampTestnet,
    storyMainnet,
    optimism,
    arbitrum,
    mainnet,
    polygon,
    degen,
    morph,
    base,
    zora,
    ham,
    og,
    monadTestnet
  ],
  projectId: WALLETCONNECT_KEY,
  appName: 'Lenspost Studio',
  ssr: true
});

const queryClient = new QueryClient();

const EvmProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default EvmProvider;
