'use client';

import { usePrivy } from '@privy-io/react-auth';
import { formatAddress } from '@/utils';
import { useState, FC } from 'react';
import { toast } from 'sonner';
import { Button } from '@/ui';

const Avatar: FC<{ fallback: string; src?: string }> = ({ fallback, src }) =>
  src ? (
    <img
      className="h-8 w-8 rounded-full border border-gray-300 bg-white object-cover"
      alt="User avatar"
      src={src}
    />
  ) : (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-200 font-bold text-gray-600">
      {fallback}
    </div>
  );

const ConnectButton: FC = () => {
  const { authenticated, logout, ready, login, user } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleAuth = async () => {
    if (authenticated) {
      logout();
    } else {
      setIsLoading(true);
      try {
        await login();
      } catch (error) {
        toast.error(error as string);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!ready) {
    return <Button title="Loading..." disabled />;
  }

  if (authenticated && user) {
    // Avatar logic
    const avatarSrc = user.farcaster?.pfp ?? undefined;
    let fallback = 'U';
    if (!avatarSrc) {
      if (user.email?.address) fallback = user.email.address[0].toUpperCase();
      else if (user.wallet?.address)
        fallback = user.wallet.address.slice(2, 4).toUpperCase();
    }
    // Label logic
    const label =
      user.email?.address ??
      (user.wallet?.address
        ? formatAddress(user.wallet.address as `0x${string}`)
        : 'User');

    return (
      <div className="relative flex items-center space-x-3">
        <div className="relative">
          {/* Logout dropdown */}
          <div
            className={`absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2 transition-all duration-200 ${showLogout ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
          >
            <Button
              className="rounded-full border-gray-200 bg-white/80 px-4 py-2 font-semibold text-gray-700 shadow-sm hover:bg-white"
              onClick={handleAuth}
              variant="outline"
              title="Logout"
            />
          </div>
          <button
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => setShowLogout((v) => !v)}
            className="focus:outline-none"
            aria-label="User menu"
          >
            <Avatar fallback={fallback} src={avatarSrc} />
          </button>
        </div>
        {/* User label (optional, hide on mobile) */}
        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm sm:inline">
          {label}
        </span>
      </div>
    );
  }

  return (
    <Button
      className="rounded-full border-0 bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-purple-700"
      title={isLoading ? 'Connecting...' : 'Connect wallet'}
      onClick={handleAuth}
      disabled={isLoading}
    />
  );
};

export default ConnectButton;
