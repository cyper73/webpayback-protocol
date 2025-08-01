import { db } from "../db";
import { reentrancyProtectionLogs } from "@shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";

interface ReentrancyCheck {
  contractAddress: string;
  functionSelector: string;
  callDepth: number;
  gasUsed: number;
  timestamp: Date;
  blockNumber: number;
  transactionHash: string;
}

interface ReentrancyResult {
  isReentrancyDetected: boolean;
  riskScore: number;
  callDepth: number;
  suspiciousPatterns: string[];
  recommendedAction: 'allow' | 'flag' | 'block';
  evidence: string;
  maxCallDepth: number;
  callFrequency: number;
}

interface ReentrancyStats {
  totalChecks: number;
  blockedAttempts: number;
  flaggedTransactions: number;
  averageCallDepth: number;
  topRiskyContracts: Array<{
    contractAddress: string;
    attempts: number;
    maxCallDepth: number;
    riskScore: number;
  }>;
  recentBlocks: Array<{
    contractAddress: string;
    functionSelector: string;
    callDepth: number;
    timestamp: Date;
    riskScore: number;
  }>;
}

class ReentrancyProtectionService {
  private readonly FOUNDER_WALLET = process.env.FOUNDER_WALLET || '0x***********************************************[FOUNDER]'; // Wallet del founder - NON BLOCCARE MAI
  private readonly MAX_SAFE_CALL_DEPTH = 10;
  private readonly SUSPICIOUS_CALL_DEPTH = 5;
  private readonly HIGH_RISK_CALL_DEPTH = 8;
  private readonly CALL_FREQUENCY_THRESHOLD = 100; // calls per minute
  
  // Funzioni considerate ad alto rischio per reentrancy
  private readonly HIGH_RISK_FUNCTIONS = [
    '0xa9059cbb', // transfer(address,uint256)
    '0x23b872dd', // transferFrom(address,address,uint256)
    '0x2e1a7d4d', // withdraw(uint256)
    '0x3ccfd60b', // withdraw()
    '0x853828b6', // deposit()
    '0xd0e30db0', // deposit() fallback
    '0x095ea7b3', // approve(address,uint256)
    '0x6a761202', // emergencyWithdraw(uint256)
    '0x441a3e70', // harvest()
    '0x1249c58b', // mint()
    '0x42966c68', // burn(uint256)
    '0x8da5cb5b', // owner()
    '0x715018a6', // renounceOwnership()
    '0xf2fde38b', // transferOwnership(address)
  ];

  // Contratti conosciuti per essere vulnerabili
  private readonly VULNERABLE_CONTRACTS = [
    '0x', // Placeholder per contratti vulnerabili noti
  ];

