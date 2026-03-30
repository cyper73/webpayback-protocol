import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCreatorSchema, contentCategoryEnum, type InsertCreator } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, AlertTriangle, FileText, Globe, Copy, Code, Settings, Lock, Coins } from "lucide-react";
import { sanitizeUrl, sanitizeWalletAddress, sanitizeToastContent, validateDomain, sanitizeContentCategory } from "@/lib/security";
import { WalletVerification } from "@/components/wallet/WalletVerification";
import TwoFactorAuthSetup from "@/components/security/TwoFactorAuthSetup";
import { HumanityStatus } from "@/components/creators/HumanityStatus";
import { GaslessWithdrawal } from "@/components/wallet/GaslessWithdrawal";
import { CashOutGuide } from "@/components/wallet/CashOutGuide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from '@privy-io/react-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = insertCreatorSchema.extend({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  walletSignature: z.string().optional(),
  verificationMessage: z.string().optional()
}).omit({ userId: true });

type FormData = z.infer<typeof formSchema>;

export default function CreatorPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainVerification, setDomainVerification] = useState<any>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [isDomainVerified, setIsDomainVerified] = useState(false);
  const [walletSignature, setWalletSignature] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isWalletVerified, setIsWalletVerified] = useState(false);
  const [activeTab, setActiveTab] = useState("registration");
  const [currentCreatorId, setCurrentCreatorId] = useState<number | null>(null);
  const [preGeneratedTwoFactorSetup, setPreGeneratedTwoFactorSetup] = useState<any>(null);

  const { login, logout, authenticated, user, ready, getAccessToken } = usePrivy();

  // If user is authenticated via Privy, set a pseudo creator ID so they can access the tabs
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address && !currentCreatorId) {
      // In a real app, you would fetch the creator ID from your backend using the wallet address.
      // For this demo, we'll set a default ID of 1 to unlock the UI tabs.
      setCurrentCreatorId(1);
    }
  }, [ready, authenticated, user, currentCreatorId]);

  // Check URL parameters for Humanity Protocol OAuth callback results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const humanitySuccess = params.get('humanity_success');
    const humanityError = params.get('humanity_error');
    const humanityCode = params.get('humanity_code');
    const humanityState = params.get('humanity_state');

    if (humanityCode && humanityState) {
      setActiveTab("humanity");
      
      // Try to parse userId from state
      let parsedUserId = currentCreatorId;
      try {
        const decodedState = JSON.parse(atob(humanityState));
        if (decodedState.userId) {
          parsedUserId = parseInt(decodedState.userId);
          setCurrentCreatorId(parsedUserId);
        }
      } catch (e) {
        console.error("Failed to parse humanity state", e);
      }
      
      const codeVerifier = localStorage.getItem('humanity_verifier');
      
      if (parsedUserId) {
        // Prepare the request asynchronously so we can await the access token
        const verifyHumanity = async () => {
          try {
            const accessToken = await getAccessToken();
            
            const res = await apiRequest("POST", "/api/humanity/verify", {
              userId: parsedUserId,
              code: humanityCode,
              codeVerifier: codeVerifier || 'mock_verifier'
            }, {
              // Add the Privy token for backend verification
              Authorization: `Bearer ${accessToken}`
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || "Network response was not ok");
            }

            const data = await res.json();
            
            if (data.success) {
              toast({
                title: "Verifica Humanity Completata",
                description: data.message || "Your account has been successfully verified by Humanity Protocol!",
                variant: "default",
              });
              queryClient.invalidateQueries({ queryKey: ['humanity-status', parsedUserId] });
            } else {
              toast({
                title: "Verification Error",
                description: data.error || "Failed to verify humanity status.",
                variant: "destructive",
              });
            }
          } catch (err: any) {
            console.error("Verification connection error:", err);
            toast({
              title: "Connection Error",
              description: err.message || "Unable to contact the server for verification.",
              variant: "destructive",
            });
          } finally {
            localStorage.removeItem('humanity_verifier');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        };

        verifyHumanity();
      }
    } else if (humanitySuccess) {
      setActiveTab("humanity");
      toast({
        title: "Humanity Verification Complete",
        description: "Your account has been successfully verified by Humanity Protocol!",
        variant: "default",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (humanityError) {
      setActiveTab("humanity");
      toast({
        title: "Verification Error",
        description: `Failed to complete verification: ${humanityError}`,
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, currentCreatorId, queryClient]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      websiteUrl: "",
      walletAddress: "",
      walletSignature: "",
      verificationMessage: "",
      contentCategory: "blog_articles" as const,
      termsAccepted: false
    }
  });

  const checkDomainMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      // XSS Prevention: Validate and sanitize URL before API call
      const sanitizedUrl = sanitizeUrl(websiteUrl);
      if (!sanitizedUrl || !validateDomain(websiteUrl)) {
        throw new Error('Invalid domain URL provided');
      }
      
      const response = await apiRequest("POST", "/api/domain/chainlink/check", { websiteUrl: sanitizedUrl });
      const result = await response.json();
      return result;
    },
    onSuccess: (data: any) => {
      setDomainVerification(data);
      if (data.requiresManualReview) {
        // XSS Prevention: Sanitize toast content
        const safeToast = sanitizeToastContent({
          title: "Domain Requires Manual Review",
          description: `Risk factors: ${Array.isArray(data.riskFactors) ? data.riskFactors.join(', ') : 'Security review required'}`
        });
        toast({
          title: safeToast.title,
          description: safeToast.description,
          variant: "default",
        });
      } else if (data.requiresMetaTag) {
        const safeToast = sanitizeToastContent({
          title: "Meta Tag Verification Required",
          description: "Please add the meta tag to your page to verify ownership."
        });
        toast({
          title: safeToast.title,
          description: safeToast.description,
          variant: "default",
        });
      } else if (data.isVerified) {
        const score = typeof data.verificationScore === 'number' ? Math.floor(data.verificationScore) : 0;
        const safeToast = sanitizeToastContent({
          title: "Domain Automatically Verified",
          description: `Verification score: ${score}/100`
        });
        toast({
          title: safeToast.title,
          description: safeToast.description,
        });
        setIsDomainVerified(true);
      } else {
        const score = typeof data.verificationScore === 'number' ? Math.floor(data.verificationScore) : 0;
        const safeToast = sanitizeToastContent({
          title: "Domain Verification Failed",
          description: `Score: ${score}/100. Issues: ${Array.isArray(data.riskFactors) ? data.riskFactors.join(', ') : 'Unknown issues'}`
        });
        toast({
          title: safeToast.title,
          description: safeToast.description,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      // XSS Prevention: Sanitize error message
      const safeToast = sanitizeToastContent({
        title: "Chainlink Domain Check Failed",
        description: error.message || 'An error occurred'
      });
      toast({
        title: safeToast.title,
        description: safeToast.description,
        variant: "destructive",
      });
    },
  });

  const chainlinkVerificationMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      const response = await apiRequest("POST", "/api/domain/chainlink/verify", {
        creatorId: 1, // Demo user ID
        websiteUrl: websiteUrl
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setIsDomainVerified(true);
        toast({
          title: "Chainlink Verification Complete",
          description: "Your domain has been automatically verified by Chainlink!",
        });
      } else {
        toast({
          title: "Chainlink Verification Failed",
          description: data.error || "Domain verification failed.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Chainlink Verification Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCreatorMutation = useMutation({
    mutationFn: async (data: any) => {
      const { termsAccepted, ...creatorData } = data;
      const response = await apiRequest("POST", "/api/creators", creatorData);
      return response.json(); // Parse JSON to get the data with 2FA setup
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful", 
        description: "Now setting up mandatory 2FA security for your account...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      reset();
      setDomainVerification(null);
      setIsDomainVerified(false);
      
      // AUTOMATIC 2FA SETUP: Check if 2FA setup was generated
      if (data?.id && data?.requiresImmediateTwoFactorSetup) {
        setCurrentCreatorId(data.id);
        setPreGeneratedTwoFactorSetup(data.twoFactorSetup);
        setActiveTab("security");
        
        // Show security requirement message
        setTimeout(() => {
          toast({
            title: "Security Setup Required",
            description: "2FA is mandatory for all users. Please complete Google Authenticator setup to secure your account.",
            variant: "default",
          });
        }, 1000);
      }
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDomainCheck = async (websiteUrl: string) => {
    if (!websiteUrl) return;
    setIsCheckingDomain(true);
    checkDomainMutation.mutate(websiteUrl);
    setIsCheckingDomain(false);
  };

  const handleChainlinkVerification = (websiteUrl: string) => {
    chainlinkVerificationMutation.mutate(websiteUrl);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Token copied to clipboard",
    });
  };

  const renderDomainVerificationStatus = () => {
    if (!domainVerification) return null;

    const isHighSecurity = domainVerification.securityLevel === 'high';
    const needsManualReview = domainVerification.requiresManualReview;
    const isVerified = domainVerification.isVerified || isDomainVerified;
    const verificationScore = domainVerification.verificationScore;
    const riskFactors = domainVerification.riskFactors || [];
    


    return (
      <div className="mt-4 p-4 rounded-lg border border-white/10 bg-glass-dark">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-electric-blue" />
          <h3 className="font-semibold text-white">Chainlink Domain Verification</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isVerified ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : needsManualReview ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-300">
                Security Level: <span className="font-semibold text-white">{domainVerification.securityLevel?.toUpperCase()}</span>
              </span>
            </div>
            <div className="text-sm text-gray-300">
              Score: <span className="font-semibold text-white">{verificationScore}/100</span>
            </div>
          </div>
          
          {isVerified && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-400">AUTOMATICALLY VERIFIED BY CHAINLINK</span>
              </div>
              <p className="text-sm text-green-300">Domain passed all security checks and is ready for registration.</p>
            </div>
          )}
          
          {needsManualReview && !isVerified && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-400">MANUAL REVIEW REQUIRED</span>
              </div>
              <p className="text-sm text-yellow-300">This domain requires manual verification by our team (24-48 hours).</p>
            </div>
          )}
          
          {domainVerification.requiresMetaTag && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-400">META TAG VERIFICATION REQUIRED</span>
              </div>
              <div className="bg-black/40 p-3 rounded border border-blue-500/30">
                <pre className="text-xs text-blue-200 font-mono whitespace-pre-wrap">
                  {domainVerification.metaTagInstruction}
                </pre>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(domainVerification.metaTagInstruction)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  onClick={async () => {
                    // Verify meta tag
                    if (domainVerification.verificationToken) {
                      try {
                        const response = await apiRequest("POST", "/api/domain/chainlink/verify-meta-tag", {
                          websiteUrl: watch("websiteUrl"),
                          verificationToken: domainVerification.verificationToken
                        });
                        const result = await response.json();
                        
                        if (result.verified) {
                          toast({
                            title: "Meta Tag Verified",
                            description: "Your page has been successfully verified!",
                            variant: "default",
                          });
                          setDomainVerification(prev => ({ ...prev, isVerified: true }));
                          setIsDomainVerified(true);
                        } else {
                          toast({
                            title: "Meta Tag Not Found",
                            description: "Please ensure the meta tag is properly placed on your page.",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Verification Failed",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Verify Meta Tag
                </Button>
              </div>
            </div>
          )}
          
          {!isVerified && !needsManualReview && !domainVerification.requiresMetaTag && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-400">VERIFICATION FAILED</span>
              </div>
              <p className="text-sm text-red-300">Domain does not meet security requirements for automatic verification.</p>
            </div>
          )}
          
          {riskFactors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-300 font-semibold">Risk Factors:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                {riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {domainVerification.chainlinkData && (
            <div className="mt-4 p-3 bg-black/20 rounded-lg">
              <p className="text-sm text-gray-300 font-semibold mb-2">Chainlink Data:</p>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Domain Age:</span>
                  <span>{Math.floor(domainVerification.chainlinkData.domainAge)} days</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL Certificate:</span>
                  <span>{domainVerification.chainlinkData.sslCertificate ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>DNS Records:</span>
                  <span>{domainVerification.chainlinkData.dnsRecords ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reputation Score:</span>
                  <span>{domainVerification.chainlinkData.reputationScore}</span>
                </div>
              </div>
            </div>
          )}
          
          {!isVerified && !needsManualReview && (
            <div className="mt-4">
              <Button
                onClick={() => chainlinkVerificationMutation.mutate(watch("websiteUrl"))}
                className="bg-electric-blue hover:bg-electric-blue/80"
                disabled={chainlinkVerificationMutation.isPending}
              >
                <Shield className="w-4 h-4 mr-2" />
                {chainlinkVerificationMutation.isPending ? "Verifying with Chainlink..." : "Retry Chainlink Verification"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Always check domain before registration
    if (!domainVerification) {
      setIsCheckingDomain(true);
      try {
        const response = await apiRequest("POST", "/api/domain/chainlink/check", { websiteUrl: data.websiteUrl });
        const domainCheckResult = await response.json();
        setDomainVerification(domainCheckResult);
        
        console.log("Domain check result in onSubmit:", domainCheckResult);
        console.log("isDomainVerified:", isDomainVerified);
        
        if (domainCheckResult.requiresManualReview) {
          console.log("Blocking: requires manual review");
          toast({
            title: "Domain Verification Required",
            description: "This domain requires manual review for security purposes.",
            variant: "default",
          });
          setIsSubmitting(false);
          setIsCheckingDomain(false);
          return;
        }
        
        if (domainCheckResult.requiresMetaTag && !isDomainVerified) {
          console.log("Blocking: requires meta tag verification");
          toast({
            title: "Meta Tag Verification Required",
            description: "Please complete meta tag verification before registration.",
            variant: "default",
          });
          setIsSubmitting(false);
          setIsCheckingDomain(false);
          return;
        }
      } catch (error: any) {
        toast({
          title: "Domain Check Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        setIsCheckingDomain(false);
        return;
      }
      setIsCheckingDomain(false);
    }
    
    // If domain verification is required but not completed, block registration
    if (domainVerification?.requiresManualReview) {
      toast({
        title: "Domain Verification Required",
        description: "Please complete manual domain verification before registration.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // If meta tag verification is required but not completed, block registration
    if (domainVerification?.requiresMetaTag && !isDomainVerified) {
      toast({
        title: "Meta Tag Verification Required",
        description: "Please complete meta tag verification before registration.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // WALLET CRYPTOGRAPHIC VERIFICATION - Block registration if wallet not verified
    if (!isWalletVerified || !walletSignature || !verificationMessage) {
      toast({
        title: "Wallet Verification Required",
        description: "Please complete wallet ownership verification before registration.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Add userId and wallet verification data
    const creatorData = {
      ...data,
      userId: 1, // Demo user ID
      walletSignature,
      verificationMessage
    };
    
    createCreatorMutation.mutate(creatorData);
    setIsSubmitting(false);
  };

  // Demo email for 2FA setup
  const demoEmail = "creator@webpayback.com";

  return (
    <Card className="glass-card rounded-2xl shadow-neon-blue border-electric-blue/30 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      <CardHeader className="border-b border-white/5 bg-black/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-electric-blue/20 rounded-xl">
              <Globe className="w-6 h-6 text-electric-blue" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Registration Portal</CardTitle>
              <p className="text-gray-400 text-sm mt-1">Manage identity, monitor citations, and withdraw your tokens</p>
            </div>
          </div>
          {currentCreatorId && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Creator Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10 rounded-xl p-1 h-auto">
            <TabsTrigger value="registration" className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-electric-blue/20 data-[state=active]:text-white rounded-lg transition-all">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Registration</span>
            </TabsTrigger>
            <TabsTrigger value="humanity" className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 rounded-lg transition-all">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-medium">Proof of Humanity</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 rounded-lg transition-all">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-medium">2FA Security</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-lg transition-all">
              <Coins className="w-5 h-5" />
              <span className="text-xs font-medium">Wallet & Withdrawals</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="registration" className="mt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
              Independent Website / Blog Integration
            </Label>
            <div className="p-3 mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-300">
                  <p className="font-semibold mb-1">Important: Social Accounts vs Independent Domains</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Social Media (YouTube, Instagram, etc):</strong> Leave this empty. You will verify these automatically via Humanity Protocol in the next step.</li>
                    <li>• <strong>Independent Websites/Blogs:</strong> Enter your custom domain here to receive the AI-Shield meta tag for scraping protection.</li>
                    <li className="mt-2 text-white font-medium">⚠️ Step 1: Copy and paste this meta tag into the <code className="bg-black/50 px-1 py-0.5 rounded text-electric-blue">&lt;head&gt;</code> section of your website before clicking "Check Domain":</li>
                    <li className="mt-1">
                      <code className="block bg-black/60 p-2 rounded border border-gray-700 text-electric-blue break-all">
                        &lt;meta name="webpayback-verification" content="wpt-verify-{watch("walletAddress") ? watch("walletAddress").slice(0, 10) : 'your-wallet'}" /&gt;
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://your-independent-blog.com"
                className="flex-1 bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none text-white"
                {...register("websiteUrl")}
              />
              <Button
                type="button"
                onClick={() => handleDomainCheck(watch("websiteUrl"))}
                disabled={isCheckingDomain || !watch("websiteUrl")}
                className="bg-electric-blue hover:bg-electric-blue/80 px-4"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isCheckingDomain ? "Checking..." : "Check Domain"}
              </Button>
            </div>
            {errors.websiteUrl && (
              <p className="text-red-400 text-sm mt-1">{errors.websiteUrl.message}</p>
            )}
            {renderDomainVerificationStatus()}

            {/* AI Shield Snippet Generator */}
            {currentCreatorId && watch("walletAddress") && (
              <div className="mt-4 p-4 border border-electric-blue/30 bg-electric-blue/5 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-electric-blue" />
                    AI-Shield Active Defense
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">Get the code snippets to block AI bots from scraping your site.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-electric-blue text-electric-blue hover:bg-electric-blue/20">
                      <Code className="w-4 h-4 mr-2" />
                      Generate Snippets
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-deep-space border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        <Shield className="w-5 h-5 text-electric-blue" />
                        Your AI-Shield Configuration
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Implement these technical measures on your domain to legally block unauthorized AI scraping.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-lg p-3 mt-2">
                      <p className="text-sm text-electric-blue font-medium flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <span>For maximum technical and legal protection under the EU AI Act, you must implement <strong>BOTH</strong> steps below.</span>
                      </p>
                    </div>

                    <div className="space-y-6 py-4">
                      {/* Meta Tags */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-semibold text-white">1. HTML Meta Tags</h5>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => {
                            navigator.clipboard.writeText(`<meta name="webpayback-verification" content="wpt-verify-${watch("walletAddress")?.slice(0, 10)}" />\n<meta name="robots" content="noai, noimageai">`);
                            toast({ title: "Copied to clipboard!" });
                          }}>
                            <Copy className="w-3 h-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">Add to your website's <code className="bg-black/50 px-1 rounded">&lt;head&gt;</code></p>
                        <pre className="bg-black/60 p-3 rounded-lg border border-gray-800 text-xs text-electric-blue overflow-x-auto">
                          <code>{`<meta name="webpayback-verification" content="wpt-verify-${watch("walletAddress")?.slice(0, 10)}" />\n<meta name="robots" content="noai, noimageai">`}</code>
                        </pre>
                      </div>

                      {/* Robots.txt */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-semibold text-white">2. robots.txt Rules</h5>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => {
                            navigator.clipboard.writeText(`User-agent: GPTBot\nDisallow: /\nUser-agent: ChatGPT-User\nDisallow: /\nUser-agent: Anthropic-ai\nDisallow: /\nUser-agent: Claude-Web\nDisallow: /\nUser-agent: Google-Extended\nDisallow: /\nUser-agent: CCBot\nDisallow: /\nUser-agent: meta-externalagent\nDisallow: /\nUser-agent: OAI-SearchBot\nDisallow: /\nUser-agent: PerplexityBot\nDisallow: /\nUser-agent: Cohere-ai\nDisallow: /\nUser-agent: grok\nDisallow: /\nUser-agent: bingbot\nDisallow: /\nUser-agent: Copilot\nDisallow: /\nUser-agent: Mistral\nDisallow: /\nUser-agent: AlephAlpha\nDisallow: /\nUser-agent: DeepSeek\nDisallow: /\nUser-agent: Qwen\nDisallow: /\nUser-agent: Baiduspider\nDisallow: /\nUser-agent: YisouSpider\nDisallow: /\nUser-agent: Bytespider\nDisallow: /\nUser-agent: Sogou web spider\nDisallow: /\nUser-agent: Suno\nDisallow: /\nUser-agent: Udio\nDisallow: /\nUser-agent: ElevenLabs\nDisallow: /`);
                            toast({ title: "Copied to clipboard!" });
                          }}>
                            <Copy className="w-3 h-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>Create a file named exactly <code className="bg-black/50 px-1 rounded text-electric-blue">robots.txt</code> and place it in the <strong>root folder</strong> of your website.</p>
                          <p>It must be accessible at: <code className="text-gray-300">https://your-domain.com/robots.txt</code></p>
                        </div>
                        <pre className="bg-black/60 p-3 rounded-lg border border-gray-800 text-xs text-green-400 overflow-x-auto max-h-32 mt-2">
                          <code>{`User-agent: GPTBot\nDisallow: /\nUser-agent: ChatGPT-User\nDisallow: /\nUser-agent: Anthropic-ai\nDisallow: /\nUser-agent: Claude-Web\nDisallow: /\nUser-agent: Google-Extended\nDisallow: /\nUser-agent: CCBot\nDisallow: /\nUser-agent: meta-externalagent\nDisallow: /\nUser-agent: OAI-SearchBot\nDisallow: /\nUser-agent: PerplexityBot\nDisallow: /\nUser-agent: Cohere-ai\nDisallow: /\nUser-agent: grok\nDisallow: /\nUser-agent: bingbot\nDisallow: /\nUser-agent: Copilot\nDisallow: /\nUser-agent: Mistral\nDisallow: /\nUser-agent: AlephAlpha\nDisallow: /\nUser-agent: DeepSeek\nDisallow: /\nUser-agent: Qwen\nDisallow: /\nUser-agent: Baiduspider\nDisallow: /\nUser-agent: YisouSpider\nDisallow: /\nUser-agent: Bytespider\nDisallow: /\nUser-agent: Sogou web spider\nDisallow: /\nUser-agent: Suno\nDisallow: /\nUser-agent: Udio\nDisallow: /\nUser-agent: ElevenLabs\nDisallow: /`}</code>
                        </pre>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* WALLET CRYPTOGRAPHIC VERIFICATION */}
          <WalletVerification
            walletAddress={watch("walletAddress")}
            onVerificationComplete={(signature, message) => {
              setWalletSignature(signature);
              setVerificationMessage(message);
              setIsWalletVerified(true);
              setValue("walletSignature", signature);
              setValue("verificationMessage", message);
              toast({
                title: "Wallet Verified",
                description: "Your wallet ownership has been cryptographically verified",
              });
            }}
            onWalletChange={(address) => {
              setValue("walletAddress", address);
              setIsWalletVerified(false);
              setWalletSignature("");
              setVerificationMessage("");
            }}
          />
          
          <div>
            <Label htmlFor="contentCategory" className="block text-sm font-medium mb-2">
              Content Category
            </Label>
            <Select onValueChange={(value) => setValue("contentCategory", value)}>
              <SelectTrigger className="w-full bg-glass-dark border border-white/10 rounded-lg px-4 py-2 focus:border-electric-blue focus:outline-none text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog_articles">Blog/Articles</SelectItem>
                <SelectItem value="news_journalism">News/Journalism</SelectItem>
                <SelectItem value="educational_content">Educational Content</SelectItem>
                <SelectItem value="technical_documentation">Technical Documentation</SelectItem>
                <SelectItem value="creative_writing">Creative Writing</SelectItem>
                <SelectItem value="art_design">Art/Design</SelectItem>
                <SelectItem value="music_audio">Music/Audio</SelectItem>
                <SelectItem value="video_content">Video Content</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="academic_papers">Academic Papers</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
              </SelectContent>
            </Select>
            {errors.contentCategory && (
              <p className="text-red-400 text-sm mt-1">{errors.contentCategory.message}</p>
            )}
          </div>
          
          {/* Wallet address field is now handled by WalletVerification component */}
          
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="termsAccepted"
              className="w-4 h-4 text-electric-blue bg-glass-dark border-white/10 rounded focus:ring-electric-blue"
              onCheckedChange={(checked) => setValue("termsAccepted", checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="text-sm text-gray-300">
              I agree to the WebPayback Protocol Terms
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-400 text-sm">{errors.termsAccepted.message}</p>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting || createCreatorMutation.isPending || !isWalletVerified}
            className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || createCreatorMutation.isPending ? "Registering..." : 
             !isWalletVerified ? "Complete Wallet Verification First" : 
             "Register for WebPayback"}
          </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Enhance your Creator Portal security with Google Authenticator
                </p>
              </div>
              
              {currentCreatorId ? (
                <>
                  <div className="text-xs text-gray-500 mb-2">
                    Debug: CreatorID={currentCreatorId}, Email={demoEmail}
                  </div>
                  <TwoFactorAuthSetup 
                    creatorId={currentCreatorId}
                    creatorEmail={demoEmail}
                    preGeneratedSetup={preGeneratedTwoFactorSetup}
                    onSetupComplete={() => {
                      toast({
                        title: "Security Enhanced!",
                        description: "Your account is now protected with 2FA",
                      });
                      // Clear pre-generated setup after completion
                      setPreGeneratedTwoFactorSetup(null);
                    }}
                  />
                </>
              ) : (
                <Card className="w-full">
                  <CardContent className="p-6 text-center">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h4 className="text-lg font-semibold mb-2">Complete Registration First</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Register as a creator first to enable Two-Factor Authentication for your account.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("registration")}
                      className="bg-electric-blue hover:bg-electric-blue/80"
                    >
                      Go to Registration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="humanity" className="mt-6">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Proof of Humanity</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Verify your identity to access exclusive reward multipliers and API shield protection.
                </p>
              </div>
              
              {currentCreatorId ? (
                <HumanityStatus creatorId={currentCreatorId} />
              ) : (
                <Card className="w-full">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h4 className="text-lg font-semibold mb-2">Verification Required</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Prove your humanity to unlock reward multipliers.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/login'}
                      className="bg-electric-blue hover:bg-electric-blue/80"
                    >
                      Verify Humanity
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Wallet & Earnings</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage your WPT-HUMAN tokens and withdraw your earnings directly to your wallet.
                </p>
              </div>
              
              {currentCreatorId ? (
                <>
                  <GaslessWithdrawal creatorId={currentCreatorId} />
                  <CashOutGuide />
                </>
              ) : (
                <Card className="w-full">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h4 className="text-lg font-semibold mb-2">Complete Registration First</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You must be registered to view your balance and withdraw tokens.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("registration")}
                      className="bg-electric-blue hover:bg-electric-blue/80"
                    >
                      Go to Registration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}