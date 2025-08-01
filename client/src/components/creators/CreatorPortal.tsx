import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Shield, CheckCircle, AlertTriangle, FileText, Globe, Copy, Code } from "lucide-react";
import { sanitizeUrl, sanitizeWalletAddress, sanitizeToastContent, validateDomain, sanitizeContentCategory } from "@/lib/security";
import { WalletVerification } from "@/components/wallet/WalletVerification";

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
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You have been successfully registered as a content creator!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      reset();
      setDomainVerification(null);
      setIsDomainVerified(false);
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

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text">Creator Registration Portal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
              Website URL
            </Label>
            <div className="p-3 mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-300">
                  <p className="font-semibold mb-1">Important: Use specific content URLs</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>YouTube:</strong> Link to specific video (youtube.com/watch?v=xxx)</li>
                    <li>• <strong>Instagram:</strong> Link to specific post (instagram.com/p/xxx)</li>
                    <li>• <strong>TikTok:</strong> Link to specific video (tiktok.com/@user/video/xxx)</li>
                    <li>• <strong>Discord:</strong> Link to specific channel (discord.com/channels/xxx)</li>
                    <li>• <strong>GitHub:</strong> Link to specific repository (github.com/user/repo)</li>
                    <li>• <strong>Personal sites:</strong> Your website homepage is fine</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=abc123 or https://your-website.com"
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
      </CardContent>
    </Card>
  );
}