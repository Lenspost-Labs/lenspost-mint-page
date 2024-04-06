import { backendApi } from '.';

// Environments
export const ENV = process.env.NODE_ENV;

// Environment Variables
export const WALLETCONNECT_KEY = process.env.NEXT_PUBLIC_WALLETCONNECT_KEY;

// Application
export const APP_NAME = 'Mint page';
export const DESCRIPTION = `${APP_NAME} is a platform for minting NFTs.`;
export const AUTHOR = 'Lenspost labs';
export const APP_URL = 'https://mint.poster.fun';

// Lenspost labs
export const LENSPOST_APP_NAME = 'Poster';
export const LENSPOST_DESCRIPTION = `${LENSPOST_APP_NAME} is a fun onchain 'canva' that turns NFT holders into content creators with one click drag-drop-remix! Make NFTs do more for you as you churn out DOPE memes, gifs, social content & more! The most fun way to permissionlessly collaborate, monetize & even split revenues across chains. We're NFT INFRA at the back, RAVE party in the front - powering co-creation, revenue share & social distribution with BIG MEME ENERGY!`;
export const LENSPOST_HOME_URL = 'https://poster.fun';
export const LENSPOST_APP_URL = 'https://app.poster.fun';

// Lenspost labs social
export const LENSPOST_TWITTER_USERNAME = '@Lenspostxyz';

// Lenspost labs addresses
export const LENSPOST_ETH_ADDRESS =
  '0x77fAD8D0FcfD481dAf98D0D156970A281e66761b';
export const LENSPOST_SOLANA_ADDRESS =
  '2PsV6hNEUc3rSMGqKcHTnRBemaWBQX3dYgUqVtEFxkwa';

// URLs
export const BACKEND_ENDPOINT = backendApi[ENV as keyof typeof backendApi];

// Zora
export const ZORA_REWARD_FEE = '0.000777';
