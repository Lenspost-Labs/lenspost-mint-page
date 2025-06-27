'use client';

import { useWallets, usePrivy } from '@privy-io/react-auth';
import { formatAddress } from '@/utils';
import { Button } from '@/ui';
import { FC } from 'react';

const ConnectButton: FC = () => {
  const { authenticated, logout, ready, login } = usePrivy();
  const { wallets } = useWallets();

  // Get the first wallet address if available
  const address = wallets[0]?.address;

  if (!ready) {
    return <Button title="Loading..." disabled />;
  }

  return authenticated && address ? (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button title={formatAddress(address as `0x${string}`)} disabled />
      <Button variant="outline" onClick={logout} title="Logout" />
    </div>
  ) : (
    <Button title="Connect wallet" onClick={login} />
  );
};

export default ConnectButton;
