const { ethers } = require("hardhat");

async function main() {
  console.log("🌌 Preparando il rito di Deployment per WPTHumanRewards sulla Testnet Humanity...");
  
  // Recupera l'account del deployer
  const [deployer] = await ethers.getSigners();
  console.log("🧙‍♂️ Architetto Supremo (Deployer):", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💎 Saldo attuale ($tHP):", ethers.utils.formatEther(balance));

  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.error("❌ Errore: Saldo insufficiente di $tHP. Hai bisogno di fondi dal faucet di Humanity.");
    process.exit(1);
  }

  // --- PARAMETRI DI DEPLOYMENT (Costanti Architetturali) ---
  // In produzione, questi andrebbero presi da variabili d'ambiente.
  // Qui usiamo l'indirizzo del deployer come Founder/Platform provvisorio per il testnet.
  
  // TODO: Sostituire con l'indirizzo reale del verificatore Humanity sulla Testnet
  // Attualmente usiamo un mock address per la testnet se non lo abbiamo
  const MOCK_HUMANITY_PROTOCOL_ADDRESS = "0x0000000000000000000000000000000000000001"; 
  
  const founderWallet = process.env.FOUNDER_WALLET || deployer.address;
  const platformWallet = process.env.FOUNDER_WALLET || deployer.address; // temporaneamente usa lo stesso per i test
  const liquidityPool = process.env.FOUNDER_WALLET || deployer.address; // temporaneamente usa lo stesso per i test

  console.log("\n📜 Parametri del Contratto:");
  console.log(`- Humanity Verifier: ${MOCK_HUMANITY_PROTOCOL_ADDRESS}`);
  console.log(`- Founder Wallet:    ${founderWallet}`);
  console.log(`- Platform Wallet:   ${platformWallet}`);
  console.log(`- Liquidity Pool:    ${liquidityPool}`);

  // Deployment
  console.log("\n⏳ Evocazione dello Smart Contract in corso...");
  const WPTHumanRewards = await ethers.getContractFactory("WPTHumanRewards");
  
  const wptHuman = await WPTHumanRewards.deploy(
    MOCK_HUMANITY_PROTOCOL_ADDRESS,
    founderWallet,
    platformWallet,
    liquidityPool
  );

  console.log("⚙️  Attesa della validazione del blocco sulla zkEVM...");
  await wptHuman.deployed();

  console.log("\n✅ [FASE ALBEDO COMPLETATA] Contratto materializzato con successo!");
  console.log("📍 Indirizzo WPTHumanRewards:", wptHuman.address);
  console.log("🔗 Tx Hash:", wptHuman.deployTransaction.hash);

  // Salvataggio dei dati per riferimento futuro
  const deploymentInfo = {
    address: wptHuman.address,
    network: "humanityTestnet",
    chainId: 1942999413,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    txHash: wptHuman.deployTransaction.hash
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployments/wpt-humanity-testnet.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Artefatto di memoria salvato in: deployments/wpt-humanity-testnet.json");
  console.log("🌟 Il seme è stato piantato.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Il rituale è fallito:", error);
    process.exit(1);
  });
