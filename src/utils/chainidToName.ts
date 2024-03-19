const chains = {
    1: "Ethereum",
    5: "Goerli",
    8453: "Base",
    84532: "Base Sepolia",
    7777777: "Zora",
    10: "Optimism",
    42161: "Arbitrum",
    0: "Unknown",
    999999999:"Zora Sepolia"
  };
  
  export const chainName = (chainId: keyof typeof chains) => {
    return chains[chainId] || null;
  };