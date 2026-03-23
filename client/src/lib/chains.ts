import { defineChain } from 'viem';

export const humanityTestnet = defineChain({
  id: 1942999413,
  name: 'Humanity Testnet',
  network: 'humanity-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tHP',
    symbol: 'tHP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.humanity.org'],
    },
    public: {
      http: ['https://rpc.testnet.humanity.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.humanity.org' },
  },
});