  /**
   * Analizza una transazione per rilevare possibili attacchi di reentrancy
   */
  async analyzeTransaction(check: ReentrancyCheck): Promise<ReentrancyResult> {
    console.log(`🔍 Analyzing transaction for reentrancy: ${check.transactionHash}`);
    
    // WHITELIST: Il wallet del founder non viene mai bloccato
    if (check.contractAddress.toLowerCase() === this.FOUNDER_WALLET.toLowerCase()) {
      console.log(`🔓 FOUNDER WALLET DETECTED: Skipping reentrancy checks for ${this.FOUNDER_WALLET}`);
      return {
        isReentrancyDetected: false,
        riskScore: 0,
        callDepth: check.callDepth,
        suspiciousPatterns: ['Founder wallet - exempt from reentrancy checks'],
        recommendedAction: 'allow',
        evidence: 'Founder wallet exemption applied',
        maxCallDepth: check.callDepth,
        callFrequency: 0
      };
    }

    let riskScore = 0;
    const suspiciousPatterns: string[] = [];
    
    // 1. Controllo della profondità delle chiamate
    if (check.callDepth > this.MAX_SAFE_CALL_DEPTH) {
      riskScore += 80;
      suspiciousPatterns.push(`Excessive call depth: ${check.callDepth}`);
    } else if (check.callDepth > this.HIGH_RISK_CALL_DEPTH) {
      riskScore += 60;
      suspiciousPatterns.push(`High call depth: ${check.callDepth}`);
    } else if (check.callDepth > this.SUSPICIOUS_CALL_DEPTH) {
      riskScore += 30;
      suspiciousPatterns.push(`Suspicious call depth: ${check.callDepth}`);
    }

    // 2. Controllo funzioni ad alto rischio
    if (this.HIGH_RISK_FUNCTIONS.includes(check.functionSelector)) {
      riskScore += 40;
      suspiciousPatterns.push(`High-risk function: ${check.functionSelector}`);
    }

    // 3. Controllo contratti vulnerabili
    if (this.VULNERABLE_CONTRACTS.includes(check.contractAddress)) {
      riskScore += 50;
      suspiciousPatterns.push(`Known vulnerable contract: ${check.contractAddress}`);
    }

    // 4. Controllo frequenza delle chiamate
    const callFrequency = await this.getCallFrequency(check.contractAddress, check.functionSelector);
    if (callFrequency > this.CALL_FREQUENCY_THRESHOLD) {
      riskScore += 35;
      suspiciousPatterns.push(`High call frequency: ${callFrequency} calls/min`);
    }

    // 5. Controllo pattern di gas usage
    const gasPattern = await this.analyzeGasPattern(check);
    if (gasPattern.isSuspicious) {
      riskScore += 25;
      suspiciousPatterns.push(`Suspicious gas pattern: ${gasPattern.reason}`);
    }

    // 6. Controllo storico del contratto
    const historicalRisk = await this.getHistoricalRisk(check.contractAddress);
    if (historicalRisk > 70) {
      riskScore += 30;
      suspiciousPatterns.push(`High historical risk: ${historicalRisk}%`);
    }

    // Determina l'azione raccomandata
    let recommendedAction: 'allow' | 'flag' | 'block' = 'allow';
    if (riskScore >= 90) {
      recommendedAction = 'block';
    } else if (riskScore >= 50) {
      recommendedAction = 'flag';
    }

    const result: ReentrancyResult = {
      isReentrancyDetected: riskScore >= 50,
      riskScore,
      callDepth: check.callDepth,
      suspiciousPatterns,
      recommendedAction,
      evidence: suspiciousPatterns.join('; '),
      maxCallDepth: this.MAX_SAFE_CALL_DEPTH,
      callFrequency
    };

    // Log dell'analisi
    await this.logReentrancyCheck(check, result);

    console.log(`🛡️ Reentrancy analysis complete:
      Contract: ${check.contractAddress}
      Function: ${check.functionSelector}
      Call Depth: ${check.callDepth}
      Risk Score: ${riskScore}%
      Action: ${recommendedAction}
      Patterns: ${suspiciousPatterns.join(', ')}`);

    return result;
  }

