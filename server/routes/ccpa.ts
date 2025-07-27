/**
 * CCPA (California Consumer Privacy Act) Routes
 * Implements USA privacy compliance for California residents
 */

import { Router, type Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, creators, rewardDistributions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { csrfProtection } from '../security/csrfProtection';

const router = Router();

// CCPA Data Request Schema
const CCPADataRequestSchema = z.object({
  requestType: z.enum(['access', 'delete', 'portability', 'correct']),
  userPreferences: z.object({
    doNotSell: z.boolean(),
    limitSensitiveData: z.boolean(),
    marketingOptOut: z.boolean(),
    thirdPartySharing: z.boolean()
  }),
  timestamp: z.number()
});

// CCPA Information endpoint
router.get('/info', async (req: Request, res: Response) => {
  try {
    const ccpaInfo = {
      success: true,
      ccpaCompliance: {
        dataController: {
          name: "WebPayback Protocol",
          contact: "cyper73@gmail.com",
          address: "Digital Platform - Blockchain Protocol",
          responseTime: "45 days maximum as required by CCPA"
        },
        consumerRights: [
          {
            right: "Right to Know",
            description: "Know what personal information is collected, used, shared or sold"
          },
          {
            right: "Right to Delete", 
            description: "Request deletion of personal information"
          },
          {
            right: "Right to Opt-Out",
            description: "Opt-out of the sale of personal information"
          },
          {
            right: "Right to Correct",
            description: "Request correction of inaccurate personal information"
          },
          {
            right: "Right to Portability",
            description: "Obtain a copy of personal information in portable format"
          },
          {
            right: "Right to Non-Discrimination",
            description: "Equal service and pricing regardless of privacy choices"
          }
        ],
        dataCategories: [
          "Account identifiers (username, wallet address)",
          "Creator registration information (website URL, content category)",
          "Transaction data (reward distributions, amounts, timestamps)",
          "Usage analytics (platform interactions, AI detection events)",
          "Technical data (IP addresses, browser information, device IDs)"
        ],
        businessPurposes: [
          "Platform operation and user authentication",
          "WPT token reward distribution to verified creators",
          "AI content access monitoring and tracking",
          "Fraud prevention and security monitoring",
          "Analytics and platform improvement",
          "Legal compliance and dispute resolution"
        ],
        thirdPartySharing: [
          {
            category: "Blockchain Networks",
            purpose: "WPT token transactions on Polygon network",
            dataShared: "Wallet addresses, transaction amounts, timestamps"
          },
          {
            category: "Security Providers", 
            purpose: "Fraud detection and reentrancy protection",
            dataShared: "Transaction patterns, security event data"
          },
          {
            category: "Analytics Services",
            purpose: "Platform performance and usage analysis",
            dataShared: "Anonymized usage statistics, performance metrics"
          }
        ],
        retentionPolicies: {
          userAccounts: "Retained while account is active + 3 years after closure",
          transactionData: "Permanent on blockchain (immutable), 7 years in our systems",
          analyticsData: "2 years for detailed data, anonymized indefinitely",
          securityLogs: "1 year for standard logs, 3 years for security incidents"
        },
        salesDisclosure: "WebPayback Protocol does not sell personal information for monetary consideration. Data may be shared with service providers for business purposes as outlined above.",
        complianceDate: "January 1, 2020 (CCPA) / March 29, 2024 (CPRA enforcement)",
        lastUpdated: new Date().toISOString()
      }
    };

    res.json(ccpaInfo);
  } catch (error) {
    console.error('Error getting CCPA info:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

// CCPA Data Request endpoint
router.post('/data-request', csrfProtection, async (req: Request, res: Response) => {
  try {
    const requestData = CCPADataRequestSchema.parse(req.body);
    const requestId = `ccpa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, this would:
    // 1. Validate user identity and California residency
    // 2. Queue the request for processing within 45 days
    // 3. Send confirmation email to user
    // 4. Process request based on type (access, delete, etc.)
    
    // For demo purposes, we'll simulate the process
    const response = {
      success: true,
      requestId,
      requestType: requestData.requestType,
      status: 'received',
      estimatedCompletion: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days
      contactInfo: {
        email: "cyper73@gmail.com",
        subject: `CCPA Request ${requestId}`,
        message: "For questions about your request, please contact us with your request ID"
      },
      nextSteps: getCCPANextSteps(requestData.requestType)
    };

    // Log CCPA request for compliance tracking
    console.log(`CCPA Request Received: ${requestId}`, {
      type: requestData.requestType,
      timestamp: new Date().toISOString(),
      preferences: requestData.userPreferences,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors,
        success: false 
      });
    }

    console.error('Error processing CCPA request:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

// Helper function for CCPA request next steps
function getCCPANextSteps(requestType: string): string[] {
  switch (requestType) {
    case 'access':
      return [
        "Identity verification required within 10 business days",
        "Data compilation and review process (up to 45 days)",
        "Secure delivery of personal information report",
        "Follow-up contact if clarification needed"
      ];
    
    case 'delete':
      return [
        "Identity verification required within 10 business days", 
        "Review of deletion request and legal obligations",
        "Data deletion processing (blockchain data may remain immutable)",
        "Confirmation of deletion completion"
      ];
    
    case 'portability':
      return [
        "Identity verification required within 10 business days",
        "Data export preparation in machine-readable format",
        "Secure delivery via encrypted download link",
        "Technical support for data import if needed"
      ];
    
    case 'correct':
      return [
        "Identity verification required within 10 business days",
        "Review of correction request and supporting evidence", 
        "Data accuracy verification and correction processing",
        "Confirmation of corrections made"
      ];
    
    default:
      return ["Standard CCPA request processing within 45 days"];
  }
}

// CCPA Opt-Out verification endpoint
router.get('/opt-out-status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // In real implementation, check user's opt-out status from database
    const optOutStatus = {
      success: true,
      userId,
      doNotSell: true, // Retrieved from user preferences
      limitSensitiveData: false,
      marketingOptOut: true,
      thirdPartySharing: false,
      lastUpdated: new Date().toISOString(),
      effectiveDate: new Date().toISOString()
    };

    res.json(optOutStatus);
  } catch (error) {
    console.error('Error getting CCPA opt-out status:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

export default router;