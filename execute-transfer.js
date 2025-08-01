import { ethers } from 'ethers';

const WPT_CONTRACT_ADDRESS = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
const FOUNDER_WALLET = process.env.FOUNDER_WALLET || '0x***********************************************[FOUNDER]';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

async function executeTransfer() {
  try {
    console.log('🚀 STARTING WPT TRANSFER TO CONTRACT RESERVES');
    
    // Setup provider and signer
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(WPT_CONTRACT_ADDRESS, ERC20_ABI, signer);
    
    console.log('💰 Checking current balances...');
    
    // Check founder's balance
    const founderBalance = await contract.balanceOf(FOUNDER_WALLET);
    const contractBalance = await contract.balanceOf(WPT_CONTRACT_ADDRESS);
    
    console.log(`📊 Founder Balance: ${ethers.utils.formatUnits(founderBalance, 18)} WPT`);
    console.log(`📊 Contract Balance: ${ethers.utils.formatUnits(contractBalance, 18)} WPT`);
    
    // Transfer 1M WPT tokens
    const transferAmount = ethers.utils.parseUnits('1000000', 18);
    
    if (founderBalance < transferAmount) {
      console.log('❌ INSUFFICIENT BALANCE');
      return;
    }
    
    console.log('🔄 Executing transfer of 1,000,000 WPT...');
    
    // Execute the transfer
    const tx = await contract.transfer(WPT_CONTRACT_ADDRESS, transferAmount);
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log('✅ TRANSACTION CONFIRMED!');
    console.log(`🎯 Block Number: ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    
    // Check new balances
    const newFounderBalance = await contract.balanceOf(FOUNDER_WALLET);
    const newContractBalance = await contract.balanceOf(WPT_CONTRACT_ADDRESS);
    
    console.log('\n🎉 TRANSFER COMPLETED SUCCESSFULLY!');
    console.log(`📊 New Founder Balance: ${ethers.utils.formatUnits(newFounderBalance, 18)} WPT`);
    console.log(`📊 New Contract Balance: ${ethers.utils.formatUnits(newContractBalance, 18)} WPT`);
    console.log(`🔄 Transferred: 1,000,000 WPT`);
    
  } catch (error) {
    console.error('💥 TRANSFER FAILED:', error.message);
    if (error.reason) {
      console.error('💥 Reason:', error.reason);
    }
  }
}

executeTransfer();