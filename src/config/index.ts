import { baseSepolia, arbitrum, polygon, degen, base } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { ham, og } from '@/chains';

export const config = createConfig({
  transports: {
    [baseSepolia?.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [degen.id]: http(),
    [base.id]: http(),
    [ham.id]: http(),
    [og.id]: http()
  },
  chains: [baseSepolia, polygon, arbitrum, degen, base, ham, og],
  ssr: true
});
