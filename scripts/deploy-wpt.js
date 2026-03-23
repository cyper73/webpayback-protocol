const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying WebPayback Token v2 to Polygon...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "MATIC");
  
  // Deploy the contract
  const WebPaybackTokenV2 = await ethers.getContractFactory("WebPaybackTokenV2");
  
  console.log("⏳ Deploying contract...");
  const wpt = await WebPaybackTokenV2.deploy();
  
  console.log("⏳ Waiting for deployment...");
  await wpt.deployed();
  
  console.log("✅ WebPayback Token v2 deployed to:", wpt.address);
  console.log("🔗 Transaction hash:", wpt.deployTransaction.hash);
  
  // Verify contract parameters
  console.log("\n📋 Contract Verification:");
  console.log("Name:", await wpt.name());
  console.log("Symbol:", await wpt.symbol());
  console.log("Decimals:", await wpt.decimals());
  console.log("Total Supply:", ethers.utils.formatEther(await wpt.totalSupply()));
  console.log("Creator Wallet:", await wpt.getCreatorWallet());
  console.log("Creator Fee:", await wpt.getCreatorFee(), "basis points");
  
  // Save deployment info
  const deploymentInfo = {
    address: wpt.address,
    txHash: wpt.deployTransaction.hash,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    network: "polygon"
  };
  
  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Verify contract on Polygonscan");
  console.log("2. Create Uniswap V3 pool");
  console.log("3. Add liquidity");
  console.log("4. Update security monitoring");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });