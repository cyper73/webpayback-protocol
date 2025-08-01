import { useQuery } from "@tanstack/react-query";
<<<<<<< HEAD
import { WalletBasedAccess } from "@/components/content-certificate/WalletBasedAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, Wallet } from "lucide-react";

export function ContentCertificatePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-8 p-8">
=======
import { ContentCertificateManager } from "@/components/content-certificate/ContentCertificateManager";
import CreatorPortal from "@/components/creators/CreatorPortal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle, User } from "lucide-react";

export function ContentCertificatePage() {
  // Get current authenticated user first
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  // Check if user has creator profile
  const { data: creators, isLoading: creatorsLoading } = useQuery({
    queryKey: ["/api/creators"],
    enabled: !!currentUser, // Only fetch creators if user is authenticated
  });

  // Find creator belonging to current authenticated user
  const userCreator = creators && currentUser ? 
    creators.find(creator => creator.userId === currentUser.id) : null;
  const hasCreatorAccount = !!userCreator;

  if (userLoading || creatorsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying user authentication...</p>
        </div>
      </div>
    );
  }

  // Security check: if no user is authenticated, show error
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-red-600">Authentication Required</h2>
          <p className="text-muted-foreground">You must be logged in to access Content Certificate features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
>>>>>>> 311f543f194f46e11a56aa7a6d731da287f53cc5
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            🛡️ Content Certificate NFTs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionary protection against Google AI Overview content theft through blockchain-verified ownership certificates
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-red-600 text-white">Combat 15-40% Traffic Loss</Badge>
            <Badge className="bg-green-600 text-white">ERC-2981 Royalty Standard</Badge>
            <Badge className="bg-blue-600 text-white">Legal Blockchain Proof</Badge>
          </div>
        </div>

<<<<<<< HEAD
        {/* Important Information */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <AlertCircle className="h-5 w-5" />
              How Content Certificates Work
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Mint NFT Certificates:</strong> Create blockchain proof of content ownership</li>
              <li><strong>SHA-256 Fingerprinting:</strong> Generate unique cryptographic fingerprints</li>
              <li><strong>AI Detection:</strong> Monitor Google AI Overview for unauthorized usage</li>
              <li><strong>Automatic Rewards:</strong> Earn WPT tokens when content theft is detected</li>
              <li><strong>Legal Protection:</strong> Use blockchain certificates for legal action</li>
            </ul>
          </CardContent>
        </Card>

        {/* Wallet-Based Access System */}
        <WalletBasedAccess />
=======
        {/* Creator Registration Required */}
        {!hasCreatorAccount ? (
          <div className="space-y-6">
            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <User className="h-5 w-5" />
                  Creator Registration Required
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  To mint Content Certificate NFTs and earn WPT rewards, you must first register as a creator. 
                  This ensures only verified content creators can protect their work and receive token rewards when AI systems use their content.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Creator Registration Portal */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Register as Content Creator</h2>
              <CreatorPortal />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  Creator Verified - Ready for Content Protection
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  <div className="space-y-1">
                    <div><strong>Name:</strong> {userCreator.name || 'Creator Profile'}</div>
                    <div><strong>Website:</strong> {userCreator.websiteUrl}</div>
                    <div><strong>Wallet:</strong> {userCreator.walletAddress}</div>
                    <div><strong>Category:</strong> {userCreator.contentCategory?.replace('_', ' ').toUpperCase()}</div>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Important Information */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <AlertCircle className="h-5 w-5" />
                  How Content Certificates Work
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 dark:text-blue-300">
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Mint NFT Certificates:</strong> Create blockchain proof of content ownership</li>
                  <li><strong>SHA-256 Fingerprinting:</strong> Generate unique cryptographic fingerprints</li>
                  <li><strong>AI Detection:</strong> Monitor Google AI Overview for unauthorized usage</li>
                  <li><strong>Automatic Rewards:</strong> Earn WPT tokens when content theft is detected</li>
                  <li><strong>Legal Protection:</strong> Use blockchain certificates for legal action</li>
                </ul>
              </CardContent>
            </Card>

            {/* Content Certificate Manager */}
            <ContentCertificateManager creatorId={userCreator.id} />
          </div>
        )}
>>>>>>> 311f543f194f46e11a56aa7a6d731da287f53cc5
        
      </div>
    </div>
  );
}