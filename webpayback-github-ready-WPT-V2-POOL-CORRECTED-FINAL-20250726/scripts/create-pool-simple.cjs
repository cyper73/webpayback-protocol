// Create Uniswap V3 Pool WPOL/WPT - Simple Approach
// Run with: node scripts/create-pool-simple.cjs

const { ethers } = require('hardhat');

async function main() {
  console.log("🏊 Creating Uniswap V3 WPOL/WPT Pool (Simple)...");
  
  // Addresses
  const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
  const WPT_V2_ADDRESS = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825";
  const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Account:", deployer.address);
  
  // Factory ABI (minimal)
  const factoryABI = [
    "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
  ];
  
  // Connect to factory
  const factory = new ethers.Contract(UNISWAP_V3_FACTORY, factoryABI, deployer);
  
  // Pool parameters
  const fee = 3000; // 0.3% fee tier
  
  console.log("🔄 Creating pool for tokens:");
  console.log("WPOL:", WPOL_ADDRESS);
  console.log("WPT V2:", WPT_V2_ADDRESS);
  console.log("Fee:", fee, "basis points (0.3%)");
  
  // Check if pool exists
  const existingPool = await factory.getPool(WPOL_ADDRESS, WPT_V2_ADDRESS, fee);
  console.log("🏊 Existing pool address:", existingPool);
  
  if (existingPool === ethers.constants.AddressZero) {
    console.log("🆕 Pool doesn't exist, creating new pool...");
    
    // Create pool directly through factory
    const createTx = await factory.createPool(
      WPOL_ADDRESS,
      WPT_V2_ADDRESS,
      fee,
      { gasLimit: 3000000, gasPrice: ethers.utils.parseUnits("35", "gwei") }
    );
    
    console.log("⏳ Creating pool transaction:", createTx.hash);
    await createTx.wait();
    
    const newPoolAddress = await factory.getPool(WPOL_ADDRESS, WPT_V2_ADDRESS, fee);
    console.log("✅ Pool created at:", newPoolAddress);
    
    // Now we need to initialize it manually
    console.log("🔧 Pool created but needs initialization");
    console.log("📋 Next step: Initialize pool with initial price on Uniswap interface");
    
    console.log("\n🎯 MANUAL INITIALIZATION REQUIRED:");
    console.log("1. Go to https://app.uniswap.org/#/add");
    console.log("2. Connect your wallet");
    console.log("3. Select WPOL and WPT tokens");
    console.log("4. Set initial price: 1 WPOL = 125 WPT");
    console.log("5. Add liquidity: 39.89 WPOL + 4,986 WPT");
    console.log("6. This will initialize and add liquidity in one transaction");
  } else {
    console.log("✅ Pool already exists at:", existingPool);
  }
  
  const finalPoolAddress = await factory.getPool(WPOL_ADDRESS, WPT_V2_ADDRESS, fee);
  
  console.log("\n🏊 POOL CREATION RESULT:");
  console.log("========================================");
  console.log("Pool Address:", finalPoolAddress);
  console.log("WPOL Address:", WPOL_ADDRESS);
  console.log("WPT V2 Address:", WPT_V2_ADDRESS);
  console.log("Fee Tier: 0.3%");
  console.log("Status: Created (awaiting initialization)");
  console.log("========================================");
  
  // Save pool info
  const poolInfo = {
    poolAddress: finalPoolAddress,
    wpol: WPOL_ADDRESS,
    wptV2: WPT_V2_ADDRESS,
    fee: fee,
    network: "polygon",
    chainId: 137,
    status: "created_awaiting_initialization",
    uniswapUrl: `https://app.uniswap.org/#/add/${WPOL_ADDRESS}/${WPT_V2_ADDRESS}`,
    recommendedRatio: "1 WPOL = 125 WPT",
    recommendedLiquidity: {
      wpol: "39.89",
      wpt: "4986"
    },
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployments/wpol-wpt-pool-simple.json',
    JSON.stringify(poolInfo, null, 2)
  );
  
  console.log("💾 Pool info saved to deployments/wpol-wpt-pool-simple.json");
  console.log("\n🎉 Pool ready for manual initialization on Uniswap!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Pool creation failed:", error);
    process.exit(1);
  });