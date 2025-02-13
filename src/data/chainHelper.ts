import {
  baseSepolia,
  arbitrum,
  polygon,
  degen,
  morph,
  base,
  zora
} from 'wagmi/chains';
import {
  campNetworkTestnetV2,
  storyAeneidTestnet,
  storyMainnet,
  ham,
  og
} from '@/chains';

export const CHAIN_HELPER = Object.freeze({
  325000: campNetworkTestnetV2,
  1315: storyAeneidTestnet,
  1514: storyMainnet,
  84532: baseSepolia,
  666666666: degen,
  42161: arbitrum,
  7777777: zora,
  137: polygon,
  2818: morph,
  8453: base,
  5112: ham,
  16600: og
});
