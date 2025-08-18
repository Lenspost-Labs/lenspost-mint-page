'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useDisconnect as useEvmDisconnect } from 'wagmi';
import { formatAddress } from '@/utils';
import { useState, FC } from 'react';
import { toast } from 'sonner';
import {
  useWallet as useAptosWallet,
  groupAndSortWallets
} from '@aptos-labs/wallet-adapter-react';
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
  const [showMenu, setShowMenu] = useState(false);
  const { disconnect: disconnectEvm } = useEvmDisconnect();

  const {
    connected: aptosConnected,
    account: aptosAccount,
    disconnect: disconnectAptos,
    connect: connectAptos,
    notDetectedWallets = [],
    wallets = []
  } = useAptosWallet();

  const { aptosConnectWallets, installableWallets, availableWallets } =
    groupAndSortWallets([...wallets, ...notDetectedWallets]);

  const handlePrivyAuth = async () => {
    if (authenticated) {
      disconnectEvm();
      logout();
    } else {
      setIsLoading(true);
      try {
        login();
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

  // Show connect options when user needs to connect to mint
  if (!authenticated && !aptosConnected) {
    return (
      <div className="relative">
        <Button
          className="rounded-full border-0 bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-purple-700"
          title={isLoading ? 'Connecting...' : 'Connect wallet to mint'}
          onClick={() => setShowMenu((v) => !v)}
          disabled={isLoading}
        />
        <div
          className={`absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg transition-all duration-200 ${showMenu ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <div className="px-2 pb-1 text-xs font-semibold text-gray-500">
            Choose network
          </div>
          <button
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-100"
            onClick={() => {
              setShowMenu(false);
              handlePrivyAuth();
            }}
          >
            EVM (Privy)
          </button>
          <div className="my-2 h-px bg-gray-200" />
          <div className="px-2 pb-1 text-xs font-semibold text-gray-500">
            Aptos wallets
          </div>
          {[
            ...aptosConnectWallets,
            ...availableWallets,
            ...installableWallets
          ].map((wallet) => (
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  await connectAptos(wallet.name);
                  setShowMenu(false);
                } catch (error) {
                  toast.error(String(error));
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-100"
              key={wallet.name}
            >
              {wallet.icon && (
                <img
                  alt={wallet.name}
                  src={wallet.icon}
                  className="h-5 w-5 rounded"
                />
              )}
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (authenticated && user) {
    const avatarSrc = user.farcaster?.pfp ?? undefined;
    let fallback = 'U';
    if (!avatarSrc) {
      if (user.email?.address) fallback = user.email.address[0].toUpperCase();
      else if (user.wallet?.address)
        fallback = user.wallet.address.slice(2, 4).toUpperCase();
    }
    const label =
      user.email?.address ??
      (user.wallet?.address
        ? formatAddress(user.wallet.address as `0x${string}`)
        : 'User');

    return (
      <div className="relative flex items-center space-x-3">
        <div className="relative">
          <div
            className={`absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2 transition-all duration-200 ${showLogout ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
          >
            <Button
              className="rounded-full border-gray-200 bg-white/80 px-4 py-2 font-semibold text-gray-700 shadow-sm hover:bg-white"
              onClick={handlePrivyAuth}
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
        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm sm:inline">
          {label}
        </span>
      </div>
    );
  }

  if (aptosConnected && aptosAccount?.address) {
    const addressStr =
      typeof aptosAccount.address === 'string'
        ? aptosAccount.address
        : aptosAccount.address.toString();
    const fallback = addressStr.replace(/^0x/, '').slice(0, 2).toUpperCase();
    return (
      <div className="relative flex items-center space-x-3">
        <div className="relative">
          <div
            className={`absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2 transition-all duration-200 ${showLogout ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
          >
            <Button
              className="rounded-full border-gray-200 bg-white/80 px-4 py-2 font-semibold text-gray-700 shadow-sm hover:bg-white"
              onClick={() => disconnectAptos()}
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
            <Avatar fallback={fallback} />
          </button>
        </div>
        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm sm:inline">
          {addressStr.length > 12
            ? `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`
            : addressStr}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        className="rounded-full border-0 bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-purple-700"
        title={isLoading ? 'Connecting...' : 'Connect wallet'}
        onClick={() => setShowMenu((v) => !v)}
        disabled={isLoading}
      />
      <div
        className={`absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg transition-all duration-200 ${showMenu ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="px-2 pb-1 text-xs font-semibold text-gray-500">
          Choose network
        </div>
        <button
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-100"
          onClick={() => {
            setShowMenu(false);
            handlePrivyAuth();
          }}
        >
          EVM (Privy)
        </button>
        <div className="my-2 h-px bg-gray-200" />
        <div className="px-2 pb-1 text-xs font-semibold text-gray-500">
          Aptos wallets
        </div>
        {[
          ...aptosConnectWallets,
          ...availableWallets,
          ...installableWallets
        ].map((wallet) => (
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                await connectAptos(wallet.name);
                setShowMenu(false);
              } catch (error) {
                toast.error(String(error));
              } finally {
                setIsLoading(false);
              }
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-100"
            key={wallet.name}
          >
            {wallet.icon && (
              <img
                alt={wallet.name}
                src={wallet.icon}
                className="h-5 w-5 rounded"
              />
            )}
            <span>{wallet.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConnectButton;
