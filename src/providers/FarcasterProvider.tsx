'use client';
import farcasterFrame from '@farcaster/frame-wagmi-connector';
import FrameSDK from '@farcaster/frame-sdk';
import { connect } from 'wagmi/actions';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

import { config } from '../providers/EVM/EVMWalletProvider';
export default function FarcasterFrameProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();

  useEffect(() => {
    const init = async () => {
      const context = await FrameSDK.context;

      // Autoconnect if running in a frame.
      if (context?.client.clientFid) {
        connect(config, { connector: farcasterFrame() });
      }

      // wallet connect and acount address
      const connectedAddress = await FrameSDK.wallet.ethProvider.request({
        method: 'eth_requestAccounts'
      });

      //   saveToLocalStorage(
      //     LOCAL_STORAGE.FcComposerAuth,
      //     `FC frames-v2 ${context?.user?.fid} ${connectedAddress[0]}`
      //   );
      //   saveToLocalStorage(LOCAL_STORAGE.userAddress, connectedAddress[0]);
      //   saveToLocalStorage(LOCAL_STORAGE.fid, context?.user?.fid);
      //   saveToLocalStorage(LOCAL_STORAGE.username, context?.user?.username);
      //   saveToLocalStorage(LOCAL_STORAGE.userProfileImage, context?.user?.pfpUrl);

      // Hide splash screen and initialize frame after UI renders
      setTimeout(() => {
        FrameSDK.actions.ready();
        FrameSDK.actions?.addFrame();
      }, 500);
    };
    init();
  }, [isConnected]);

  return children;
}
