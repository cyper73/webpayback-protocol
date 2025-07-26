/**
 * Reentrancy Protection for WebPayback Protocol Smart Contract Operations
 * Prevents callback attacks and recursive function calls in financial operations
 */

import { Request, Response, NextFunction } from 'express';

// Track active smart contract operations to prevent reentrancy
interface ActiveOperation {
  operationId: string;
  contractAddress: string;
  functionName: string;
  userAddress: string;
  startTime: number;
  gasLimit: number;
  value: string;
  callDepth: number;
}

// Reentrancy protection storage
const activeOperations = new Map<string, ActiveOperation>();
const operationHistory = new Map<string, number>(); // Track call frequency
const suspiciousAddresses = new Set<string>(); // Flagged addresses

// Configuration for reentrancy detection
const REENTRANCY_CONFIG = {
  MAX_CALL_DEPTH: 10,           // Maximum recursive calls allowed
  SUSPICIOUS_CALL_DEPTH: 5,     // Flag as suspicious after this depth
  MAX_CONCURRENT_OPS: 3,        // Max operations per address
  CALL_FREQUENCY_LIMIT: 10,     // Max calls per minute per address
  HIGH_RISK_FUNCTIONS: [
    'withdraw',
    'transfer', 
    'emergencyWithdraw',
    'distributeReward',
    'claimReward',
    'deposit',
    'approve',
    'transferFrom'
  ],
  SUSPICIOUS_GAS_PATTERNS: {
    MIN_SUSPICIOUS_GAS: 500000,  // Gas usage above this is suspicious
    MAX_NORMAL_GAS: 200000       // Normal operations should use less
  }
};

// Generate operation ID for tracking
const generateOperationId = (req: Request, contractCall: any): string => {
  const userAddress = contractCall.userAddress || 'unknown';
  const contractAddress = contractCall.contractAddress || 'unknown';
  const functionName = contractCall.functionName || 'unknown';
  const timestamp = Date.now();
  
  return `${userAddress}-${contractAddress}-${functionName}-${timestamp}`;
};

// Check if function is high-risk for reentrancy
const isHighRiskFunction = (functionName: string): boolean => {
  return REENTRANCY_CONFIG.HIGH_RISK_FUNCTIONS.some(risk => 
    functionName.toLowerCase().includes(risk.toLowerCase())
  );
};

// Analyze transaction data for suspicious patterns
const analyzeTransactionData = (contractCall: any): {
  riskScore: number;
  riskFactors: string[];
} => {
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Check if function is high-risk
  if (isHighRiskFunction(contractCall.functionName)) {
    riskScore += 30;
    riskFactors.push('High-risk function detected');
  }

  // Check gas usage patterns
  const gasLimit = parseInt(contractCall.gasLimit || '0');
  if (gasLimit > REENTRANCY_CONFIG.SUSPICIOUS_GAS_PATTERNS.MIN_SUSPICIOUS_GAS) {
    riskScore += 25;
    riskFactors.push('Suspicious gas usage pattern');
  }

  // Check for complex transaction data
  const dataSize = contractCall.data ? contractCall.data.length : 0;
  if (dataSize > 1000) { // Large data payload
    riskScore += 20;
    riskFactors.push('Complex transaction data');
  }

  // Check for zero-value transactions with complex data (common in exploits)
  const value = parseFloat(contractCall.value || '0');
  if (value === 0 && dataSize > 500) {
    riskScore += 30;
    riskFactors.push('Zero-value transaction with complex payload');
  }

  // Check call frequency
  const userAddress = contractCall.userAddress;
  const recentCalls = operationHistory.get(userAddress) || 0;
  if (recentCalls > REENTRANCY_CONFIG.CALL_FREQUENCY_LIMIT) {
    riskScore += 35;
    riskFactors.push('High call frequency detected');
  }

  return { riskScore, riskFactors };
};

// Check call depth for recursive patterns
const checkCallDepth = (userAddress: string, contractAddress: string): number => {
  let depth = 0;
  
  activeOperations.forEach((op) => {
    if (op.userAddress === userAddress && op.contractAddress === contractAddress) {
      depth = Math.max(depth, op.callDepth);
    }
  });
  
  return depth + 1;
};

