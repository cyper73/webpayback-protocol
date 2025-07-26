// Script per calcolare l'indirizzo della pool V3 senza crearla
import { ethers } from "ethers";

// Indirizzi e costanti
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const WPOL_ADDRESS = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"; // Wrapped POL
const WPT_V2_ADDRESS = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825"; // WPT V2
const FEE_TIER = 3000; // 0.3%

// Pool bytecode hash per Uniswap V3 su Polygon
const POOL_INIT_CODE_HASH = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

function computePoolAddress(factory, tokenA, tokenB, fee) {
  // Ordina i token (token0 < token1)
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() 
    ? [tokenA, tokenB] 
    : [tokenB, tokenA];

  console.log("📊 Token0 (minore):", token0);
  console.log("📊 Token1 (maggiore):", token1);
  console.log("💸 Fee Tier:", fee);

  // Crea il salt per CREATE2
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint24"],
      [token0, token1, fee]
    )
  );

  console.log("🧂 Salt:", salt);

  // Calcola l'indirizzo usando CREATE2
  const poolAddress = ethers.utils.getCreate2Address(
    factory,
    salt,
    POOL_INIT_CODE_HASH
  );

  return poolAddress;
}

async function main() {
  console.log("🧮 Calcolo indirizzo Pool Uniswap V3 POL/WPT V2...");
  console.log("🏭 Factory:", UNISWAP_V3_FACTORY);
  console.log("🪙 WPOL:", WPOL_ADDRESS);
  console.log("🪙 WPT V2:", WPT_V2_ADDRESS);
  console.log("💰 Fee:", FEE_TIER / 10000 + "%");

  const poolAddress = computePoolAddress(
    UNISWAP_V3_FACTORY,
    WPOL_ADDRESS,
    WPT_V2_ADDRESS,
    FEE_TIER
  );

  console.log("\n🎯 POOL ADDRESS CALCOLATO:", poolAddress);
  
  // Verifica se la pool esiste su blockchain
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
  const code = await provider.getCode(poolAddress);
  const exists = code !== "0x";
  
  console.log("🔍 Pool esiste on-chain:", exists ? "✅ SÌ" : "❌ NO");
  
  if (!exists) {
    console.log("💡 La pool deve essere creata prima dell'uso");
  }

  const uniswapUrl = `https://app.uniswap.org/explore/pools/polygon/${poolAddress}`;
  console.log("🔗 URL Uniswap:", uniswapUrl);

  return {
    poolAddress,
    exists,
    wpol: WPOL_ADDRESS,
    wpt: WPT_V2_ADDRESS,
    feeTier: FEE_TIER,
    uniswapUrl
  };
}

main()
  .then((result) => {
    console.log("\n✅ CALCOLO COMPLETATO:");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ ERRORE:", error);
    process.exit(1);
  });

export { main };