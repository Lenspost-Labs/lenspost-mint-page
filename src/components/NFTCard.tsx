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
import { ShareButton, CopyButton, Button } from '@/ui';
import { CollectionData, ParamsType } from '@/types';
import { formatEther, parseEther, Abi } from 'viem';
import { useSwitchChain, useAccount } from 'wagmi';
import { useEffect, useState, FC } from 'react';
import { LENSPOST_721 } from '@/contracts';
import { formatAddress } from '@/utils';
import { toast } from 'sonner';
import Image from 'next/image';

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

  const { isSuccess: isSwitchChainSuccess, switchChain } = useSwitchChain();
  const [isInputError, setIsInputError] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [quantity, setQuantity] = useState(1n);
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
  const isSupportedChain: Boolean = isConnected && chainId === currentChainId;
  const imageCdnUrl = imageUrl?.replace(R2_IMAGE_URL, CDN_IMAGE_URL) as string;
  const isContractApprove =
    currencyAddress2 && currencyAddress2 != NULL_ADDRESS;
  const mintFee = parseEther(CREATORS_REWARD_FEE);
  const formattedPrice = price2 ? formatEther(price2.toString()) : 0n;
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
        abi: LENSPOST_721?.abi,
        functionName: 'claim',
        chainId: chainId
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

  return (
    <div className="mx-auto flex max-w-4xl flex-col justify-between gap-8 rounded-3xl bg-white p-6 shadow-2xl sm:flex-row sm:p-10">
      <Image
        className="w-full rounded-3xl shadow-xl sm:w-1/2"
        alt={title2 as string}
        src={imageCdnUrl}
        priority={true}
        height={1080}
        width={1920}
      />
      <div className="w-full">
        <div className="ml-auto w-fit">
          <ConnectButton />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold sm:text-4xl">{title2}</h3>
          <ShareButton successMessage="Link copied!" />
        </div>
        <hr className="my-4 border border-dashed border-[#9E9EAD] border-opacity-30" />
        <div className="flex w-full flex-wrap gap-9">
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Contract
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              <span className="flex items-center gap-1">
                {formatAddress(contractAddress)}
                <CopyButton
                  successMessage="Address copied!"
                  text={contractAddress as string}
                />
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Network
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {CHAIN_HELPER[chainId as keyof typeof CHAIN_HELPER]?.name}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Type
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {contractTypeFiltered}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Price
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {Number(formattedPrice) > 0
                ? `${formattedPrice} ${tokenSymbol}`
                : 'Free'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Minting
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {isMinting2 ? 'Now' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Mint Per Wallet
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {mintQuantityLimitPerWallet}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Minted
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {totalMinted2}/{maxSupply2}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Royalty
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">{royalty} %</p>
          </div>
        </div>
        <hr className="my-4 border border-dashed border-[#9E9EAD] border-opacity-30" />

        <div className="mt-2 flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-2">
            <label className="text-sm font-medium text-black">Quantity:</label>
            <input
              className={`w-16 rounded-md bg-slate-100 p-1 text-center outline-none ring-2 ${
                isInputError ? 'ring-red-500' : 'ring-blue-800'
              } focus:ring-${isInputError ? 'red' : 'blue'}-500`}
              value={quantity.toString()}
              onChange={handleQuantity}
              placeholder="1"
              type="number"
              min="1"
            />
          </div>
        </div>

        <div className="mt-2 w-full rounded-lg bg-[#EBE8FD] px-4 py-2 text-center sm:w-fit">
          {!isConnected ? (
            <ConnectButton />
          ) : !isSupportedChain ? (
            <Button
              onClick={() => switchChain({ chainId: chainId as number })}
              title="Switch Network"
            />
          ) : isContractApprove && !isApproved ? (
            <Button
              title="Approve token allowance"
              onClick={() => approve?.()}
              disabled={isApproving}
            />
          ) : isApproved ? (
            <Button
              // disabled={!isConnected || isSimulateError || !simulateData}
              onClick={mint721}
              title="Mint NFT"
            />
          ) : (
            <Button
              disabled={!isConnected || isTxSuccess}
              onClick={mint721}
              title="Mint NFT"
            />
          )}
        </div>

        {(isWriting || isTxConfirming) && (
          <div className="mt-2 text-sm font-semibold ">
            {/* {isSimulating && 'Simulating...'} */}
            {isTxConfirming && 'Confirming...'}
            {isWriting && 'Writing...'}
          </div>
        )}

        {isTxSuccess && (
          <div className="mt-2 text-sm text-green-500">
            <a
              href={
                CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]
                  ?.blockExplorers?.default?.url +
                '/tx/' +
                txData?.transactionHash
              }
              rel="noreferrer"
              target="_blank"
            >
              {' '}
              View tx
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
