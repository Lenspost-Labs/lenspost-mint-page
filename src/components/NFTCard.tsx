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
import { usePublicClient, useSwitchChain, useAccount } from 'wagmi';
import { erc721DropABI } from '@zoralabs/zora-721-contracts';
import { formatStableTokens, formatAddress } from '@/utils';
import { ShareButton, CopyButton, Button } from '@/ui';
import { CollectionData, ParamsType } from '@/types';
import { useEffect, useState, FC } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LENSPOST_721 } from '@/contracts';
import { parseEther, Abi } from 'viem';
import { toast } from 'sonner';
import Image from 'next/image';
import useReadAptosData from '@/hooks/useReadAptosData';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosConfig, Aptos, Network } from '@aptos-labs/ts-sdk';

import { Recipients } from './Recipients';
import ShareModal from './ShareModal';
import { ConnectButton } from '.';

// Helper functions moved to outer scope
const getAptosNetwork = (chainId: undefined | string) => {
  if (!chainId) return Network.DEVNET;
  if (chainId.endsWith('1')) return Network.MAINNET;
  if (chainId.endsWith('2')) return Network.TESTNET;
  return Network.DEVNET;
};

const getAptosNetworkName = (chainId: undefined | string) => {
  if (!chainId) return 'Devnet';
  if (chainId.endsWith('1')) return 'Mainnet';
  if (chainId.endsWith('2')) return 'Testnet';
  return 'Devnet';
};

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
  title,
  collectionId
}) => {
  const { authenticated, login } = usePrivy();
  const isAptos = chainId?.toString().startsWith('Aptos:');
  console.log(chainId);

  // APTOS INTEGRATION: Destructure signAndSubmitTransaction for minting
  const {
    account: aptosAccount,
    connected: aptosConnected,
    signAndSubmitTransaction,
    wallet: aptosWallet
  } = useAptosWallet();
  const {
    chainId: currentChainId,
    address: EVMAddress,
    isConnected
  } = useAccount();

  console.log('Aptos wallet state:', {
    aptosConnected,
    aptosAccount: aptosAccount?.address,
    aptosWallet: aptosWallet?.name,
    isReady: aptosWallet?.readyState
  });

  const [aptosTxHash, setAptosTxHash] = useState('');
  const { isSuccess: isSwitchChainSuccess, switchChain } = useSwitchChain();
  const [isInputError, setIsInputError] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [quantity, setQuantity] = useState(1n);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isApprovalConfirming, setIsApprovalConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customApprovalConfirming, setCustomApprovalConfirming] =
    useState(false);
  const { isError: isReadClaimConditionError, data: readClaimConditionData } =
    useReadContractData({
      chainId: !isAptos
        ? CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.id
        : undefined,
      functionName: 'claimCondition',
      abi: LENSPOST_721?.abi as Abi,
      address: contractAddress,
      args: []
    });

  const { isError: isReadRoyaltyError, data: readRoyaltyData } =
    useReadContractData({
      chainId: !isAptos
        ? CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.id
        : undefined,
      functionName: 'getDefaultRoyaltyInfo',
      abi: LENSPOST_721?.abi as Abi,
      address: contractAddress,
      args: []
    });

  const { isError: isReadContractNameError, data: readContractName } =
    useReadContractData({
      chainId: !isAptos
        ? CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.id
        : undefined,
      abi: LENSPOST_721?.abi as Abi,
      address: contractAddress,
      functionName: 'name',
      args: []
    });

  // APTOS INTEGRATION: Fetch Aptos data when the chain is Aptos

  const aptosModuleAddress =
    '0x9bdd2119745ecc8ff07ddf7d1e6621ad288c6a83106c5610372ffa347054caec';

  console.log('NFTCard: Aptos data parameters:', {
    collectionId,
    moduleAddress: aptosModuleAddress,
    chainId: chainId?.toString(),
    isAptos
  });

  // Validate module address format
  const isValidModuleAddress =
    aptosModuleAddress?.startsWith('0x') && aptosModuleAddress.length === 66;
  console.log('NFTCard: Module address validation:', {
    isValidModuleAddress,
    moduleAddressLength: aptosModuleAddress?.length,
    moduleAddressStartsWith0x: aptosModuleAddress?.startsWith('0x')
  });

  console.log('NFTCard: Debug values:', {
    collectionIdType: typeof collectionId,
    collectionIdValue: collectionId,
    chainIdType: typeof chainId,
    chainIdValue: chainId,
    isAptosCheck: chainId?.toString().startsWith('Aptos:'),
    hasCollectionId: !!collectionId,
    hasModuleAddress: !!aptosModuleAddress
  });

  // Transform chainId for Aptos SDK if needed
  const aptosChainId = isAptos
    ? chainId?.toString().replace('Aptos:', '')
    : chainId?.toString();
  console.log('NFTCard: Transformed chainId for Aptos:', aptosChainId);

  const {
    data: aptosCollectionData,
    isError: isAptosReadError,
    isLoading: isAptosLoading
  } = useReadAptosData({
    collectionId: collectionId?.startsWith('0x')
      ? (collectionId as `0x${string}`)
      : undefined,
    moduleAddress: isValidModuleAddress
      ? (aptosModuleAddress as `0x${string}`)
      : undefined,
    chainId: aptosChainId
  });

  // Validate collectionId format for Aptos
  // 0x + 64 hex chars
  const isValidAptosCollectionId =
    collectionId?.startsWith('0x') && collectionId.length === 66;
  console.log('NFTCard: CollectionId validation:', {
    isValidAptosCollectionId,
    collectionIdLength: collectionId?.length,
    collectionIdStartsWith0x: collectionId?.startsWith('0x')
  });

  console.log('Aptos Collection Data:', aptosCollectionData);
  console.log('Aptos Read Error:', isAptosReadError);
  console.log('Aptos Loading:', isAptosLoading);
  console.log('Is Aptos Chain:', isAptos);

  // Show error message if Aptos data fails to load
  useEffect(() => {
    if (isAptos && isAptosReadError && !isAptosLoading) {
      toast.error(
        'Failed to load Aptos collection data. Please try again later.'
      );
    }
  }, [isAptos, isAptosReadError, isAptosLoading]);

  const evmClaimData = {
    quantityLimitPerWallet: readClaimConditionData?.[3],
    maxClaimableSupply: readClaimConditionData?.[1],
    startTimestamp: readClaimConditionData?.[0],
    supplyClaimed: readClaimConditionData?.[2],
    pricePerToken: readClaimConditionData?.[5],
    tokenAddress: readClaimConditionData?.[6]
  };

  // APTOS INTEGRATION: Use a unified variable set, preferring Aptos data when available.
  const currencyAddress2 = currencyAddress || evmClaimData.tokenAddress;
  const maxSupply2 = isAptos
    ? aptosCollectionData?.maxSupply || maxSupply || '0'
    : maxSupply || evmClaimData.maxClaimableSupply?.toString() || '0';
  const totalMinted2 = isAptos
    ? aptosCollectionData?.totalMinted || totalMinted || '0'
    : totalMinted || evmClaimData.supplyClaimed?.toString() || '0';
  const price2 = isAptos
    ? aptosCollectionData?.price || price || 0n
    : price || evmClaimData.pricePerToken || 0n;
  const isMinting2 = isAptos
    ? aptosCollectionData?.isMinting !== undefined
      ? aptosCollectionData.isMinting
      : isMinting || false
    : isMinting ||
      BigInt(Math.floor(Date.now() / 1000)) >= evmClaimData.startTimestamp;
  const mintQuantityLimitPerWallet = isAptos
    ? aptosCollectionData?.maxPerWallet || '1'
    : evmClaimData.quantityLimitPerWallet?.toString() || '1';

  const royaltyTokenAddress = readRoyaltyData?.[0];
  const royaltyBps = royaltyBPS || readRoyaltyData?.[1];
  const title2 = title || readContractName;
  const isSoldOut = (() => {
    if (isAptos && isAptosLoading) return false;
    if (!maxSupply2 || !totalMinted2) return false;
    return totalMinted2 === maxSupply2;
  })();

  const tokenSymbol = (() => {
    if (isAptos) {
      return 'APT';
    }
    if (currencyAddress2 === NULL_ADDRESS) {
      return (
        CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]
          ?.nativeCurrency?.symbol || 'ETH'
      );
    }
    return TOKENS?.[currencyAddress2]?.symbol || 'TOKEN';
  })();

  const isSupportedChain: boolean = (() => {
    if (isAptos) {
      // For Aptos, check if wallet is connected and has an account
      const hasAptosWallet =
        aptosConnected && aptosAccount?.address !== undefined;
      console.log('Aptos chain check:', {
        aptosConnected,
        hasAccount: aptosAccount?.address !== undefined,
        result: hasAptosWallet
      });
      return hasAptosWallet;
    } else {
      // For EVM chains
      const hasEvmWallet = authenticated && chainId == currentChainId;
      console.log('EVM chain check:', {
        authenticated,
        chainId,
        currentChainId,
        result: hasEvmWallet
      });
      return hasEvmWallet;
    }
  })();

  console.log('Wallet connection debug:', {
    isAptos,
    aptosConnected,
    aptosAccount: aptosAccount?.address,
    authenticated,
    chainId,
    currentChainId,
    isSupportedChain
  });

  const imageCdnUrl = imageUrl?.replace(R2_IMAGE_URL, CDN_IMAGE_URL) as string;
  const isContractApprove =
    currencyAddress2 && currencyAddress2 != NULL_ADDRESS;
  const mintFee = parseEther(CREATORS_REWARD_FEE);

  const formattedPrice = (() => {
    if (isAptos && aptosCollectionData?.price) {
      const priceInApt = Number(aptosCollectionData.price) / 100000000;
      return priceInApt > 0 ? priceInApt.toString() : '0';
    }
    return price2
      ? formatStableTokens(currencyAddress2, price2.toString())
      : '0';
  })();

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
      if (isAptos && mintQuantityLimitPerWallet) {
        const maxPerWallet = parseInt(mintQuantityLimitPerWallet, 10);
        if (numValue > maxPerWallet) {
          setQuantity(BigInt(maxPerWallet));
          toast.error(`Maximum ${maxPerWallet} NFTs per wallet`);
          return;
        }
      }
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
    write: {
      isApproveWriteError,
      approveWriteError,
      approveWriteData,
      isApproving,
      approve
    },
    tx: { isApproveTxSuccess, isApproveTxError, approveTxError }
  } = useApprove(approveParams);

  const {
    tx: { isTxConfirming, isTxSuccess, isTxError, txError, txData },
    write: { isWriteError, writeError, isWriting, mint721 },
    simulation: { refetchSimulation }
  } = useMint721(mintParams());

  const publicClient = usePublicClient();

  useEffect(() => {
    if (isSwitchChainSuccess) {
      refetchSimulation();
    }
  }, [isSwitchChainSuccess, refetchSimulation]);

  useEffect(() => {
    if (
      isReadClaimConditionError ||
      isReadContractNameError ||
      isReadRoyaltyError ||
      (isAptos && isAptosReadError)
    ) {
      console.error('Contract data loading errors:', {
        isReadClaimConditionError,
        isReadContractNameError,
        isReadRoyaltyError,
        isAptosReadError
      });
      toast.error('Unable to load collection details. Please try again later.');
    }
  }, [
    isReadClaimConditionError,
    isReadContractNameError,
    isReadRoyaltyError,
    isAptos,
    isAptosReadError
  ]);

  useEffect(() => {
    if (isTxSuccess) {
      toast.success('Successfully collected your NFT! 🎉');
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
      console.error('Mint/transaction error:', error?.message);

      let userMessage = 'Unable to complete the mint. Please try again.';

      if (error?.message?.includes('insufficient funds')) {
        userMessage =
          "You don't have enough funds to complete this transaction.";
      } else if (error?.message?.includes('user rejected')) {
        userMessage = 'Transaction was cancelled.';
      } else if (error?.message?.includes('gas')) {
        userMessage = 'Network is busy. Please try again with higher gas fees.';
      }

      toast.error(userMessage);
    }
  }, [isWriteError, writeError, isTxError, txError]);

  // custom approval handling
  useEffect(() => {
    if (isApproveTxError) {
      console.error('Error:', approveTxError);
      setCustomApprovalConfirming((prev) => !prev);
    }
  }, [isApproveTxError, approveTxError]);

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

  const handleAptosMint = async () => {
    console.log('handleAptosMint called with:', {
      aptosConnected,
      aptosAccount: aptosAccount?.address,
      aptosWallet: aptosWallet?.name,
      isAptos,
      chainId
    });

    if (!aptosConnected) {
      console.error('Aptos wallet not connected. Status:', {
        aptosConnected,
        aptosAccount
      });
      toast.error('Please connect your Aptos wallet.');
      return;
    }

    if (!aptosAccount?.address) {
      console.error('No Aptos account address found');
      toast.error('No Aptos account found. Please reconnect your wallet.');
      return;
    }

    if (!aptosWallet?.readyState || aptosWallet.readyState !== 'Installed') {
      console.error('Aptos wallet not ready:', aptosWallet?.readyState);
      toast.error(
        'Aptos wallet not ready. Please check your wallet connection.'
      );
      return;
    }

    // Check if we have the required data
    if (!isValidModuleAddress) {
      toast.error(
        'Invalid module address format. Please check the collection configuration.'
      );
      return;
    }

    if (!isValidAptosCollectionId) {
      toast.error(
        'Invalid collection ID format. Please check the collection configuration.'
      );
      return;
    }

    if (!aptosCollectionData || isAptosReadError) {
      toast.error('Unable to load collection data. Please try again later.');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Attempting Aptos mint with:', {
        function: `${aptosModuleAddress}::poster_test_two::mint_nft`,
        signer: aptosAccount?.address,
        collectionId: collectionId,
        quantity: quantity.toString()
      });

      const response = await signAndSubmitTransaction({
        data: {
          function: `${aptosModuleAddress}::poster_test_two::mint_nft`,
          typeArguments: [],
          functionArguments: [collectionId, quantity.toString()]
        }
      });

      // Set the transaction hash immediately
      setAptosTxHash(response.hash);

      const aptosConfig = new AptosConfig({
        network: Network.TESTNET
      });
      const aptos = new Aptos(aptosConfig);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast.success('Successfully collected your Aptos NFT!');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Aptos mint error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack
      });

      let errorMessage = 'Aptos mint failed. Please try again.';
      if (error?.message?.includes('User Rejected')) {
        errorMessage = 'Transaction was cancelled.';
      } else if (error?.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction.';
      } else if (error?.message?.includes('invalid argument')) {
        errorMessage = 'Invalid function arguments. Check console for details.';
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMint = async () => {
    // APTOS INTEGRATION: Route to the correct mint handler
    if (isAptos) {
      await handleAptosMint();
      return;
    }
    try {
      if (isContractApprove && !isApproved) {
        setIsProcessing(true);
        setIsApprovalConfirming(true);
        approve();
      } else {
        mint721();
      }
    } catch (error: any) {
      console.error('Mint handler error:', error);
      toast.error('Unable to process your mint request. Please try again.');
      setIsProcessing(false);
      setIsApprovalConfirming(false);
    }
  };

  // watching approve txs
  useEffect(() => {
    const handleApproveConfirmation = async () => {
      try {
        if (approveWriteData && publicClient && isProcessing) {
          setIsApprovalConfirming(true);
          setIsProcessing(false);
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: approveWriteData,
            confirmations: 2
          });

          if (receipt.status === 'success') {
            setIsApproved(true);
            setIsApprovalConfirming(false);
            mint721();
          }
        }
      } catch (error: any) {
        console.error('Approval confirmation error:', error);
        toast.error('Unable to confirm approval. Please try again.');
        setIsProcessing(false);
      }
    };

    handleApproveConfirmation();
  }, [approveWriteData, publicClient, mint721, isProcessing]);

  // error handling
  useEffect(() => {
    if (isApproveWriteError || isApproveTxError) {
      console.error('Error:', approveWriteError || approveTxError);
      toast.error(
        approveWriteError?.message ||
          approveTxError?.message ||
          'Unable to process your mint request. Please try again.'
      );
    }
  }, [
    isApproveWriteError,
    isApproveTxError,
    approveWriteError,
    approveTxError
  ]);

  useEffect(() => {
    if (isApproveTxError) {
      console.error('Error:', approveTxError);
      toast.error(
        approveTxError?.message?.includes('user rejected')
          ? 'Transaction was cancelled.'
          : 'Unable to process your mint request. Please try again.'
      );
    }
  }, [isApproveTxError, approveTxError]);

  return (
    <div className="h-full w-full max-w-6xl  overflow-auto rounded-3xl bg-gray-900 text-white shadow-[0_0_40px_rgba(120,120,255,0.15)]">
      <div className="flex items-center justify-between bg-gray-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/poster-logo-8.svg"
            className="h-7 w-7"
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
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  isAptos && isAptosLoading
                    ? 'bg-gray-900/60 text-gray-400'
                    : isMinting2 && !isSoldOut
                      ? 'bg-green-900/60 text-green-400'
                      : 'bg-red-900/60 text-red-400'
                }`}
              >
                {isAptos && isAptosLoading
                  ? 'Loading...'
                  : isMinting2 && !isSoldOut
                    ? 'Live Mint'
                    : isSoldOut
                      ? 'Minting Ended'
                      : 'Not Minting'}
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
                  {isAptos && isAptosLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : Number(formattedPrice) > 0 ? (
                    `${formattedPrice} ${tokenSymbol}`
                  ) : (
                    'Free'
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Network</p>
                <p className="text-sm font-bold text-white">
                  {isAptos && isAptosLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : isAptos ? (
                    `Aptos ${getAptosNetworkName(chainId?.toString())}`
                  ) : (
                    CHAIN_HELPER[chainId as keyof typeof CHAIN_HELPER]?.name ||
                    'Unknown'
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Minted</p>
                <p className="text-sm font-bold text-white">
                  {isAptos && isAptosLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <>
                      <span className="text-purple-400">{totalMinted2}</span>/
                      {maxSupply2}
                    </>
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">
                  Max Per Wallet
                </p>
                <p className="text-sm font-bold text-white">
                  {isAptos && isAptosLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    mintQuantityLimitPerWallet
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Royalty</p>
                <p className="text-sm font-bold text-white">
                  {isAptos && isAptosLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    `${royalty} %`
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-gray-800 p-3">
                <p className="text-xs font-medium text-gray-400">Contract</p>
                <div className="flex items-center gap-1 text-sm font-bold text-white">
                  {isAptos && isAptosLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <>
                      {formatAddress(contractAddress)}
                      <CopyButton
                        successMessage="Address copied!"
                        text={contractAddress as string}
                      />
                    </>
                  )}
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
                {isAptos && isAptosLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : isAptos && isAptosReadError ? (
                  <span className="text-red-400">Error</span>
                ) : (
                  <input
                    className={`w-16 rounded-md bg-gray-700 p-2 text-center font-bold text-white outline-none ring-2 ${
                      isInputError ? 'ring-red-500' : 'ring-purple-500'
                    } focus:ring-${isInputError ? 'red' : 'purple'}-400`}
                    value={quantity.toString()}
                    onChange={handleQuantity}
                    placeholder="1"
                    type="number"
                    min="1"
                    max={isAptos ? mintQuantityLimitPerWallet : undefined}
                  />
                )}
              </div>
              <div className="mt-4 w-full">
                {!authenticated && !aptosConnected ? (
                  isAptos ? (
                    <ConnectButton />
                  ) : (
                    <Button
                      title="Connect Wallet to Mint"
                      onClick={() => login()}
                    />
                  )
                ) : !isSupportedChain ? (
                  <Button
                    title={isAptos ? 'Connect Aptos Wallet' : 'Switch Network'}
                    onClick={() =>
                      isAptos
                        ? login()
                        : switchChain?.({
                            chainId:
                              CHAIN_HELPER[
                                Number(chainId) as keyof typeof CHAIN_HELPER
                              ]?.id
                          })
                    }
                  />
                ) : (
                  <Button
                    disabled={
                      isSoldOut ||
                      isProcessing ||
                      isApproving ||
                      isWriting ||
                      isTxConfirming ||
                      (isAptos && isAptosLoading) ||
                      (isAptos && isAptosReadError) ||
                      (isAptos && !aptosCollectionData) ||
                      (isAptos && !isValidAptosCollectionId) ||
                      (isAptos && !isValidModuleAddress)
                    }
                    title={
                      isProcessing || isWriting || isTxConfirming
                        ? 'Minting...'
                        : isApproving
                          ? 'Approving...'
                          : isAptos && isAptosLoading
                            ? 'Loading...'
                            : isAptos && isAptosReadError
                              ? 'Data Error'
                              : isAptos && !isValidModuleAddress
                                ? 'Invalid Module Address'
                                : isAptos && !isValidAptosCollectionId
                                  ? 'Invalid Collection ID'
                                  : isAptos && !aptosCollectionData
                                    ? 'No Data'
                                    : isSoldOut
                                      ? 'Sold Out'
                                      : 'Collect'
                    }
                    onClick={handleMint}
                  />
                )}
              </div>
              {(isProcessing || isApproving || isWriting || isTxConfirming) && (
                <div className="mt-2 text-center text-sm font-semibold text-purple-400">
                  {isProcessing &&
                    (isAptos
                      ? 'Confirming Aptos transaction...'
                      : 'Confirming transaction...')}
                  {isApproving && 'Approving token access...'}
                  {isWriting && 'Preparing transaction...'}
                  {isTxConfirming && 'Confirming transaction...'}
                </div>
              )}
              {isTxSuccess && !isAptos && (
                <div className="mt-2 text-center text-sm text-green-400">
                  <span>Transaction successful! </span>
                  <a
                    href={`${CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.blockExplorers?.default?.url}/tx/${txData?.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline"
                  >
                    View transaction
                  </a>
                </div>
              )}
              {isAptos && aptosTxHash && (
                <div className="mt-2 text-center text-sm text-green-400">
                  <span>Transaction successful! </span>
                  <a
                    href={`https://explorer.aptoslabs.com/txn/${aptosTxHash}?network=${getAptosNetworkName(chainId?.toString()).toLowerCase()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline"
                  >
                    View transaction
                  </a>
                </div>
              )}
                         {' '}
            </div>
                     {' '}
          </div>
                 {' '}
        </div>
             {' '}
      </div>
      <ShareModal
        onClose={() => setShowSuccessModal(false)}
        txHash={isAptos ? aptosTxHash : txData?.transactionHash || ''}
        chainId={chainId || 1}
        isOpen={showSuccessModal}
        title={title2 as string}
      />
    </div>
  );
};

export default NFTCard;
