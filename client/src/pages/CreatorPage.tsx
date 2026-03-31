import CreatorPortal from "@/components/creators/CreatorPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Coins, TrendingUp } from "lucide-react";

export default function CreatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Creator Portal
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Register your content and start earning rewards when AI systems use your work
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Creator Portal - Main Content */}
          <div className="lg:col-span-2">
            <CreatorPortal />
          </div>

          {/* Sidebar with Info Cards */}
          <div className="space-y-6">
            
            {/* Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Creator Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Coins className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Earn WPT Rewards</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Get compensated when AI systems use your content
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Content Protection</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Advanced AI detection and NFT certificates
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Creator Network</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Join a community of protected creators
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <Shield className="h-5 w-5" />
                  <span>Biometric Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Your account is protected by Humanity Protocol. No passwords or 2FA required. 
                  Your identity is your key.
                </p>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  New to WebPayback Protocol? Check out our resources:
                </p>
                <div className="space-y-2">
                  <a 
                    href="/getting-started" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                  >
                    Getting Started Guide
                  </a>
                  <a 
                    href="/terms" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                  >
                    Terms of Service
                  </a>
                  <a 
                    href="/privacy" 
                    className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                  >
                    Privacy Policy
                  </a>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}