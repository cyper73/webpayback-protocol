import { Router } from 'express';
import { ethers } from 'ethers';

const router = Router();

// Contract addresses and ABI
const WPT_CONTRACT_ADDRESS = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
const FOUNDER_WALLET = '0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba';

// Minimal ERC20 ABI for transfer operations
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

// Simple auth middleware for founder-only access
const founderOnly = (req: any, res: any, next: any) => {
  // Check if user is authenticated founder (session-based)
  const userId = req.user?.claims?.sub;
  if (userId !== '927070657') {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized: Founder access required'
    });
  }
  next();
};

// Check current balances
router.get('/balances', founderOnly, async (req: any, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const contract = new ethers.Contract(WPT_CONTRACT_ADDRESS, ERC20_ABI, provider);

    // Get balances
    const founderBalance = await contract.balanceOf(FOUNDER_WALLET);
    const contractBalance = await contract.balanceOf(WPT_CONTRACT_ADDRESS);

    res.json({
      success: true,
      balances: {
        founderWallet: ethers.formatUnits(founderBalance, 18),
        contractReserves: ethers.formatUnits(contractBalance, 18),
        founderAddress: FOUNDER_WALLET,
        contractAddress: WPT_CONTRACT_ADDRESS
      }
    });
  } catch (error: any) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch balances',
      details: error.message 
    });
  }
});

// Transfer tokens to contract reserves (founder only)
router.post('/transfer-to-reserves', founderOnly, async (req: any, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount specified'
      });
    }

    // Security check: only founder can perform this operation
    const userId = req.user?.claims?.sub;
    if (userId !== '927070657') { // Founder's Replit ID
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only founder can transfer to reserves'
      });
    }

    // Convert amount to Wei (18 decimals)
    const amountWei = ethers.parseUnits(amount.toString(), 18);
    
    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(WPT_CONTRACT_ADDRESS, ERC20_ABI, signer);

    // Check founder's balance first
    const founderBalance = await contract.balanceOf(FOUNDER_WALLET);
    if (founderBalance < amountWei) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ${ethers.formatUnits(founderBalance, 18)} WPT`
      });
    }

    // Execute transfer
    console.log(`🔄 Transferring ${amount} WPT to contract reserves...`);
    const tx = await contract.transfer(WPT_CONTRACT_ADDRESS, amountWei);
    
    console.log(`📝 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    
    console.log(`✅ Transfer completed in block ${receipt.blockNumber}`);

    // Get updated balances
    const newFounderBalance = await contract.balanceOf(FOUNDER_WALLET);
    const newContractBalance = await contract.balanceOf(WPT_CONTRACT_ADDRESS);

    res.json({
      success: true,
      transaction: {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        amount: amount.toString()
      },
      balances: {
        founderWallet: ethers.formatUnits(newFounderBalance, 18),
        contractReserves: ethers.formatUnits(newContractBalance, 18)
      },
      message: `Successfully transferred ${amount} WPT to contract reserves`
    });

  } catch (error: any) {
    console.error('Error transferring to reserves:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to transfer tokens',
      details: error.message 
    });
  }
});

// Get transfer history (simplified)
router.get('/transfer-history', founderOnly, async (req: any, res) => {
  try {
    res.json({
      success: true,
      transfers: [],
      message: 'Transfer history feature will be implemented with event filtering'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transfer history' 
    });
  }
});

export default router;