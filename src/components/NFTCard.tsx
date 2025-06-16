'use client';

import {
  LENSPOST_ETH_ADDRESS,
  CREATORS_REWARD_FEE,
  CDN_IMAGE_URL,
  R2_IMAGE_URL,
  NULL_ADDRESS,
  CHAIN_HELPER,
  TOKENS,
  REGEX
} from '@/data';
import { useReadContractData, useApprove, useMint721 } from '@/hooks';
import { erc721DropABI } from '@zoralabs/zora-721-contracts';
import { formatStableTokens, formatAddress } from '@/utils';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ShareButton, CopyButton, Button } from '@/ui';
import { CollectionData, ParamsType } from '@/types';
import { useSwitchChain, useAccount } from 'wagmi';
import { useEffect, useState, FC } from 'react';
import { LENSPOST_721 } from '@/contracts';
import { parseEther, Abi } from 'viem';
import { toast } from 'sonner';
import Image from 'next/image';

import { Recipients } from './Recipients';
import ShareModal from './ShareModal';
import { ConnectButton } from '.';

const NFTCard: FC<CollectionData> = ({
  contractAddress,
  currencyAddress,
  contractType,
  totalMinted,
  royaltyBPS,
  isMinting,
  maxSupply,
  imageUrl,
  chainId,
  price,
  title
}) => {
  const {
    chainId: currentChainId,
    address: EVMAddress,
    isConnected
  } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { isSuccess: isSwitchChainSuccess, switchChain } = useSwitchChain();
  const [isInputError, setIsInputError] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [quantity, setQuantity] = useState(1n);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isError: isReadClaimConditionError, data: readClaimConditionData } =
    useReadContractData({
      chainId: CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.id,
      functionName: 'claimCondition',
      abi: LENSPOST_721?.abi as Abi,
      address: contractAddress,
      args: []
    });

  const { isError: isReadRoyaltyError, data: readRoyaltyData } =
    useReadContractData({
      chainId: CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.id,
      functionName: 'getDefaultRoyaltyInfo',
      abi: LENSPOST_721?.abi as Abi,
      address: contractAddress,
      args: []
    });

  const { isError: isReadContractNameError, data: readContractName } =
    useReadContractData({
      chainId: CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.id,
      abi: LENSPOST_721?.abi as Abi,
      address: contractAddress,
      functionName: 'name',
      args: []
    });

  const claimConditionData = {
    quantityLimitPerWallet: readClaimConditionData?.[3],
    maxClaimableSupply: readClaimConditionData?.[1],
    startTimestamp: readClaimConditionData?.[0],
    supplyClaimed: readClaimConditionData?.[2],
    pricePerToken: readClaimConditionData?.[5],
    tokenAddress: readClaimConditionData?.[6],
    merkleRoot: readClaimConditionData?.[4],
    metadata: readClaimConditionData?.[7]
  };

  const {
    quantityLimitPerWallet,
    maxClaimableSupply,
    startTimestamp,
    supplyClaimed,
    pricePerToken,
    tokenAddress
  } = claimConditionData;

  const currencyAddress2 = currencyAddress || tokenAddress;
  const maxSupply2 = maxSupply || maxClaimableSupply?.toString();
  const totalMinted2 = totalMinted || supplyClaimed?.toString();
  const price2 = price || pricePerToken;
  const isMinting2 =
    isMinting || BigInt(Math.floor(Date.now() / 1000)) >= startTimestamp;
  const mintQuantityLimitPerWallet = quantityLimitPerWallet?.toString();
  const royaltyTokenAddress = readRoyaltyData?.[0];
  const royaltyBps = royaltyBPS || readRoyaltyData?.[1];
  const title2 = title || readContractName;

  const tokenSymbol =
    currencyAddress2 === NULL_ADDRESS
      ? CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]
          ?.nativeCurrency?.symbol
      : TOKENS?.[currencyAddress2]?.symbol;

  const isSupportedChain: Boolean = isConnected && chainId == currentChainId;

  const imageCdnUrl = imageUrl?.replace(R2_IMAGE_URL, CDN_IMAGE_URL) as string;
  const isContractApprove =
    currencyAddress2 && currencyAddress2 != NULL_ADDRESS;
  const mintFee = parseEther(CREATORS_REWARD_FEE);

  const formattedPrice = price2
    ? formatStableTokens(currencyAddress2, price2.toString())
    : '0';

  const royalty = Number(royaltyBps) / 100;
  const mintReferral = LENSPOST_ETH_ADDRESS;
  const mintTotalFee = mintFee * quantity;
  const comment = '';

  const contractTypeFiltered = (() => {
    if (contractType?.startsWith('ERC')) {
      return contractType;
    } else if (['ZORA721', 'LP721'].includes(contractType as string)) {
      return 'ERC721';
    } else if (contractType === 'ZORA1155') {
      return 'ERC1155';
    } else if (contractType) {
      return 'ERC' + contractType;
    } else {
      return 'ERC721';
    }
  })();

  const handleQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!REGEX?.number.test(value)) {
      setIsInputError(true);
      return;
    } else {
      setIsInputError(false);
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      setQuantity(1n);
    } else {
      setQuantity(BigInt(numValue));
    }
  };

  const mintParams = () => {
    if (contractType === 'LP721') {
      let params: ParamsType = {
        args: [
          EVMAddress,
          quantity,
          currencyAddress2,
          price2,
          [[], quantity, price2, currencyAddress2],
          '0x'
        ],
        address: contractAddress,
        chainId: Number(chainId),
        abi: LENSPOST_721?.abi,
        functionName: 'claim'
      };

      if (currencyAddress2 === NULL_ADDRESS) {
        params = {
          ...params,
          value: price2 * quantity
        };
      }

      return params;
    } else {
      let params: ParamsType = {
        args: [EVMAddress as `0x${string}`, quantity, comment, mintReferral],
        functionName: 'mintWithRewards',
        address: contractAddress,
        value: mintTotalFee,
        abi: erc721DropABI,
        chainId: chainId
      };

      return params;
    }
  };

  const approveParams = {
    abi: TOKENS?.[currencyAddress2]?.abi,
    args: [contractAddress, price2],
    address: currencyAddress2,
    functionName: 'approve'
  };

  const {
    write: { isApproving, approve },
    tx: { isApproveTxSuccess }
  } = useApprove(approveParams);

  const {
    tx: { isTxConfirming, isTxSuccess, isTxError, txError, txData },
    write: { isWriteError, writeError, isWriting, mint721 },
    simulation: { refetchSimulation }
  } = useMint721(mintParams());

  useEffect(() => {
    if (isSwitchChainSuccess) {
      refetchSimulation();
    }
  }, [isSwitchChainSuccess, refetchSimulation]);

  useEffect(() => {
    if (
      isReadClaimConditionError ||
      isReadRoyaltyError ||
      isReadContractNameError
    ) {
      toast.error('Failed to load contract data. Please try again later.');
    }
  }, [isReadClaimConditionError, isReadRoyaltyError, isReadContractNameError]);

  useEffect(() => {
    if (isTxSuccess) {
      toast.success('NFT minted successfully!');
      setShowSuccessModal(true);
    }
  }, [isTxSuccess]);

  useEffect(() => {
    if (isApproveTxSuccess) {
      setIsApproved(true);
    }
  }, [isApproveTxSuccess, isApproved]);

  useEffect(() => {
    if (isWriteError || isTxError) {
      const error: any = writeError || txError;
      toast.error(error?.message?.split('\n')[0] || 'An error occurred');
    }
  }, [isWriteError, writeError, isTxError, txError]);

  // Add allowance check for ERC20 tokens
  const { isError: isReadAllowanceError, data: currentAllowance } =
    useReadContractData({
      chainId: CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.id,
      abi: TOKENS?.[currencyAddress2]?.abi,
      args: [EVMAddress, contractAddress],
      address: currencyAddress2,
      functionName: 'allowance'
    });

  // Update isApproved based on actual allowance
  useEffect(() => {
    if (
      currencyAddress2 &&
      currencyAddress2 !== NULL_ADDRESS &&
      currentAllowance &&
      price2
    ) {
      const requiredAmount = price2 * quantity;
      const hasRequiredAllowance =
        BigInt(currentAllowance.toString()) >=
        BigInt(requiredAmount.toString());
      setIsApproved(hasRequiredAllowance);
    }
  }, [currentAllowance, currencyAddress2, price2, quantity]);

  return (
    <div className="h-full w-full max-w-6xl  overflow-auto rounded-3xl bg-gray-900 text-white shadow-[0_0_40px_rgba(120,120,255,0.15)]">
      <div className="flex items-center justify-between bg-gray-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/apple-touch-icon.png"
            className="h-auto w-auto"
            alt="Poster Logo"
            height={28}
            width={28}
          />
          <h2 className="text-lg font-bold tracking-tight text-purple-400">
            POSTER MINT
          </h2>
        </div>
        <ConnectButton />
      </div>

      <div className="flex flex-col justify-between gap-8 p-6 md:flex-row md:p-8">
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-1 shadow-xl">
            <Image
              className="aspect-square w-full rounded-xl object-cover"
              alt={title2 as string}
              src={imageCdnUrl}
              priority={true}
              height={1080}
              width={1920}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                {title2}
              </h3>
              <ShareButton successMessage="Link copied!" />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${isMinting2 ? 'bg-green-900/60 text-green-400' : 'bg-red-900/60 text-red-400'}`}
              >
                {isMinting2 ? 'Live Mint' : 'Not Minting'}
              </span>
              <span className="inline-flex rounded-full bg-blue-900/60 px-2 py-1 text-xs font-medium text-blue-400">
                {contractTypeFiltered}
              </span>
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-gray-800/50 p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Price</p>
                <p className="text-sm font-bold text-white">
                  {Number(formattedPrice) > 0
                    ? `${formattedPrice} ${tokenSymbol}`
                    : 'Free'}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Network</p>
                <p className="text-sm font-bold text-white">
                  {CHAIN_HELPER[chainId as keyof typeof CHAIN_HELPER]?.name}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Minted</p>
                <p className="text-sm font-bold text-white">
                  <span className="text-purple-400">{totalMinted2}</span>/
                  {maxSupply2}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">
                  Max Per Wallet
                </p>
                <p className="text-sm font-bold text-white">
                  {mintQuantityLimitPerWallet}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Royalty</p>
                <p className="text-sm font-bold text-white">{royalty} %</p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Contract</p>
                <div className="flex items-center gap-1 text-sm font-bold text-white">
                  {formatAddress(contractAddress)}
                  <CopyButton
                    successMessage="Address copied!"
                    text={contractAddress as string}
                  />
                </div>
              </div>

              {royaltyTokenAddress && (
                <Recipients
                  splitAddress={royaltyTokenAddress}
                  chainId={chainId || 1}
                />
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-300">
                  Quantity:
                </label>
                <input
                  className={`w-16 rounded-md bg-gray-700 p-2 text-center font-bold text-white outline-none ring-2 ${
                    isInputError ? 'ring-red-500' : 'ring-purple-500'
                  } focus:ring-${isInputError ? 'red' : 'purple'}-400`}
                  value={quantity.toString()}
                  onChange={handleQuantity}
                  placeholder="1"
                  type="number"
                  min="1"
                />
              </div>

              <div className="mt-4 w-full">
                {!isConnected ? (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    title="Connect Wallet to Mint"
                    onClick={openConnectModal}
                  />
                ) : !isSupportedChain ? (
                  <Button
                    onClick={() => {
                      switchChain?.({
                        chainId:
                          CHAIN_HELPER[
                            Number(chainId) as keyof typeof CHAIN_HELPER
                          ]?.id
                      });
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    title="Switch Network"
                  />
                ) : isContractApprove && !isApproved ? (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-white"
                    onClick={() => {
                      approve?.();
                    }}
                    title="Approve token allowance"
                    disabled={isApproving}
                  />
                ) : isApproved ? (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    onClick={mint721}
                    title="Mint NFT"
                  />
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    disabled={!isConnected || isTxSuccess}
                    onClick={mint721}
                    title="Mint NFT"
                  />
                )}
              </div>

              {(isWriting || isTxConfirming) && (
                <div className="mt-2 text-center text-sm font-semibold text-purple-400">
                  {isTxConfirming && 'Confirming transaction...'}
                  {isWriting && 'Processing...'}
                </div>
              )}

              {isTxSuccess && (
                <div className="mt-2 text-center text-sm text-green-400">
                  <span>Transaction successful! </span>
                  <a
                    href={
                      CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]
                        ?.blockExplorers?.default?.url +
                      '/tx/' +
                      txData?.transactionHash
                    }
                    className="font-medium underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    View transaction
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        onClose={() => setShowSuccessModal(false)}
        txHash={txData?.transactionHash || ''}
        chainId={Number(chainId)}
        isOpen={showSuccessModal}
        title={title2 as string}
      />
    </div>
  );
};

export default NFTCard;
