// Create Uniswap V3 Pool WPOL/WPT - Version 2 (Fixed)
// Run with: node scripts/create-pool-v2.cjs

const { ethers } = require('hardhat');

async function main() {
  console.log("🏊 Creating Uniswap V3 WPOL/WPT Pool (Version 2)...");
  
  // Addresses
  const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
  const WPT_V2_ADDRESS = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825";
  const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  const NONFUNGIBLE_POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Account:", deployer.address);
  
  // Check MATIC balance
  const balance = await deployer.getBalance();
  console.log("💰 MATIC Balance:", ethers.utils.formatEther(balance));
  
  // Factory ABI (minimal)
  const factoryABI = [
    "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
  ];
  
  // Position Manager ABI (minimal)
  const positionManagerABI = [
    "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external payable returns (address pool)",
    "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
  ];
  
  // ERC20 ABI (minimal)
  const erc20ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)"
  ];
  
  // Connect to contracts
  const factory = new ethers.Contract(UNISWAP_V3_FACTORY, factoryABI, deployer);
  const positionManager = new ethers.Contract(NONFUNGIBLE_POSITION_MANAGER, positionManagerABI, deployer);
  const wpolToken = new ethers.Contract(WPOL_ADDRESS, erc20ABI, deployer);
  const wptToken = new ethers.Contract(WPT_V2_ADDRESS, erc20ABI, deployer);
  
  // Check token balances
  const wpolBalance = await wpolToken.balanceOf(deployer.address);
  const wptBalance = await wptToken.balanceOf(deployer.address);
  
  console.log("💎 WPOL Balance:", ethers.utils.formatEther(wpolBalance));
  console.log("💎 WPT Balance:", ethers.utils.formatEther(wptBalance));
  
  // Pool parameters
  const fee = 3000; // 0.3% fee tier
  const token0 = WPOL_ADDRESS < WPT_V2_ADDRESS ? WPOL_ADDRESS : WPT_V2_ADDRESS;
  const token1 = WPOL_ADDRESS < WPT_V2_ADDRESS ? WPT_V2_ADDRESS : WPOL_ADDRESS;
  
  console.log("🔄 Token ordering:");
  console.log("Token0 (WPOL):", token0);
  console.log("Token1 (WPT):", token1);
  
  // Check if pool exists
  const existingPool = await factory.getPool(token0, token1, fee);
  console.log("🏊 Existing pool address:", existingPool);
  
  if (existingPool === ethers.constants.AddressZero) {
    console.log("🆕 Pool doesn't exist, creating new pool...");
    
    // Calculate initial price more carefully
    // For WPOL/WPT pool: 1 WPOL ≈ 125 WPT 
    // Since token0 = WPOL, token1 = WPT, price = amount1/amount0 = 125/1 = 125
    // sqrtPriceX96 = sqrt(125) * 2^96 ≈ 11.18 * 2^96
    
    // Use Uniswap standard price calculation
    // Price = (amount_token1 / amount_token0) = 125
    // sqrtPrice = sqrt(125) ≈ 11.18
    
    const sqrtPriceX96 = "885797715256567629906265576155"; // Pre-calculated for 1:125 ratio
    
    console.log("💱 Initial price ratio: 1 WPOL = 125 WPT");
    console.log("🧮 SqrtPriceX96:", sqrtPriceX96);
    
    // Create and initialize pool
    const createPoolTx = await positionManager.createAndInitializePoolIfNecessary(
      token0,
      token1,
      fee,
      sqrtPriceX96,
      { gasLimit: 800000, gasPrice: ethers.utils.parseUnits("35", "gwei") }
    );
    
    console.log("⏳ Creating pool transaction:", createPoolTx.hash);
    await createPoolTx.wait();
    
    const newPoolAddress = await factory.getPool(token0, token1, fee);
    console.log("✅ Pool created at:", newPoolAddress);
  } else {
    console.log("✅ Pool already exists at:", existingPool);
  }
  
  // Get final pool address
  const poolAddress = await factory.getPool(token0, token1, fee);
  
  // Prepare liquidity amounts (use current balances)
  const wpolAmount = ethers.utils.parseEther("39.89"); // Available WPOL
  const wptAmount = ethers.utils.parseEther("2500000"); // 2.5M WPT tokens (half supply for liquidity)
  
  // Determine amounts based on token ordering
  const amount0Desired = token0 === WPOL_ADDRESS ? wpolAmount : wptAmount;
  const amount1Desired = token0 === WPOL_ADDRESS ? wptAmount : wpolAmount;
  
  console.log("💰 Liquidity amounts:");
  console.log("WPOL Amount:", ethers.utils.formatEther(wpolAmount));
  console.log("WPT Amount:", ethers.utils.formatEther(wptAmount));
  
  // Check if we have enough tokens
  if (wpolBalance.lt(wpolAmount)) {
    console.error("❌ Insufficient WPOL balance. Need:", ethers.utils.formatEther(wpolAmount), "Have:", ethers.utils.formatEther(wpolBalance));
    process.exit(1);
  }
  
  if (wptBalance.lt(wptAmount)) {
    console.error("❌ Insufficient WPT balance. Need:", ethers.utils.formatEther(wptAmount), "Have:", ethers.utils.formatEther(wptBalance));
    process.exit(1);
  }
  
  // Approve tokens for position manager
  console.log("✅ Approving tokens for liquidity...");
  
  const wpolAllowance = await wpolToken.allowance(deployer.address, NONFUNGIBLE_POSITION_MANAGER);
  if (wpolAllowance.lt(wpolAmount)) {
    const approveTx = await wpolToken.approve(NONFUNGIBLE_POSITION_MANAGER, wpolAmount);
    await approveTx.wait();
    console.log("✅ WPOL approved");
  }
  
  const wptAllowance = await wptToken.allowance(deployer.address, NONFUNGIBLE_POSITION_MANAGER);
  if (wptAllowance.lt(wptAmount)) {
    const approveTx = await wptToken.approve(NONFUNGIBLE_POSITION_MANAGER, wptAmount);
    await approveTx.wait();
    console.log("✅ WPT approved");
  }
  
  // Add liquidity (concentrated range around current price)
  console.log("🏊‍♂️ Adding liquidity to pool...");
  
  // Tick range for concentrated liquidity (-276320 to -276200 around 1:125 price)
  const tickLower = -276320; // Slightly below current price
  const tickUpper = -276200;  // Slightly above current price
  
  const mintParams = {
    token0: token0,
    token1: token1,
    fee: fee,
    tickLower: tickLower,
    tickUpper: tickUpper,
    amount0Desired: amount0Desired,
    amount1Desired: amount1Desired,
    amount0Min: amount0Desired.mul(90).div(100), // 10% slippage
    amount1Min: amount1Desired.mul(90).div(100), // 10% slippage
    recipient: deployer.address,
    deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
  };
  
  const mintTx = await positionManager.mint(mintParams, {
    gasLimit: 800000,
    gasPrice: ethers.utils.parseUnits("35", "gwei")
  });
  
  console.log("⏳ Adding liquidity transaction:", mintTx.hash);
  const receipt = await mintTx.wait();
  
  console.log("✅ Liquidity added successfully!");
  console.log("🎉 Pool is now live with initial liquidity!");
  
  console.log("\n🏊 POOL CREATION COMPLETE!");
  console.log("========================================");
  console.log("Pool Address:", poolAddress);
  console.log("WPOL Address:", WPOL_ADDRESS);
  console.log("WPT V2 Address:", WPT_V2_ADDRESS);
  console.log("Fee Tier: 0.3%");
  console.log("Initial Price: 1 WPOL = 125 WPT");
  console.log("Liquidity: 39.89 WPOL + 2.5M WPT");
  console.log("========================================");
  
  // Save pool info
  const poolInfo = {
    poolAddress: poolAddress,
    token0: token0,
    token1: token1,
    wpol: WPOL_ADDRESS,
    wptV2: WPT_V2_ADDRESS,
    fee: fee,
    network: "polygon",
    chainId: 137,
    initialPrice: "1 WPOL = 125 WPT",
    liquidityAdded: true,
    liquidityAmounts: {
      wpol: ethers.utils.formatEther(wpolAmount),
      wpt: ethers.utils.formatEther(wptAmount)
    },
    tickRange: {
      lower: tickLower,
      upper: tickUpper
    },
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployments/wpol-wpt-pool-v2.json',
    JSON.stringify(poolInfo, null, 2)
  );
  
  console.log("💾 Pool info saved to deployments/wpol-wpt-pool-v2.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Pool creation failed:", error);
    process.exit(1);
  });