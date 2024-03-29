export const formatAddress = (address: `0x${string}`): string => {
  return `${address?.slice(0, 4)}…${address?.slice(
    address?.length - 4,
    address?.length
  )}`;
};
