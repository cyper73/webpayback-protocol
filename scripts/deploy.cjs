// WPT V2 Deployment Script for Polygon
// Run with: node scripts/deploy.js

const { ethers } = require('hardhat');

async function main() {
  console.log("🚀 Starting WPT V2 deployment on Polygon...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.error("❌ Insufficient MATIC balance for deployment");
    process.exit(1);
  }
  
  // Deploy contract
  console.log("🔨 Compiling and deploying WebPaybackTokenV2...");
  const WebPaybackTokenV2 = await ethers.getContractFactory("WebPaybackTokenV2");
  
  // Estimate gas
  const gasEstimate = await ethers.provider.estimateGas(
    WebPaybackTokenV2.getDeployTransaction()
  );
  console.log("⛽ Estimated gas:", gasEstimate.toString());
  
  // Deploy with optimized gas settings
  const wptV2 = await WebPaybackTokenV2.deploy({
    gasLimit: Math.floor(gasEstimate.toNumber() * 1.2), // 20% buffer
    gasPrice: ethers.utils.parseUnits("30", "gwei") // Conservative gas price
  });
  
  console.log("⏳ Waiting for deployment transaction...");
  await wptV2.deployed();
  
  console.log("✅ WPT V2 deployed successfully!");
  console.log("📍 Contract address:", wptV2.address);
  console.log("🔗 PolygonScan:", `https://polygonscan.com/address/${wptV2.address}`);
  
  // Verify deployment parameters
  console.log("\n📊 Verifying deployment parameters...");
  const name = await wptV2.name();
  const symbol = await wptV2.symbol();
  const decimals = await wptV2.decimals();
  const totalSupply = await wptV2.totalSupply();
  const creatorWallet = await wptV2.creatorWallet();
  const creatorFee = await wptV2.creatorFeeBasisPoints();
  
  console.log("📛 Name:", name);
  console.log("🏷️  Symbol:", symbol);
  console.log("🔢 Decimals:", decimals.toString());
  console.log("💎 Total Supply:", ethers.utils.formatEther(totalSupply), "WPT");
  console.log("👤 Creator Wallet:", creatorWallet);
  console.log("💸 Creator Fee:", creatorFee.toString(), "basis points (0.1%)");
  
  // Verify creator wallet is correct
  const expectedWallet = process.env.FOUNDER_WALLET || "0x***********************************************[FOUNDER]";
  if (creatorWallet.toLowerCase() !== expectedWallet.toLowerCase()) {
    console.error("❌ ERROR: Creator wallet mismatch!");
    console.error("Expected:", expectedWallet);
    console.error("Actual:", creatorWallet);
    process.exit(1);
  }
  
  // Verify fee is correct
  if (creatorFee.toString() !== "10") {
    console.error("❌ ERROR: Creator fee mismatch!");
    console.error("Expected: 10 basis points");
    console.error("Actual:", creatorFee.toString(), "basis points");
    process.exit(1);
  }
  
  console.log("✅ All parameters verified correctly!");
  
  // Test fee calculation
  console.log("\n🧮 Testing fee calculation...");
  const testAmount = ethers.utils.parseEther("1000"); // 1000 WPT
  const expectedFee = await wptV2.calculateFee(testAmount);
  const expectedFeeFormatted = ethers.utils.formatEther(expectedFee);
  console.log("💰 Fee for 1000 WPT:", expectedFeeFormatted, "WPT (should be 1.0)");
  
  if (expectedFeeFormatted !== "1.0") {
    console.error("❌ ERROR: Fee calculation incorrect!");
    process.exit(1);
  }
  
  // Deployment summary
  console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("==========================================");
  console.log("Contract Address:", wptV2.address);
  console.log("Network: Polygon Mainnet (137)");
  console.log("Deployer:", deployer.address);
  console.log("Gas Used:", gasEstimate.toString());
  console.log("==========================================");
  
  // Next steps
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   https://polygonscan.com/verifyContract?a=${wptV2.address}`);
  console.log("2. Add contract to deployment parameters:");
  console.log(`   WPT_V2_ADDRESS=${wptV2.address}`);
  console.log("3. Create Uniswap V3 pool WMATIC/WPT-V2");
  console.log("4. Test scanner compatibility:");
  console.log("   - TokenSniffer.com");
  console.log("   - HoneyPot.is");
  console.log("   - GoPlus.io");
  console.log("5. Update WebPayback Protocol configuration");
  
  // Save deployment info
  const deploymentInfo = {
    address: wptV2.address,
    deployer: deployer.address,
    network: "polygon",
    chainId: 137,
    deploymentBlock: wptV2.deployTransaction.blockNumber,
    deploymentHash: wptV2.deployTransaction.hash,
    gasUsed: gasEstimate.toString(),
    timestamp: new Date().toISOString(),
    parameters: {
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: totalSupply.toString(),
      creatorWallet,
      creatorFeeBasisPoints: creatorFee.toString()
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployments/wpt-v2-polygon.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployments/wpt-v2-polygon.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });