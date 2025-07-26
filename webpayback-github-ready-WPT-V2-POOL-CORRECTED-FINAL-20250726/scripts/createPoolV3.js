// Script per creare pool Uniswap V3 POL/WPT V2 su Polygon
import { ethers } from "ethers";

// Indirizzi Uniswap V3 su Polygon
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const UNISWAP_V3_ROUTER = "0xe592427a0aece92de3edee1f18e0157c05861564";
const NONFUNGIBLE_POSITION_MANAGER = "0xc36442b4a4522e871399cd717abdd847ab11fe88";

// Token addresses
const WPOL_ADDRESS = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"; // Wrapped POL
const WPT_V2_ADDRESS = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825"; // WPT V2

// Fee tiers (0.01%, 0.05%, 0.3%, 1%)
const FEE_TIER = 3000; // 0.3% fee tier (più comune per token custom)

// ABI minimi necessari
const FACTORY_ABI = [
  "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
];

const POSITION_MANAGER_ABI = [
  "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
];

async function main() {
  console.log("🏗️  Creazione Pool Uniswap V3 POL/WPT V2...");
  
  // Setup provider e wallet
  const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📍 Wallet address:", wallet.address);
  console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "POL");
  
  // Contratti
  const factory = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, wallet);
  
  // 1. Verifica se la pool esiste già
  console.log("\n🔍 Verifico se la pool esiste già...");
  let poolAddress = await factory.getPool(WPOL_ADDRESS, WPT_V2_ADDRESS, FEE_TIER);
  
  if (poolAddress === "0x0000000000000000000000000000000000000000") {
    console.log("❌ Pool non esiste, la creo...");
    
    // 2. Crea la pool
    const createTx = await factory.createPool(WPOL_ADDRESS, WPT_V2_ADDRESS, FEE_TIER);
    console.log("⏳ Transaction hash:", createTx.hash);
    
    await createTx.wait();
    console.log("✅ Pool creata!");
    
    // Ottieni il nuovo indirizzo
    poolAddress = await factory.getPool(WPOL_ADDRESS, WPT_V2_ADDRESS, FEE_TIER);
  }
  
  console.log("\n🎯 POOL ADDRESS TROVATO:", poolAddress);
  console.log("📊 Token0 (WPOL):", WPOL_ADDRESS);
  console.log("📊 Token1 (WPT V2):", WPT_V2_ADDRESS);
  console.log("💸 Fee Tier:", FEE_TIER / 10000 + "%");
  
  // 3. Genera l'URL Uniswap
  const uniswapUrl = `https://app.uniswap.org/explore/pools/polygon/${poolAddress}`;
  console.log("\n🔗 URL Uniswap:", uniswapUrl);
  
  // 4. Aggiorna il sistema con il nuovo indirizzo
  console.log("\n🔧 Aggiorno il sistema con il nuovo indirizzo pool...");
  
  return {
    poolAddress,
    wpol: WPOL_ADDRESS,
    wpt: WPT_V2_ADDRESS,
    feeTier: FEE_TIER,
    uniswapUrl
  };
}

// Esegui direttamente se chiamato come script principale
main()
  .then((result) => {
    console.log("\n✅ POOL V3 SETUP COMPLETATO:");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ ERRORE:", error);
    process.exit(1);
  });

export { main };