// Main reentrancy protection middleware
export const reentrancyProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract contract call information from request
    const contractCall = {
      userAddress: req.body.userAddress || req.body.walletAddress,
      contractAddress: req.body.contractAddress || req.body.to,
      functionName: req.body.functionName || req.body.method || 'unknown',
      gasLimit: req.body.gasLimit || req.body.gas,
      value: req.body.value || req.body.amount,
      data: req.body.data || req.body.input
    };

    // Skip if not a contract interaction
    if (!contractCall.contractAddress || !contractCall.userAddress) {
      return next();
    }

    const operationId = generateOperationId(req, contractCall);
    const userAddress = contractCall.userAddress;
    const contractAddress = contractCall.contractAddress;

    // Check call depth for reentrancy patterns
    const callDepth = checkCallDepth(userAddress, contractAddress);
    
    if (callDepth > REENTRANCY_CONFIG.MAX_CALL_DEPTH) {
      console.log(`🚨 REENTRANCY ATTACK DETECTED: Call depth ${callDepth} exceeds limit for ${userAddress}`);
      
      return res.status(403).json({
        error: 'Reentrancy attack detected. Transaction blocked.',
        code: 'REENTRANCY_DETECTED',
        details: {
          callDepth,
          maxAllowed: REENTRANCY_CONFIG.MAX_CALL_DEPTH,
          userAddress: userAddress.slice(0, 6) + '...' + userAddress.slice(-4)
        }
      });
    }

    // Check concurrent operations limit
    const userActiveOps = Array.from(activeOperations.values())
      .filter(op => op.userAddress === userAddress).length;
    
    if (userActiveOps >= REENTRANCY_CONFIG.MAX_CONCURRENT_OPS) {
      console.log(`⚠️ REENTRANCY: Too many concurrent operations for ${userAddress}`);
      
      return res.status(429).json({
        error: 'Too many concurrent operations. Please wait.',
        code: 'TOO_MANY_OPERATIONS',
        details: {
          activeOperations: userActiveOps,
          maxAllowed: REENTRANCY_CONFIG.MAX_CONCURRENT_OPS
        }
      });
    }

    // Analyze transaction for suspicious patterns
    const { riskScore, riskFactors } = analyzeTransactionData(contractCall);

    // Block high-risk transactions
    if (riskScore >= 90) {
      console.log(`🚨 HIGH RISK TRANSACTION BLOCKED: Score ${riskScore}% for ${userAddress}`);
      suspiciousAddresses.add(userAddress);
      
      return res.status(403).json({
        error: 'High-risk transaction pattern detected.',
        code: 'HIGH_RISK_TRANSACTION',
        details: {
          riskScore,
          riskFactors,
          recommendation: 'Transaction blocked for security reasons'
        }
      });
    }

    // Flag suspicious activity but allow with warning
    if (riskScore >= 50) {
      console.log(`⚠️ SUSPICIOUS TRANSACTION: Score ${riskScore}% for ${userAddress}`);
      suspiciousAddresses.add(userAddress);
      
      // Add warning headers
      res.set({
        'X-Reentrancy-Warning': 'Suspicious activity detected',
        'X-Risk-Score': riskScore.toString(),
        'X-Risk-Factors': riskFactors.join(', ')
      });
    }

    // Flag suspicious call depth
    if (callDepth >= REENTRANCY_CONFIG.SUSPICIOUS_CALL_DEPTH) {
      console.log(`⚠️ SUSPICIOUS CALL DEPTH: Depth ${callDepth} for ${userAddress}`);
      
      res.set({
        'X-Call-Depth': callDepth.toString(),
        'X-Call-Depth-Warning': 'High call depth detected'
      });
    }

    // Track operation
    const operation: ActiveOperation = {
      operationId,
      contractAddress,
      functionName: contractCall.functionName,
      userAddress,
      startTime: Date.now(),
      gasLimit: parseInt(contractCall.gasLimit || '0'),
      value: contractCall.value || '0',
      callDepth
    };

    activeOperations.set(operationId, operation);

    // Update call frequency tracking
    const currentCount = operationHistory.get(userAddress) || 0;
    operationHistory.set(userAddress, currentCount + 1);

    // Clean up operation when response completes
    res.on('finish', () => {
      activeOperations.delete(operationId);
      
      console.log(`✅ REENTRANCY: Operation completed - ${operationId}`);
      console.log(`📊 REENTRANCY: Risk Score ${riskScore}%, Call Depth ${callDepth}`);
    });

    // Log legitimate operation
    console.log(`🔒 REENTRANCY CHECK: ${contractCall.functionName} on ${contractAddress.slice(0, 6)}... (Risk: ${riskScore}%, Depth: ${callDepth})`);

    next();

  } catch (error) {
    console.error('Reentrancy Protection Error:', error);
    res.status(500).json({
      error: 'Reentrancy protection check failed',
      code: 'REENTRANCY_CHECK_FAILED'
    });
  }
};

