import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingBag, CreditCard, Landmark, Lightbulb } from 'lucide-react';

export function CashOutGuide() {
  return (
    <Card className="border-electric-blue/30 bg-black/60 mt-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
      
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-electric-blue/20 rounded-lg">
            <Lightbulb className="h-6 w-6 text-electric-blue" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">Withdrawal Guide (Cash-Out)</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Your WPT-HUMAN are real tokens on the blockchain. You have full control over them.
              Here are 3 simple ways to use them in the real world, with no centralized middlemen on our end.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Option 1: Gift Cards */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-electric-blue/50 transition-colors group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-full text-purple-400 mt-1">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">Instant Spending (Gift Cards)</h4>
              <p className="text-sm text-gray-400 mb-3">
                The fastest method. Exchange your tokens for Amazon, Netflix, or mobile top-up gift cards using external platforms that require no complex registration.
              </p>
              <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300" asChild>
                <a href="https://www.bitrefill.com/" target="_blank" rel="noopener noreferrer">
                  Visit Bitrefill <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Option 2: Crypto Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-electric-blue/50 transition-colors group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400 mt-1">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">Daily Spending (Crypto Debit Cards)</h4>
              <p className="text-sm text-gray-400 mb-3">
                Send your tokens to your favorite exchange and use their Visa/Mastercard debit card to pay for coffee or groceries directly in crypto.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" asChild>
                  <a href="https://www.binance.com/en/cards" target="_blank" rel="noopener noreferrer">
                    Binance Card <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Option 3: Bank Transfer */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-electric-blue/50 transition-colors group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-full text-green-400 mt-1">
              <Landmark className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">Bank Transfer (Exchanges)</h4>
              <p className="text-sm text-gray-400 mb-3">
                The traditional route. Transfer your tokens to your account on a major exchange, convert them to USD/EUR, and request a bank transfer to your local bank.
              </p>
              <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300" asChild>
                <a href="https://www.coinbase.com/" target="_blank" rel="noopener noreferrer">
                  Visit Coinbase <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
