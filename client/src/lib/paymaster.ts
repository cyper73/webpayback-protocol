import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { http } from 'viem';
import { humanityTestnet } from './chains'; // Assuming a custom chain definition

const pimlicoApiKey = import.meta.env.VITE_PIMLICO_API_KEY;

// Create the paymaster client
export const paymasterClient = createPimlicoPaymasterClient({
  transport: http(`https://api.pimlico.io/v2/1942999413/rpc?apikey=${pimlicoApiKey}`),
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // Standard EntryPoint v0.6
});

/**
 * Gets the paymaster data for a transaction
 * This tells the smart wallet that Pimlico will pay for the gas
 */
export async function getPaymasterAndData(userOp: any) {
  try {
    const sponsorResult = await paymasterClient.sponsorUserOperation({
      userOperation: userOp,
    });
    return sponsorResult;
  } catch (error) {
    console.error("Paymaster sponsorship failed:", error);
    throw new Error("Impossibile sponsorizzare la transazione. Il gas non può essere coperto al momento.");
  }
}
