import { baseSepolia, arbitrum, polygon, degen, base } from 'wagmi/chains';
import { ham, og } from '@/chains';

export const CHAIN_HELPER = Object.freeze({
  84532: baseSepolia,
  666666666: degen,
  42161: arbitrum,
  137: polygon,
  8453: base,
  5112: ham,
  16600: og
});
