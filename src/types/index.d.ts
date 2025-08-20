export interface CollectionData {
  contractAddress?: `0x${string}`;
  currencyAddress?: string | any;
  chainId?: undefined | number;
  publicSaleStart?: string;
  imageUrl?: string | any;
  publicSaleEnd?: string;
  message?: string | any;
  contractType?: string;
  totalMinted?: string;
  isMinting?: boolean;
  royaltyBPS?: string;
  maxSupply?: string;
  isError?: boolean;
  price?: string;
  title?: string;
  collectionId?: string;
}

export interface ParamsType {
  address?: `0x${string}` | undefined;
  value?: number | string | any;
  chainId?: undefined | number;
  functionName?: string;
  abi?: any | [];
  args?: any[];
}

export interface ContractData {
  quantityLimitPerWallet?: any;
  maxClaimableSupply?: any;
  startTimestamp?: any;
  pricePerToken?: any;
  supplyClaimed?: any;
  tokenAddress?: any;
  isError?: boolean;
  merkleRoot?: any;
  message?: string;
  metadata?: any;
}

export interface MintParams {
  address: `0x${string}`;
  functionName: string;
  chainId: number;
  value: bigint;
  abi: Object;
  args: [];
}

export interface MintFunction {
  (): void;
}
