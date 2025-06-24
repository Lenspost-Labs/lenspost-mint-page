'use client';

import { FarcasterIcon, FlashIcon, XIcon } from '@/components/icons';
import { CHAIN_HELPER } from '@/data';
import { FC } from 'react';

interface SuccessModalProps {
  onClose: () => void;
  chainId: number;
  isOpen: boolean;
  txHash: string;
  title: string;
}

const ShareModal: FC<SuccessModalProps> = ({
  chainId,
  onClose,
  isOpen,
  txHash,
  title
}) => {
  if (!isOpen) return null;

  const blockExplorerUrl =
    CHAIN_HELPER[Number(chainId) as keyof typeof CHAIN_HELPER]?.blockExplorers
      ?.default?.url;
  const mintUrl = window.location.href;

  const farcasterShareUrl = `https://farcaster.xyz/~/compose?text=${encodeURIComponent(
    `Just minted "${title}" NFT! 🎨✨\n\nMint yours`
  )}&embeds[]=${encodeURIComponent(mintUrl)}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Just minted "${title}" NFT! 🎨✨\n\nMint yours: ${mintUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-gray-900 p-6 shadow-2xl ring-1 ring-purple-500/20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <svg
              className="h-8 w-8 text-green-500"
              stroke="currentColor"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M5 13l4 4L19 7"
                strokeWidth={2}
              />
            </svg>
          </div>

          <h3 className="mb-2 text-xl font-bold text-white">
            Mint Successful! 🎉
          </h3>
          <p className="mb-6 text-gray-400">
            Your NFT has been minted successfully. Share it with the world!
          </p>

          <div className="space-y-3">
            <a
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700"
              rel="noopener noreferrer"
              href={farcasterShareUrl}
              target="_blank"
            >
              <FarcasterIcon />
              Share on Farcaster
            </a>

            <a
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              rel="noopener noreferrer"
              href={twitterShareUrl}
              target="_blank"
            >
              <XIcon className="h-5 w-5 text-white" />
              Share on X (Twitter)
            </a>

            <a
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3 font-medium text-white hover:from-red-600 hover:to-pink-600  "
              href="https://ai.poster.fun"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FlashIcon />
              Labubu-fy me!
            </a>

            {blockExplorerUrl && (
              <a
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-600"
                href={`${blockExplorerUrl}/tx/${txHash}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  stroke="currentColor"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth={2}
                  />
                </svg>
                View Transaction
              </a>
            )}
          </div>

          <button
            className="mt-4 w-full rounded-lg bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
