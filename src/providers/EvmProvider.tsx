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
  storyMainnet
} from '@/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { PRIVY_APP_ID, ENV } from '@/data';
import { http } from 'wagmi';

export const privyConfig = {
  appearance: {
    walletList: ['coinbase_wallet', 'detected_wallets', 'wallet_connect'],
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

export const config = createConfig({
  // appName: "Poster.fun",
  // projectId: WALLETCONNECT_PROJECT_ID,
  chains:
    ENV === 'production'
      ? [
          base,
          mainnet,
          zora,
          optimism,
          arbitrum,
          polygon,
          storyMainnet,
          campNetworkTestnetV2,
          morph
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
          morph
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
    [zora.id]: http()
  }
});

export const wagmiAdapter = createConfig({
  transports: {
    [campNetworkTestnetV2.id]: http(),
    [storyAeneidTestnet.id]: http(),
    [polygonMumbai.id]: http(),
    [storyMainnet.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [morph.id]: http(),
    [base.id]: http(),
    [zora.id]: http()
  },
  chains: config?.chains
});

const queryClient = new QueryClient();

const EvmProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrivyProvider appId={PRIVY_APP_ID as string} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default EvmProvider;
