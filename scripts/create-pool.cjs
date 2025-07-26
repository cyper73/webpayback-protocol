// Create Uniswap V3 Pool WPOL/WPT
// Run with: node scripts/create-pool.cjs

const { ethers } = require('hardhat');

async function main() {
  console.log("🏊 Creating Uniswap V3 WPOL/WPT Pool...");
  
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
  console.log("Token0 (lower address):", token0);
  console.log("Token1 (higher address):", token1);
  
  // Check if pool exists
  const existingPool = await factory.getPool(token0, token1, fee);
  console.log("🏊 Existing pool address:", existingPool);
  
  if (existingPool === ethers.constants.AddressZero) {
    console.log("🆕 Pool doesn't exist, creating new pool...");
    
    // Calculate initial price (1 WPOL = 125 WPT based on $0.229 WPOL, target WPT price)
    // Price ratio for Uniswap V3: sqrt(price) * 2^96
    // If 1 WPOL = 125 WPT, then price = 125
    const priceRatio = 125;
    // Use string calculation to avoid overflow
    const Q96 = ethers.BigNumber.from(2).pow(96);
    const sqrtPrice = Math.sqrt(priceRatio);
    const sqrtPriceX96 = Q96.mul(Math.floor(sqrtPrice * 1000000)).div(1000000);
    
    console.log("💱 Initial price ratio: 1 WPOL = 125 WPT");
    console.log("🧮 SqrtPriceX96:", sqrtPriceX96.toString());
    
    // Create and initialize pool
    const createPoolTx = await positionManager.createAndInitializePoolIfNecessary(
      token0,
      token1,
      fee,
      sqrtPriceX96,
      { gasLimit: 500000, gasPrice: ethers.utils.parseUnits("30", "gwei") }
    );
    
    console.log("⏳ Creating pool transaction:", createPoolTx.hash);
    await createPoolTx.wait();
    
    const newPoolAddress = await factory.getPool(token0, token1, fee);
    console.log("✅ Pool created at:", newPoolAddress);
  } else {
    console.log("✅ Pool already exists at:", existingPool);
  }
  
  // Prepare liquidity amounts
  const wpolAmount = ethers.utils.parseEther("39.89"); // ~500 EUR WPOL
  const wptAmount = ethers.utils.parseEther("5000000"); // 5M WPT tokens
  
  // Determine amounts based on token ordering
  const amount0Desired = token0 === WPOL_ADDRESS ? wpolAmount : wptAmount;
  const amount1Desired = token0 === WPOL_ADDRESS ? wptAmount : wpolAmount;
  
  console.log("💰 Liquidity amounts:");
  console.log("Amount0 Desired:", ethers.utils.formatEther(amount0Desired));
  console.log("Amount1 Desired:", ethers.utils.formatEther(amount1Desired));
  
  // Check if we have enough tokens
  if (token0 === WPOL_ADDRESS) {
    if (wpolBalance.lt(wpolAmount)) {
      console.error("❌ Insufficient WPOL balance. Need:", ethers.utils.formatEther(wpolAmount), "Have:", ethers.utils.formatEther(wpolBalance));
      process.exit(1);
    }
  } else {
    if (wptBalance.lt(wptAmount)) {
      console.error("❌ Insufficient WPT balance. Need:", ethers.utils.formatEther(wptAmount), "Have:", ethers.utils.formatEther(wptBalance));
      process.exit(1);
    }
  }
  
  // Approve tokens for position manager
  console.log("✅ Approving tokens for liquidity...");
  
  if (token0 === WPOL_ADDRESS) {
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
  } else {
    const wptAllowance = await wptToken.allowance(deployer.address, NONFUNGIBLE_POSITION_MANAGER);
    if (wptAllowance.lt(wptAmount)) {
      const approveTx = await wptToken.approve(NONFUNGIBLE_POSITION_MANAGER, wptAmount);
      await approveTx.wait();
      console.log("✅ WPT approved");
    }
    
    const wpolAllowance = await wpolToken.allowance(deployer.address, NONFUNGIBLE_POSITION_MANAGER);
    if (wpolAllowance.lt(wpolAmount)) {
      const approveTx = await wpolToken.approve(NONFUNGIBLE_POSITION_MANAGER, wpolAmount);
      await approveTx.wait();
      console.log("✅ WPOL approved");
    }
  }
  
  // Add liquidity (full range for simplicity)
  console.log("🏊‍♂️ Adding liquidity to pool...");
  
  const mintParams = {
    token0: token0,
    token1: token1,
    fee: fee,
    tickLower: -887220, // Full range (minimum tick)
    tickUpper: 887220,  // Full range (maximum tick)
    amount0Desired: amount0Desired,
    amount1Desired: amount1Desired,
    amount0Min: amount0Desired.mul(95).div(100), // 5% slippage
    amount1Min: amount1Desired.mul(95).div(100), // 5% slippage
    recipient: deployer.address,
    deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
  };
  
  const mintTx = await positionManager.mint(mintParams, {
    gasLimit: 500000,
    gasPrice: ethers.utils.parseUnits("30", "gwei")
  });
  
  console.log("⏳ Adding liquidity transaction:", mintTx.hash);
  const receipt = await mintTx.wait();
  
  console.log("✅ Liquidity added successfully!");
  console.log("🎉 Pool is now live with initial liquidity!");
  
  // Get final pool address
  const finalPoolAddress = await factory.getPool(token0, token1, fee);
  
  console.log("\n🏊 POOL CREATION COMPLETE!");
  console.log("========================================");
  console.log("Pool Address:", finalPoolAddress);
  console.log("WPOL Address:", WPOL_ADDRESS);
  console.log("WPT V2 Address:", WPT_V2_ADDRESS);
  console.log("Fee Tier: 0.3%");
  console.log("Initial Liquidity: ~1000 EUR");
  console.log("========================================");
  
  // Save pool info
  const poolInfo = {
    poolAddress: finalPoolAddress,
    token0: token0,
    token1: token1,
    wpol: WPOL_ADDRESS,
    wptV2: WPT_V2_ADDRESS,
    fee: fee,
    network: "polygon",
    chainId: 137,
    liquidityAdded: true,
    liquidityAmounts: {
      wpol: ethers.utils.formatEther(wpolAmount),
      wpt: ethers.utils.formatEther(wptAmount)
    },
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployments/wpol-wpt-pool.json',
    JSON.stringify(poolInfo, null, 2)
  );
  
  console.log("💾 Pool info saved to deployments/wpol-wpt-pool.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Pool creation failed:", error);
    process.exit(1);
  });