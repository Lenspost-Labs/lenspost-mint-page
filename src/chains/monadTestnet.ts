import { defineChain } from 'viem';

export const monadTestnet = defineChain({
  nativeCurrency: {
    symbol: 'MON',
    decimals: 18, // Replace this with the number of decimals for your chain's native token
    name: 'Monad Testnet'
  },
  rpcUrls: {
    default: {
      webSocket: [],
      http: ['https://testnet-rpc.monad.xyz']
    }
  },
  blockExplorers: {
    default: { url: 'https://testnet.monadexplorer.com', name: 'Explorer' }
  },
  name: 'Monad Testnet',
  network: 'monad-testnet',
  id: 10143 // Replace this with your chain's ID
});
