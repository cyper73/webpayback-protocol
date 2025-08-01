import { ethers } from 'ethers';

const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
const WMATIC_CONTRACT = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
const WMATIC_WPT_V3_POOL = '0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3';
const NONFUNGIBLE_POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

const POSITION_MANAGER_ABI = [
  'function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)'
];

async function injectWPTtoV3Pool() {
  try {
    console.log('🚀 INIEZIONE WPT IN POOL V3 WMATIC/WPT');
    console.log('═══════════════════════════════════════');
    
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Contracts
    const wptContract = new ethers.Contract(WPT_CONTRACT, ERC20_ABI, signer);
    const positionManager = new ethers.Contract(NONFUNGIBLE_POSITION_MANAGER, POSITION_MANAGER_ABI, signer);
    
    console.log('📊 Checking current balances...');
    const founderBalance = await wptContract.balanceOf(signer.address);
    console.log(`💰 WPT Balance: ${ethers.utils.formatUnits(founderBalance, 18)} WPT`);
    
    // Amount to inject (33,174 WPT to balance 265 WMATIC)
    const wptAmount = ethers.utils.parseUnits('35000', 18); // Slightly more for safety
    console.log(`🎯 WPT to inject: ${ethers.utils.formatUnits(wptAmount, 18)} WPT`);
    
    // Check and approve WPT if needed
    console.log('🔐 Checking WPT allowance...');
    const allowance = await wptContract.allowance(signer.address, NONFUNGIBLE_POSITION_MANAGER);
    
    if (allowance.lt(wptAmount)) {
      console.log('📝 Approving WPT for Position Manager...');
      const approveTx = await wptContract.approve(NONFUNGIBLE_POSITION_MANAGER, ethers.constants.MaxUint256);
      await approveTx.wait();
      console.log('✅ WPT approved');
    } else {
      console.log('✅ WPT already approved');
    }
    
    // Get current tick and create balanced position
    const v3Pool = new ethers.Contract(WMATIC_WPT_V3_POOL, [
      'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
    ], provider);
    
    const slot0 = await v3Pool.slot0();
    const currentTick = slot0.tick;
    
    console.log(`📊 Current tick: ${currentTick}`);
    
    // Create a narrower, more realistic range around current tick
    const tickSpacing = 60;
    const rangeWidth = 5000; // Smaller range for better precision
    const lowerTick = Math.floor((currentTick - rangeWidth) / tickSpacing) * tickSpacing;
    const upperTick = Math.ceil((currentTick + rangeWidth) / tickSpacing) * tickSpacing;
    
    console.log(`🎯 Calculated range: ${lowerTick} to ${upperTick}`);
    
    // For balanced liquidity, we need both tokens
    // Since there's 265 WMATIC already, we need to add proportional amounts
    const wmaticAmount = ethers.utils.parseEther('100'); // Add 100 WMATIC
    const wptAmountBalanced = ethers.utils.parseUnits('25000', 18); // Add 25K WPT
    
    // Mint parameters for V3 position
    const mintParams = {
      token0: WMATIC_CONTRACT, // WMATIC is token0
      token1: WPT_CONTRACT,    // WPT is token1  
      fee: 3000,               // 0.3% fee
      tickLower: lowerTick,    // Calculated lower tick
      tickUpper: upperTick,    // Calculated upper tick  
      amount0Desired: wmaticAmount, // Add some WMATIC too
      amount1Desired: wptAmountBalanced, // Balanced WPT amount
      amount0Min: ethers.utils.parseEther('50'), // Min WMATIC
      amount1Min: ethers.utils.parseUnits('20000', 18), // Min WPT
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
    };
    
    console.log('🔄 Creating V3 liquidity position...');
    console.log('   Token0 (WMATIC):', mintParams.token0);
    console.log('   Token1 (WPT):', mintParams.token1);
    console.log('   Fee:', mintParams.fee);
    console.log('   Tick Range:', mintParams.tickLower, 'to', mintParams.tickUpper);
    
    const mintTx = await positionManager.mint(mintParams);
    console.log(`📝 Transaction Hash: ${mintTx.hash}`);
    
    console.log('⏳ Waiting for confirmation...');
    const receipt = await mintTx.wait();
    
    console.log('✅ INIEZIONE WPT COMPLETATA!');
    console.log(`🎯 Block Number: ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    
    // Extract NFT token ID from logs
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = positionManager.interface.parseLog(log);
        return parsed.name === 'IncreaseLiquidity' || parsed.name === 'Transfer';
      } catch (e) {
        return false;
      }
    });
    
    if (mintEvent) {
      console.log('🎫 NFT Position Created Successfully');
    }
    
    console.log('\n🎉 Pool V3 dovrebbe ora essere attiva con liquidità bilanciata!');
    console.log('💰 265 WMATIC + 35,000 WPT = Pool riattivata');
    
  } catch (error) {
    console.error('💥 INIEZIONE FALLITA:', error.message);
    if (error.reason) {
      console.error('💥 Reason:', error.reason);
    }
    if (error.data) {
      console.error('💥 Data:', error.data);
    }
  }
}

injectWPTtoV3Pool();