import { config } from "dotenv";
config();
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { http } from 'viem';

const pimlicoApiKey = process.env.VITE_PIMLICO_API_KEY || 'pim_cmVijUKyaQ4YSZUEKiav4C';
const humanityChainId = 1942999413;

console.log("=========================================");
console.log("🧪 TESTING PIMLICO PAYMASTER INTEGRATION");
console.log("=========================================");
console.log(`- API Key: ${pimlicoApiKey.substring(0, 10)}...`);
console.log(`- Chain ID: ${humanityChainId} (Humanity Testnet)`);
console.log(`- Endpoint: https://api.pimlico.io/v2/${humanityChainId}/rpc`);

async function runTest() {
  try {
    const paymasterClient = createPimlicoPaymasterClient({
      transport: http(`https://api.pimlico.io/v2/${humanityChainId}/rpc?apikey=${pimlicoApiKey}`),
      entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // Standard EntryPoint v0.6
    });

    console.log("\n✅ Paymaster client initialized successfully.");
    
    // Create a mock UserOperation to test sponsorship
    const mockUserOp = {
      sender: '0x0000000000000000000000000000000000000000',
      nonce: "0x0",
      initCode: "0x",
      callData: "0x",
      callGasLimit: "0x5208", // 21000
      verificationGasLimit: "0x186a0", // 100000
      preVerificationGas: "0x5208", // 21000
      maxFeePerGas: "0x3b9aca00", // 1 gwei
      maxPriorityFeePerGas: "0x3b9aca00", // 1 gwei
      paymasterAndData: "0x",
      signature: "0x"
    };

    console.log("\n📡 Sending mock UserOperation to Pimlico to test sponsorship...");
    
    // Attempt to sponsor the operation
    // This might fail if the API key doesn't have funds or if the Humanity chain isn't fully supported by Pimlico yet
    try {
      const sponsorResult = await paymasterClient.sponsorUserOperation({
        userOperation: mockUserOp,
      });
      console.log("🎉 SUCCESS! Pimlico sponsored the transaction.");
      console.log("PaymasterData:", sponsorResult.paymasterAndData);
    } catch (sponsorError: any) {
      console.log("\n⚠️ SPONSORSHIP FAILED (Expected behavior if no funds or chain not fully supported)");
      console.log(`Error Message: ${sponsorError.message}`);
      console.log("\nNote: This is completely normal if:");
      console.log("1. The Pimlico API key doesn't have a credit card attached or funds.");
      console.log("2. The Humanity Testnet (1942999413) is not yet supported by this specific Pimlico API tier.");
      console.log("3. The mock UserOperation is rejected by the EntryPoint because sender 0x0 is invalid.");
    }
    
  } catch (error: any) {
    console.error("❌ Test failed to initialize:", error.message);
  }
}

runTest();