  /**
   * Ottiene la frequenza delle chiamate per un contratto/funzione
   */
  private async getCallFrequency(contractAddress: string, functionSelector: string): Promise<number> {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      
      const recentCalls = await db
        .select()
        .from(reentrancyProtectionLogs)
        .where(
          and(
            eq(reentrancyProtectionLogs.contractAddress, contractAddress),
            eq(reentrancyProtectionLogs.functionSelector, functionSelector),
            gte(reentrancyProtectionLogs.timestamp, oneMinuteAgo)
          )
        );

      return recentCalls.length;
    } catch (error) {
      console.error('Error getting call frequency:', error);
      return 0;
    }
  }

  /**
   * Analizza i pattern di utilizzo del gas
   */
  private async analyzeGasPattern(check: ReentrancyCheck): Promise<{ isSuspicious: boolean; reason: string }> {
    // Pattern sospetti di gas:
    // 1. Gas usage estremamente alto (possibile loop infinito)
    // 2. Gas usage estremamente basso (possibile bypass)
    // 3. Pattern ripetitivi identici
    
    const SUSPICIOUS_HIGH_GAS = 8000000; // 8M gas
    const SUSPICIOUS_LOW_GAS = 21000; // Gas base per transazione
    
    if (check.gasUsed > SUSPICIOUS_HIGH_GAS) {
      return {
        isSuspicious: true,
        reason: `Extremely high gas usage: ${check.gasUsed}`
      };
    }
    
    if (check.gasUsed < SUSPICIOUS_LOW_GAS && check.callDepth > 1) {
      return {
        isSuspicious: true,
        reason: `Unusually low gas for complex call: ${check.gasUsed}`
      };
    }

    // Controlla pattern ripetitivi
    try {
      const recentGasUsage = await db
        .select()
        .from(reentrancyProtectionLogs)
        .where(
          and(
            eq(reentrancyProtectionLogs.contractAddress, check.contractAddress),
            eq(reentrancyProtectionLogs.functionSelector, check.functionSelector),
            gte(reentrancyProtectionLogs.timestamp, new Date(Date.now() - 300000)) // 5 minuti
          )
        )
        .orderBy(desc(reentrancyProtectionLogs.timestamp))
        .limit(10);

      if (recentGasUsage.length >= 5) {
        const gasValues = recentGasUsage.map(log => log.gasUsed);
        const identicalValues = gasValues.filter(gas => gas === check.gasUsed).length;
        
        if (identicalValues >= 4) {
          return {
            isSuspicious: true,
            reason: `Identical gas pattern detected: ${identicalValues} identical calls`
          };
        }
      }
    } catch (error) {
      console.error('Error analyzing gas pattern:', error);
    }

    return { isSuspicious: false, reason: 'Normal gas pattern' };
  }

  /**
   * Ottiene il rischio storico di un contratto
   */
  private async getHistoricalRisk(contractAddress: string): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 3600000);
      
      const historicalLogs = await db
        .select()
        .from(reentrancyProtectionLogs)
        .where(
          and(
            eq(reentrancyProtectionLogs.contractAddress, contractAddress),
            gte(reentrancyProtectionLogs.timestamp, oneHourAgo)
          )
        );

      if (historicalLogs.length === 0) return 0;

      const averageRisk = historicalLogs.reduce((sum, log) => sum + log.riskScore, 0) / historicalLogs.length;
      const blockedCount = historicalLogs.filter(log => log.recommendedAction === 'block').length;
      const blockRate = (blockedCount / historicalLogs.length) * 100;

      return Math.max(averageRisk, blockRate);
    } catch (error) {
      console.error('Error getting historical risk:', error);
      return 0;
    }
  }

  /**
   * Registra il controllo di reentrancy
   */
  private async logReentrancyCheck(check: ReentrancyCheck, result: ReentrancyResult): Promise<void> {
    try {
      await db.insert(reentrancyProtectionLogs).values({
        contractAddress: check.contractAddress,
        functionSelector: check.functionSelector,
        callDepth: check.callDepth,
        gasUsed: check.gasUsed,
        riskScore: result.riskScore,
        isReentrancyDetected: result.isReentrancyDetected,
        suspiciousPatterns: result.suspiciousPatterns.join(';'),
        recommendedAction: result.recommendedAction,
        evidence: result.evidence,
        blockNumber: check.blockNumber,
        transactionHash: check.transactionHash,
        timestamp: check.timestamp
      });
    } catch (error) {
      console.error('Error logging reentrancy check:', error);
    }
  }

  /**
   * Ottiene le statistiche del sistema di protezione
   */
  async getStats(): Promise<ReentrancyStats> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 86400000);
      
      // Ottieni tutti i log delle ultime 24 ore
      const recentLogs = await db
        .select()
        .from(reentrancyProtectionLogs)
        .where(gte(reentrancyProtectionLogs.timestamp, twentyFourHoursAgo))
        .orderBy(desc(reentrancyProtectionLogs.timestamp));

      const totalChecks = recentLogs.length;
      const blockedAttempts = recentLogs.filter(log => log.recommendedAction === 'block').length;
      const flaggedTransactions = recentLogs.filter(log => log.recommendedAction === 'flag').length;
      
      const averageCallDepth = recentLogs.length > 0 
        ? recentLogs.reduce((sum, log) => sum + log.callDepth, 0) / recentLogs.length 
        : 0;

      // Contratti più rischiosi
      const contractRisks = new Map<string, { attempts: number; maxCallDepth: number; totalRisk: number }>();
      
      recentLogs.forEach(log => {
        const existing = contractRisks.get(log.contractAddress) || { attempts: 0, maxCallDepth: 0, totalRisk: 0 };
        contractRisks.set(log.contractAddress, {
          attempts: existing.attempts + 1,
          maxCallDepth: Math.max(existing.maxCallDepth, log.callDepth),
          totalRisk: existing.totalRisk + log.riskScore
        });
      });

      const topRiskyContracts = Array.from(contractRisks.entries())
        .map(([address, data]) => ({
          contractAddress: address,
          attempts: data.attempts,
          maxCallDepth: data.maxCallDepth,
          riskScore: data.totalRisk / data.attempts
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

      // Blocchi recenti
      const recentBlocks = recentLogs
        .filter(log => log.recommendedAction === 'block')
        .slice(0, 10)
        .map(log => ({
          contractAddress: log.contractAddress,
          functionSelector: log.functionSelector,
          callDepth: log.callDepth,
          timestamp: log.timestamp,
          riskScore: log.riskScore
        }));

      return {
        totalChecks,
        blockedAttempts,
        flaggedTransactions,
        averageCallDepth: Math.round(averageCallDepth * 100) / 100,
        topRiskyContracts,
        recentBlocks
      };
    } catch (error) {
      console.error('Error getting reentrancy stats:', error);
      return {
        totalChecks: 0,
        blockedAttempts: 0,
        flaggedTransactions: 0,
        averageCallDepth: 0,
        topRiskyContracts: [],
        recentBlocks: []
      };
    }
  }

  /**
   * Testa il sistema di protezione con diverse simulazioni
   */
  async testProtection(simulationType: 'normal' | 'deep_call' | 'high_frequency' | 'gas_drain' | 'known_vulnerable'): Promise<any> {
    const baseTimestamp = new Date();
    
    let testCheck: ReentrancyCheck;
    
    switch (simulationType) {
      case 'deep_call':
        testCheck = {
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          functionSelector: '0xa9059cbb', // transfer function
          callDepth: 15, // Profondità eccessiva
          gasUsed: 500000,
          timestamp: baseTimestamp,
          blockNumber: 18500000,
          transactionHash: '0xdeepCall123456789abcdef123456789abcdef123456789abcdef123456789abcdef'
        };
        break;
        
      case 'high_frequency':
        // Simula molte chiamate rapide
        for (let i = 0; i < 10; i++) {
          await this.analyzeTransaction({
            contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
            functionSelector: '0x2e1a7d4d', // withdraw function
            callDepth: 3,
            gasUsed: 200000,
            timestamp: new Date(baseTimestamp.getTime() + i * 1000),
            blockNumber: 18500000 + i,
            transactionHash: `0xhighFreq${i}23456789abcdef123456789abcdef123456789abcdef123456789abcdef`
          });
        }
        testCheck = {
          contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
          functionSelector: '0x2e1a7d4d',
          callDepth: 3,
          gasUsed: 200000,
          timestamp: new Date(baseTimestamp.getTime() + 11000),
          blockNumber: 18500011,
          transactionHash: '0xhighFreq1123456789abcdef123456789abcdef123456789abcdef123456789abcdef'
        };
        break;
        
      case 'gas_drain':
        testCheck = {
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          functionSelector: '0x3ccfd60b', // withdraw function
          callDepth: 8,
          gasUsed: 9000000, // Gas estremamente alto
          timestamp: baseTimestamp,
          blockNumber: 18500000,
          transactionHash: '0xgasDrain123456789abcdef123456789abcdef123456789abcdef123456789abcdef'
        };
        break;
        
      case 'known_vulnerable':
        testCheck = {
          contractAddress: '0x', // Contratto vulnerabile (se presente nella lista)
          functionSelector: '0xa9059cbb',
          callDepth: 6,
          gasUsed: 300000,
          timestamp: baseTimestamp,
          blockNumber: 18500000,
          transactionHash: '0xvulnerable123456789abcdef123456789abcdef123456789abcdef123456789abcdef'
        };
        break;
        
      default: // normal
        testCheck = {
          contractAddress: '0xnormalContract1234567890abcdef1234567890ab',
          functionSelector: '0x095ea7b3', // approve function
          callDepth: 2,
          gasUsed: 50000,
          timestamp: baseTimestamp,
          blockNumber: 18500000,
          transactionHash: '0xnormalTx123456789abcdef123456789abcdef123456789abcdef123456789abcdef'
        };
    }

    const result = await this.analyzeTransaction(testCheck);
    
    return {
      success: true,
      testType: simulationType,
      testTransaction: testCheck,
      analysis: result,
      timestamp: new Date().toISOString()
    };
  }
}

export const reentrancyProtection = new ReentrancyProtectionService();