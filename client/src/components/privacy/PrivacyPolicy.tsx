import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Mail, Github } from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            WebPayback Protocol respects your privacy and protects your data
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <Badge variant="outline">Effective: January 19, 2025</Badge>
            <Badge variant="outline">GDPR Compliant</Badge>
            <Badge variant="outline">CCPA Compliant</Badge>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">Your data is used only for WebPayback services and AI reward distribution</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">We never sell your personal information to third parties</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">Blockchain transactions are public but personal data is protected</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">You can request data deletion at any time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              What Information We Collect
            </CardTitle>
            <CardDescription>
              We collect only necessary information to provide our services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Name and email address</li>
                  <li>• Social media profile information</li>
                  <li>• Wallet addresses</li>
                  <li>• Website URLs and domains</li>
                  <li>• Platform verification data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Information</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• AI access patterns to your content</li>
                  <li>• Blockchain transaction history</li>
                  <li>• Platform usage analytics</li>
                  <li>• Security monitoring data</li>
                  <li>• Content fingerprints</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
            <CardDescription>
              Your data enables fair AI compensation and platform security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600 dark:text-green-400">✓ We Use Data To:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Verify creator identity and platform ownership</li>
                  <li>• Distribute WPT rewards for AI content usage</li>
                  <li>• Send WebPayback updates and news</li>
                  <li>• Ensure platform security and prevent fraud</li>
                  <li>• Improve our services and user experience</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600 dark:text-red-400">✗ We Never:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Sell your personal information</li>
                  <li>• Share data with advertisers</li>
                  <li>• Use data outside stated purposes</li>
                  <li>• Access private content without permission</li>
                  <li>• Store unnecessary personal information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Security & Protection
            </CardTitle>
            <CardDescription>
              Enterprise-grade security protects your information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Lock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-semibold">Encryption</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">End-to-end encryption for all sensitive data</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-semibold">Fraud Detection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Multi-layer protection against threats</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Eye className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h4 className="font-semibold">Monitoring</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">24/7 security monitoring and audits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
            <CardDescription>
              You have full control over your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Access your personal information</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Correct inaccurate data</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Request data deletion</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Opt-out of communications</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Withdraw consent</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Request data portability</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us About Privacy
            </CardTitle>
            <CardDescription>
              Questions or requests about your privacy and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Privacy Requests</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  For data access, deletion, or privacy questions:
                </p>
                <a 
                  href="mailto:cyper73@gmail.com" 
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  cyper73@gmail.com
                </a>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Full Privacy Policy</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Read our complete privacy policy on GitHub:
                </p>
                <a 
                  href="https://github.com/cyper73/webpayback-protocol/tree/webpayback/privacy.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Notice */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle>Blockchain Transparency Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              WebPayback Protocol operates on public blockchains. While we protect your personal information, 
              wallet addresses and transactions are publicly visible and permanently recorded on the blockchain. 
              This transparency enables trustless reward distribution but means some data cannot be deleted due 
              to the immutable nature of blockchain technology.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}