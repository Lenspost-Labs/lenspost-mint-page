'use client';

import {
  LENSPOST_ETH_ADDRESS,
  CREATORS_REWARD_FEE,
  CDN_IMAGE_URL,
  S3_IMAGE_URL,
  NULL_ADDRESS,
  CHAIN_HELPER,
  CHAIN_NAME,
  TOKENS,
  REGEX
} from '@/data';
import { erc721DropABI } from '@zoralabs/zora-721-contracts';
import { ShareButton, CopyButton, Button } from '@/ui';
import { CollectionData, ParamsType } from '@/types';
import { useSwitchChain, useAccount } from 'wagmi';
import { useApprove, useMint721 } from '@/hooks';
import { useEffect, useState, FC } from 'react';
import { LENSPOST_721 } from '@/contracts';
import { formatAddress } from '@/utils';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import Image from 'next/image';

import { ConnectButton } from '.';

const NFTCard: FC<CollectionData> = ({
  publicSaleActive,
  contractAddress,
  currencyAddress,
  contractType,
  totalMinted,
  royaltyBPS,
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

  const tokenSymbol =
    currencyAddress === NULL_ADDRESS
      ? CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]
          ?.nativeCurrency?.symbol
      : TOKENS?.[currencyAddress]?.symbol;
  const isSupportedChain: Boolean = isConnected && chainId === currentChainId;
  const imageCdnUrl = imageUrl?.replace(S3_IMAGE_URL, CDN_IMAGE_URL) as string;
  const isContractApprove = currencyAddress && currencyAddress != NULL_ADDRESS;
  const mintFee = parseEther(CREATORS_REWARD_FEE);
  const formattedPrice = Number(price) / 10 ** 18;
  const royalty = Number(royaltyBPS) / 100;
  const mintReferral = LENSPOST_ETH_ADDRESS;
  const mintTotalFee = mintFee * quantity;
  const comment = '';

  const handleQuantity = (e: any) => {
    const value = e.target.value;

    if (!REGEX?.number.test(value)) {
      setIsInputError(true);
      return;
    } else {
      setIsInputError(false);
    }

    if (value < 1 || !value) {
      setQuantity(1n);
    } else {
      setQuantity(BigInt(value));
    }
  };

  const mintParams = () => {
    if (currencyAddress) {
      let params: ParamsType = {
        args: [
          EVMAddress,
          quantity,
          currencyAddress,
          price,
          [[], quantity, price, currencyAddress],
          '0x'
        ],
        address: contractAddress,
        abi: LENSPOST_721?.abi,
        functionName: 'claim',
        chainId: chainId
      };

      if (currencyAddress === NULL_ADDRESS) {
        params = {
          ...params,
          value: price
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
    abi: TOKENS?.[currencyAddress]?.abi,
    args: [contractAddress, price],
    address: currencyAddress,
    functionName: 'approve'
  };

  const {
    tx: {
      isApproveTxConfirming,
      isApproveTxSuccess,
      isApproveTxError,
      approveTxError,
      approveTxData
    },
    write: { isApproveWriteError, approveWriteError, isApproving, approve }
  } = useApprove(approveParams);

  const {
    simulation: {
      refetchSimulation,
      isSimulateError,
      simulateError,
      isSimulating,
      simulateData
    },
    tx: { isTxConfirming, isTxSuccess, isTxError, txError, txData },
    write: { isWriteError, writeError, isWriting, mint721 }
  } = useMint721(mintParams());

  useEffect(() => {
    if (isSwitchChainSuccess) {
      refetchSimulation();
    }
  }, [isSwitchChainSuccess, refetchSimulation]);

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
      toast.error(error?.message?.split('\n')[0]);
    }
  }, [isWriteError, writeError, isTxError, txError]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col justify-between gap-8 rounded-3xl bg-white p-6 shadow-2xl sm:flex-row sm:p-10">
      <Image
        className="w-full rounded-3xl shadow-xl sm:w-1/2"
        blurDataURL={imageCdnUrl}
        alt={title as string}
        placeholder="blur"
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
          <h3 className="text-xl font-semibold sm:text-4xl">{title}</h3>
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
              {CHAIN_NAME[chainId as keyof typeof CHAIN_NAME]}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Type
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {contractType?.startsWith('ERC')
                ? contractType
                : 'ERC' + contractType}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Price
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {formattedPrice > 0 ? `${formattedPrice} ${tokenSymbol}` : 'Free'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Minting
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {publicSaleActive ? 'Now' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#11111b] sm:text-sm">
              Minted
            </p>
            <p className="text-sm text-[#11111b] sm:text-sm">
              {totalMinted}/{maxSupply}
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
              className={`w-16 rounded-md bg-slate-100 p-1 text-center outline-none ring-2 ${isInputError ? 'ring-red-500' : 'ring-blue-800'} focus:ring-${isInputError ? 'red' : 'blue'}-500`}
              onChange={handleQuantity}
              placeholder="1"
              type="text"
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
            <Button title="Approve token allowance" onClick={approve} />
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
                  ?.blockExplorers?.default +
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
