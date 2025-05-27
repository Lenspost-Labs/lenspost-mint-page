import {
  MFERCOIN,
  WDEGEN,
  TN100x,
  DEGEN,
  USDT,
  USDC,
  DOG,
  OG
} from '@/contracts';

const MFERCOIN_ABI = MFERCOIN?.abi;
const WDEGEN_ABI = WDEGEN?.abi;
const TN100x_ABI = TN100x?.abi;
const DEGEN_ABI = DEGEN?.abi;
const USDT_ABI = USDT?.abi;
const USDC_ABI = USDC?.abi;
const DOG_ABI = DOG?.abi;
const OG_ABI = OG?.abi;

export const TOKENS: any = {
  '0x5B5dee44552546ECEA05EDeA01DCD7Be7aa6144A': {
    name: 'The Next 100x Memecoin on Base',
    symbol: 'TN100x',
    abi: TN100x_ABI,
    chainId: 8453,
    decimals: 18
  },
  '0xEb54dACB4C2ccb64F8074eceEa33b5eBb38E5387': {
    name: 'Wrapped Degen',
    chainId: 666666666,
    symbol: 'WDEGEN',
    abi: WDEGEN_ABI,
    decimals: 18
  },
  '0xE3086852A4B125803C815a158249ae468A3254Ca': {
    abi: MFERCOIN_ABI,
    name: 'mfercoin',
    symbol: '$mfer',
    chainId: 16600,
    decimals: 18
  },
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': {
    name: 'Tether USD',
    symbol: 'USDT',
    chainId: 42161,
    abi: USDT_ABI,
    decimals: 6
  },
  '0xAfb89a09D82FBDE58f18Ac6437B3fC81724e4dF6': {
    name: 'The Doge NFT',
    symbol: 'DOG',
    chainId: 8453,
    abi: DOG_ABI,
    decimals: 18
  },
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
    name: 'USD Coin',
    symbol: 'USDC',
    chainId: 42161,
    abi: USDC_ABI,
    decimals: 6
  },
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
    name: 'USD Coin',
    symbol: 'USDC',
    chainId: 8453,
    abi: USDC_ABI,
    decimals: 6
  },
  '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed': {
    symbol: 'DEGEN',
    abi: DEGEN_ABI,
    chainId: 8453,
    name: 'Degen',
    decimals: 18
  },
  '0xeE597D163C3Fef7B594cC11746BC4099F4323Fd3': {
    symbol: 'AOGI',
    chainId: 16600,
    decimals: 18,
    name: 'AOGI',
    abi: OG_ABI
  },
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': {
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    chainId: 1,
    abi: {}
  }
};
