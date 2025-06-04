import {
  storyAeneidTestnet,
  basecampTestnet,
  monadTestnet,
  storyMainnet
} from '@/chains';
import { arbitrum, optimism, polygon, morph, zora, base } from 'wagmi/chains';
import { frameConnector } from '@/lib/connector';
import { polygonMumbai } from 'wagmi/chains';
import { baseSepolia } from 'wagmi/chains';
import { mainnet } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import { http } from 'wagmi';

export const config = createConfig({
  transports: {
    [mainnet.id]: http('https://eth-mainnet.public.blastapi.io'),
    [storyAeneidTestnet.id]: http(),
    [basecampTestnet.id]: http(),
    [polygonMumbai.id]: http(),
    [storyMainnet.id]: http(),
    [monadTestnet.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [morph.id]: http(),
    [base.id]: http(),
    [zora.id]: http()
  },
  chains: [
    base,
    mainnet,
    zora,
    optimism,
    arbitrum,
    polygon,
    storyMainnet,
    basecampTestnet,
    morph,
    monadTestnet
  ],
  // projectId: '7a34546f8123a1b402f47936af9d736c',
  connectors: [frameConnector()]
  // appName: 'Poster.fun'
});
