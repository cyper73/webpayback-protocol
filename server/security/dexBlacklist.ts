/**
 * DEX Public Wallet Blacklist
 * Lista completa di indirizzi pubblici DEX che verranno rickrollati se tentano la registrazione
 */

export const DEX_PUBLIC_WALLETS = [
  // ============ UNISWAP CONTRACTS ============
  // Uniswap V3 on Polygon
  '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b', // Universal Router 2
  '0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5', // Universal Router
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // V3 Router 2
  '0xe592427a0aece92de3edee1f18e0157c05861564', // V3 Router
  '0x1f98431c8ad98523631ae4a59f267346ea31f984', // V3 Factory
  
  // Uniswap V2 (Ethereum mainnet)
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // V2 Router 02
  '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f', // V2 Factory
  
  // ============ SUSHISWAP CONTRACTS ============
  // SushiSwap on Polygon
  '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', // SushiSwap Router
  '0xc35dadb65012ec5796536bd9864ed8773abc74c4', // SushiSwap Factory
  '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', // MiniChefV2
  '0xd08b5f3e89f1e2d6b067e0a0cbdb094e6e41e77c', // SushiX Swap
  
  // SushiSwap on Ethereum
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap Router
  '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac', // SushiSwap Factory
  
  // ============ QUICKSWAP CONTRACTS ============
  // QuickSwap V2
  '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff', // QuickSwap Router
  '0x5757371414417b8c6caad45baef941abc7d3ab32', // QuickSwap Factory
  
  // QuickSwap V3 (Algebra-based)
  '0x411b0facc3489691f28ad58c47006af5e3ab3a28', // V3 Factory
  '0x2d98e2fa9da15aa6dc9581ab097ced7af697cb92', // Pool Deployer
  '0xf5b509bb0909a69b1c207e495f687a596c168e12', // V3 Swap Router
  '0xa15f0d7377b2a0c0c10db057f641bed21028fc89', // Quoter
  
  // ============ PANCAKESWAP CONTRACTS ============
  // PancakeSwap V2 (BSC)
  '0x10ed43c718714eb63d5aa57b78b54704e256024e', // PancakeSwap Router
  '0xca143ce32fe78f1f7019d7d551a6402fc5350c73', // PancakeSwap Factory
  
  // PancakeSwap V3
  '0x13f4ea83d0bd40e75c8222255bc855a974568dd4', // V3 Router
  '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865', // V3 Factory
  
  // ============ 1INCH CONTRACTS ============
  '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch V5 Router
  '0x111111125421ca6dc452d289314280a0f8842a65', // 1inch V4 Router
  
  // ============ CURVE FINANCE ============
  '0xd51a44d3fae010294c616388b506acda1bfaae46', // Curve Registry
  '0x90e00ace148ca3b23ac1bc8c240c2a7dd9c2d7f5', // Curve Router
  
  // ============ BALANCER CONTRACTS ============
  '0xba12222222228d8ba445958a75a0704d566bf2c8', // Balancer V2 Vault
  '0x3e523749c07a51ecec84bb78a1a39d31c459b2da', // Balancer Router
  
  // ============ DYDX CONTRACTS ============
  '0x8f4f400cf33f878d99257bb0abfeb3eaa4b79b29', // dYdX Solo Margin
  '0x65f7ba4ec257af7c55fd5854e5f6356bb5e7bc33', // dYdX Exchange
  
  // ============ COMPOUND CONTRACTS ============
  '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b', // Compound Comptroller
  '0xc00e94cb662c3520282e6f5717214004a7f26888', // COMP Token
  
  // ============ AAVE CONTRACTS ============
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', // Aave Lending Pool
  '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5', // Aave Address Provider
  
  // ============ KYBER NETWORK ============
  '0x9aab3f75489902f3a48495025729a0af77d4b11e', // KyberSwap Router
  '0x1c87257f5e8609940bc751a07bb085bb7f8cdbe6', // Kyber Network Proxy
  
  // ============ WRAPPED TOKENS ============
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH (Ethereum)
  '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC (Polygon)
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB (BSC)
  
  // ============ GNOSIS SAFE WALLETS ============
  '0xd9db270c1b5e3bd161e8c8503c55ceabee709552', // Gnosis Safe Master Copy
  '0x34cfac646f301356faa8b21e94227e3583fe3f5f', // Gnosis Safe Proxy Factory
  
  // ============ EXCHANGE HOT WALLETS ============
  // Binance
  '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', // Binance Hot Wallet 1
  '0xd551234ae421e3bcba99a0da6d736074f22192ff', // Binance Hot Wallet 2
  '0x564286362092d8e7936f0549571a803b203aaced', // Binance Hot Wallet 3
  '0x0681d8db095565fe8a346fa0277bffde9c0edbbf', // Binance Hot Wallet 4
  
  // Coinbase
  '0x71660c4005ba85c37ccec55d0c4493e66fe775d3', // Coinbase Hot Wallet 1
  '0x503828976d22510aad0201ac7ec88293211d23da', // Coinbase Hot Wallet 2
  '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740', // Coinbase Hot Wallet 3
  
  // Kraken
  '0x2910543af39aba0cd09dbb2d50200b3e800a63d2', // Kraken Hot Wallet 1
  '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13', // Kraken Hot Wallet 2
  
  // Huobi
  '0xdc76cd25977e0a5ae17155770273ad58648900d3', // Huobi Hot Wallet 1
  '0xadb2b42f6bd96f5c65920b9ac88619dce4166f94', // Huobi Hot Wallet 2
  
  // ============ COMMON TEST ADDRESSES ============
  '0x0000000000000000000000000000000000000000', // Zero Address
  '0x1111111111111111111111111111111111111111', // Test Address 1
  '0x2222222222222222222222222222222222222222', // Test Address 2
  '0x1234567890123456789012345678901234567890', // Fake Test Address
  '0x123456789abcdef0123456789abcdef012345678', // Fake Hex Address
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // Dead Beef Address
  '0xcafebabecafebabecafebabecafebabecafebabe', // Cafe Babe Address
  '0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8', // 🚨 MALICIOUS BASTARD WALLET - PERMANENTLY BLACKLISTED
];

/**
 * Rickroll URL per redirect
 */
export const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1';

/**
 * Verifica se un wallet address è nella blacklist DEX
 */
export function isDEXPublicWallet(walletAddress: string): boolean {
  const address = walletAddress.toLowerCase().trim();
  return DEX_PUBLIC_WALLETS.some(dexWallet => 
    dexWallet.toLowerCase() === address
  );
}

/**
 * Verifica pattern di indirizzi fake/test comuni
 */
export function isFakeTestWallet(walletAddress: string): boolean {
  const address = walletAddress.toLowerCase().trim();
  
  // Pattern comuni di wallet fake
  const fakePatterns = [
    /^0x123+$/,           // Solo 123...
    /^0x0+$/,             // Solo zeri
    /^0x1+$/,             // Solo 1
    /^0x[a-f0-9]{0,10}$/, // Troppo corto
    /0x123\.\.\.*/,       // Contiene ...
    /.*test.*/,           // Contiene "test"
    /.*fake.*/,           // Contiene "fake"
    /.*example.*/,        // Contiene "example"
  ];
  
  return fakePatterns.some(pattern => pattern.test(address));
}

/**
 * Funzione principale di controllo sicurezza wallet
 */
export function shouldRickrollWallet(walletAddress: string): boolean {
  return isDEXPublicWallet(walletAddress) || isFakeTestWallet(walletAddress);
}