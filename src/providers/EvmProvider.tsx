'use client';

import {
  polygonMumbai,
  baseSepolia,
  optimism,
  arbitrum,
  polygon,
  mainnet,
  morph,
  zora,
  base
} from 'viem/chains';
import {
  campNetworkTestnetV2,
  storyAeneidTestnet,
  storyMainnet,
  monadTestnet
} from '@/chains';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { PRIVY_APP_ID, ENV } from '@/data';

export const privyConfig = {
  appearance: {
    walletList: [
      'coinbase_wallet',
      'detected_wallets',
      'wallet_connect',
      'farcaster'
    ],
    logo: 'https://lenspost-r2.b-cdn.net/web-assets/Poster_logo.png',
    walletChainType: 'ethereum-only',
    showWalletLoginFirst: false,
    theme: 'light' as const,
    accentColor: '#6A6FF5'
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets'
    },
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    showWalletUIs: true
  },
  loginMethods: [
    'email',
    'wallet',
    'farcaster'
    // "telegram",
    // "discord",
  ],
  fundingMethodConfig: {
    moonpay: {
      useSandbox: true
    }
  },
  mfa: {
    noPromptOnMfaRequired: false
  }
} as unknown as PrivyClientConfig;

export const wagmiAdapter = createConfig({
  chains:
    ENV == 'production'
      ? [
          base,
          mainnet,
          zora,
          optimism,
          arbitrum,
          polygon,
          storyMainnet,
          campNetworkTestnetV2,
          morph,
          monadTestnet
        ]
      : [
          base,
          baseSepolia,
          zora,
          optimism,
          arbitrum,
          polygonMumbai,
          polygon,
          storyAeneidTestnet,
          campNetworkTestnetV2,
          storyMainnet,
          morph,
          monadTestnet
        ],
  transports: {
    [campNetworkTestnetV2.id]: http(),
    [storyAeneidTestnet.id]: http(),
    [polygonMumbai.id]: http(),
    [storyMainnet.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [morph.id]: http(),
    [base.id]: http(),
    [zora.id]: http(),
    [monadTestnet.id]: http()
  },
  connectors: [miniAppConnector()]
});

const queryClient = new QueryClient();

const EvmProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiAdapter}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider appId={PRIVY_APP_ID as string} config={privyConfig}>
          {children}
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default EvmProvider;
