import { useQuery } from "@tanstack/react-query";
import { WalletBasedAccess } from "@/components/content-certificate/WalletBasedAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, Wallet } from "lucide-react";

export function ContentCertificatePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-8 p-8">
        
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
        
      </div>
    </div>
  );
}