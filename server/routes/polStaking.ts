import { Router } from 'express';
import { polStakingService } from '../services/polStakingService';

const router = Router();

// Get recommended validators for POL staking
router.get('/validators', async (req, res) => {
  try {
    const validators = await polStakingService.getRecommendedValidators();
    res.json(validators);
  } catch (error) {
    console.error('Error fetching validators:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch validators' 
    });
  }
});

// Get POL staking statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await polStakingService.getStakingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching staking stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch staking statistics' 
    });
  }
});

// Delegate POL to validator
router.post('/delegate', async (req, res) => {
  try {
    const { validatorId, amount, userAddress } = req.body;
    
    if (!validatorId || !amount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: validatorId, amount, userAddress'
      });
    }

    const result = await polStakingService.delegateToValidator(
      parseInt(validatorId), 
      amount, 
      userAddress
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error delegating POL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delegate POL' 
    });
  }
});

// Calculate dual rewards
router.post('/calculate-dual-rewards', async (req, res) => {
  try {
    const { lpAmount, polAmount } = req.body;
    
    if (!lpAmount || !polAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: lpAmount, polAmount'
      });
    }

    const rewards = await polStakingService.calculateDualRewards(lpAmount, polAmount);
    res.json(rewards);
  } catch (error) {
    console.error('Error calculating dual rewards:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate dual rewards' 
    });
  }
});

// Update POL/WPT pool information
router.post('/update-pool', async (req, res) => {
  try {
    const result = await polStakingService.updatePoolInfo();
    res.json(result);
  } catch (error) {
    console.error('Error updating pool info:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update pool information' 
    });
  }
});

export default router;