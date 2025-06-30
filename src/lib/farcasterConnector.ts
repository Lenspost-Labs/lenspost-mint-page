import { SwitchChainError, numberToHex, getAddress, fromHex } from 'viem';
import { ChainNotConfiguredError, createConnector } from 'wagmi';
import sdk from '@farcaster/frame-sdk';

frameConnector.type = 'frameConnector';

export function frameConnector() {
  let connected = true;

  return createConnector((config) => ({
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      // @ts-ignore
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain({ chainId });
        currentChainId = chain.id;
      }

      connected = true;

      return {
        accounts: accounts.map((x: string) => getAddress(x)),
        chainId: currentChainId
      };
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      // @ts-ignore
      await provider.request({
        params: [{ chainId: numberToHex(chainId) }],
        method: 'wallet_switchEthereumChain'
      });
      return chain;
    },
    async getAccounts() {
      if (!connected) throw new Error('Not connected');
      const provider = await this.getProvider();
      // @ts-ignore
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });
      return accounts.map((x: string) => getAddress(x));
    },

    async getChainId() {
      const provider = await this.getProvider();
      // @ts-ignore
      const hexChainId = await provider.request({ method: 'eth_chainId' });
      return fromHex(hexChainId, 'number');
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x))
        });
    },
    async isAuthorized() {
      if (!connected) {
        return false;
      }

      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },
    async onDisconnect() {
      config.emitter.emit('disconnect');
      connected = false;
    },
    async setup() {
      this.connect({ chainId: config.chains[0].id });
    },
    async getProvider() {
      return sdk.wallet.ethProvider;
    },
    async disconnect() {
      connected = false;
    },
    type: frameConnector.type,
    name: 'Farcaster Wallet',
    id: 'farcaster'
  }));
}
