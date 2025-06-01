'use client';

import { Share } from '@/assets';
import { toast } from 'sonner';
import { FC } from 'react';

interface ShareButtonProps {
  successMessage?: string;
  url?: string | any;
}
const ShareButton: FC<ShareButtonProps> = ({ successMessage, url }) => {
  return (
    <div
      className="cursor-pointer rounded-full border-2 border-gray-700 bg-gray-800 p-1.5 text-gray-300 transition-all hover:border-purple-600 hover:text-purple-400"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href || url);
        toast.success(successMessage);
      }}
    >
      <Share height={16} width={16} />
    </div>
  );
};

export default ShareButton;
