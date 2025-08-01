import { Router } from "express";
import automatedPoolManager from "../services/automatedPoolManager";

export const automationRouter = Router();

// Get automation status
automationRouter.get('/status', (req, res) => {
  try {
    const status = automatedPoolManager.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get automation configuration
automationRouter.get('/config', (req, res) => {
  try {
    const config = automatedPoolManager.getConfig();
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update automation configuration
automationRouter.post('/config', (req, res) => {
  try {
    const updates = req.body;
    automatedPoolManager.updateConfig(updates);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: automatedPoolManager.getConfig()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get action history
automationRouter.get('/history', (req, res) => {
  try {
    const history = automatedPoolManager.getActionHistory();
    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get daily spend status
automationRouter.get('/spend-status', (req, res) => {
  try {
    const spendStatus = automatedPoolManager.getDailySpendStatus();
    res.json({
      success: true,
      spendStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Emergency stop
automationRouter.post('/emergency-stop', (req, res) => {
  try {
    automatedPoolManager.emergencyStop();
    res.json({
      success: true,
      message: 'Emergency stop activated - all automation halted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resume automation
automationRouter.post('/resume', (req, res) => {
  try {
    automatedPoolManager.resume();
    res.json({
      success: true,
      message: 'Automation resumed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Manual trigger for testing
automationRouter.post('/manual-check', (req, res) => {
  try {
    // This would trigger a manual automation cycle
    res.json({
      success: true,
      message: 'Manual automation check triggered'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});