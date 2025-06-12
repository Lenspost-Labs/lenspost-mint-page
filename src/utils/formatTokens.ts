import { TOKENS } from '@/data';

export const formatStableTokens = (tokenAddress: string, price: string) => {
  const tokenDecimals =
    TOKENS[tokenAddress as keyof typeof TOKENS]?.decimals || 18;
  if (!tokenDecimals) {
    return price;
  }
  return Number(price) / 10 ** tokenDecimals;
};
