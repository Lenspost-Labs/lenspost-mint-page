'use client';

import { useLoginToFrame } from '@privy-io/react-auth/farcaster';
import { usePrivy } from '@privy-io/react-auth';
import sdk from '@farcaster/frame-sdk';
import { useConnect } from 'wagmi';
import { useEffect } from 'react';

const MiniAppProvider = ({ children }: { children: React.ReactNode }) => {
  const { initLoginToFrame, loginToFrame } = useLoginToFrame();
  const { authenticated, ready } = usePrivy();
  const { connectors, connect } = useConnect();

  useEffect(() => {
    const initializeAndAuthenticate = async () => {
      try {
        // Initialize SDK
        const isMiniApp = await sdk?.isInMiniApp();
        if (isMiniApp) {
          // ready the mini app
          sdk.actions.ready();

          // Handle authentication when ready and not authenticated
          if (ready && !authenticated) {
            // Initialize a new login attempt to get a nonce for the Farcaster wallet to sign
            const { nonce } = await initLoginToFrame();
            console.log({ nonce });

            // Request a signature from Warpcast
            const result = await sdk.actions.signIn({ nonce: nonce });
            console.log({ result });

            // Send the received signature from Warpcast to Privy for authentication
            const login = await loginToFrame({
              signature: result.signature,
              message: result.message
            });
            console.log({ login });
          }

          // auto connect to the FC wallet
          connect({ connector: connectors[0] });
        }
      } catch (error) {
        console.log('farcaster sdk error', error);
      }
    };

    initializeAndAuthenticate();
  }, [ready, authenticated, initLoginToFrame, loginToFrame]);

  return children;
};

export default MiniAppProvider;