// Reentrancy protection specifically for reward distribution
export const rewardReentrancyProtection = (req: Request, res: Response, next: NextFunction): void => {
  const { creatorId, amount, transactionHash } = req.body;

  // Enhanced checks for financial operations
  if (amount && parseFloat(amount) > 1000) { // Large amounts
    console.log(`⚠️ LARGE REWARD DISTRIBUTION: ${amount} WPT to creator ${creatorId}`);
    
    res.set({
      'X-Large-Transaction': 'true',
      'X-Amount': amount
    });
  }

  // Apply general reentrancy protection
  reentrancyProtection(req, res, next);
};

// Get reentrancy statistics
export const getReentrancyStats = (): any => {
  const now = Date.now();
  const activeOpsArray = Array.from(activeOperations.values());
  
  // Clean old operations (older than 5 minutes)
  activeOperations.forEach((op, id) => {
    if (now - op.startTime > 5 * 60 * 1000) {
      activeOperations.delete(id);
    }
  });

  return {
    activeOperations: activeOperations.size,
    suspiciousAddresses: suspiciousAddresses.size,
    recentActivity: activeOpsArray.map(op => ({
      functionName: op.functionName,
      contractAddress: op.contractAddress.slice(0, 6) + '...',
      callDepth: op.callDepth,
      duration: now - op.startTime,
      gasLimit: op.gasLimit
    })),
    configuration: {
      maxCallDepth: REENTRANCY_CONFIG.MAX_CALL_DEPTH,
      maxConcurrentOps: REENTRANCY_CONFIG.MAX_CONCURRENT_OPS,
      highRiskFunctions: REENTRANCY_CONFIG.HIGH_RISK_FUNCTIONS.length
    }
  };
};

// Clean up old tracking data
export const cleanupReentrancyData = (): void => {
  const now = Date.now();
  let cleaned = 0;

  // Clean old operations
  activeOperations.forEach((op, id) => {
    if (now - op.startTime > 10 * 60 * 1000) { // 10 minutes
      activeOperations.delete(id);
      cleaned++;
    }
  });

  // Reset call frequency counters (every hour)
  if (now % (60 * 60 * 1000) < 5000) { // Reset roughly every hour
    operationHistory.clear();
    cleaned += operationHistory.size;
  }

  if (cleaned > 0) {
    console.log(`🧹 REENTRANCY CLEANUP: Removed ${cleaned} old entries`);
  }
};

// Detect specific reentrancy attack patterns
export const detectReentrancyPattern = (contractCall: any): {
  isAttack: boolean;
  pattern: string;
  confidence: number;
} => {
  const patterns = {
    'infinite_loop': {
      check: () => activeOperations.size > 20,
      confidence: 95
    },
    'callback_exploit': {
      check: () => isHighRiskFunction(contractCall.functionName) && 
                  contractCall.data && contractCall.data.includes('callback'),
      confidence: 85
    },
    'fund_drainage': {
      check: () => contractCall.functionName.includes('withdraw') &&
                  parseFloat(contractCall.value || '0') > 10000,
      confidence: 90
    },
    'gas_griefing': {
      check: () => parseInt(contractCall.gasLimit || '0') > 1000000,
      confidence: 75
    }
  };

  for (const [patternName, pattern] of Object.entries(patterns)) {
    if (pattern.check()) {
      return {
        isAttack: true,
        pattern: patternName,
        confidence: pattern.confidence
      };
    }
  }

  return {
    isAttack: false,
    pattern: 'none',
    confidence: 0
  };
};

// Auto cleanup every 5 minutes
setInterval(cleanupReentrancyData, 5 * 60 * 1000);

// Get suspicious addresses for monitoring
export const getSuspiciousAddresses = (): string[] => {
  return Array.from(suspiciousAddresses);
};

// Clear suspicious address (admin function)
export const clearSuspiciousAddress = (address: string): boolean => {
  return suspiciousAddresses.delete(address);
};