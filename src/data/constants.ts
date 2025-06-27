import { BACKEND_API } from '.';

// Environments
export const ENV = process.env.ENVIRONMENT;

// Environment Variables
export const WALLETCONNECT_KEY = process.env.NEXT_PUBLIC_WALLETCONNECT_KEY;

// Application
export const APP_NAME = 'Poster mint page';
export const APP_DESCRIPTION = `${APP_NAME} is a platform for minting NFTs.`;
export const APP_URL = 'https://mint.poster.fun';
export const AUTHOR = 'Lenspost labs';

// Lenspost labs
export const LENSPOST_APP_NAME = 'Poster';
export const LENSPOST_DESCRIPTION = `${LENSPOST_APP_NAME} is a fun onchain 'canva' that turns NFT holders into content creators with one click drag-drop-remix! Make NFTs do more for you as you churn out DOPE memes, gifs, social content & more! The most fun way to permissionlessly collaborate, monetize & even split revenues across chains. We're NFT INFRA at the back, RAVE party in the front - powering co-creation, revenue share & social distribution with BIG MEME ENERGY!`;
export const LENSPOST_APP_URL = 'https://app.poster.fun';
export const LENSPOST_HOME_URL = 'https://poster.fun';

// Lenspost labs social
export const LENSPOST_TWITTER_USERNAME = '@Lenspostxyz';

// Lenspost labs addresses
export const LENSPOST_ETH_ADDRESS =
  '0x77fAD8D0FcfD481dAf98D0D156970A281e66761b';
export const LENSPOST_SOLANA_ADDRESS =
  '2PsV6hNEUc3rSMGqKcHTnRBemaWBQX3dYgUqVtEFxkwa';
export const NULL_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// URLs
export const BACKEND_ENDPOINT = BACKEND_API[ENV as keyof typeof BACKEND_API];
export const S3_IMAGE_URL = 'https://lenspost.s3.ap-south-1.amazonaws.com';
export const R2_IMAGE_URL =
  'https://pub-2ae8c1134d9a4424b3e00475c4421a7a.r2.dev';
export const CDN_IMAGE_URL = 'https://lenspost-r2.b-cdn.net';

// Zora
export const CREATORS_REWARD_FEE = '0.000777';

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
