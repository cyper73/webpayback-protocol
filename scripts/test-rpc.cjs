const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Iniziando test di connessione RPC (Sonda per Mercoledì)...");
  
  try {
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    
    console.log(`\n✅ Connessione stabilita con successo!`);
    console.log(`🌐 Rete: ${network.name}`);
    console.log(`⛓️  Chain ID: ${network.chainId}`);
    
    const blockNumber = await provider.getBlockNumber();
    console.log(`📦 Blocco corrente sincronizzato: ${blockNumber}`);
    
    const [deployer] = await ethers.getSigners();
    console.log(`\n🧙‍♂️ Verificando l'Architetto Supremo (Deployer): ${deployer.address}`);
    
    const balance = await deployer.getBalance();
    console.log(`💎 Saldo confermato: ${ethers.utils.formatEther(balance)} $tHP`);
    
    if (balance.gt(0)) {
      console.log("\n🌟 TEST SUPERATO: Il canale è aperto e pronto per il deployment del 25 Marzo!");
    } else {
      console.log("\n⚠️ ATTENZIONE: Il canale è aperto, ma il saldo è 0. Controlla il faucet.");
    }
  } catch (error) {
    console.error("\n❌ Errore di connessione. L'RPC è ancora inaccessibile.");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
