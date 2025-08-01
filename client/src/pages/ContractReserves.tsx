import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Wallet, ArrowRight, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ContractReserves() {
  const [transferAmount, setTransferAmount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current balances
  const { data: balances, isLoading, error } = useQuery({
    queryKey: ['/api/contract-reserves/balances'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (amount: string) => {
      return await apiRequest('/api/contract-reserves/transfer-to-reserves', 'POST', {
        amount: parseFloat(amount)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer Successful",
        description: `${transferAmount} WPT transferred to contract reserves`,
        variant: "default",
      });
      setTransferAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/contract-reserves/balances'] });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer tokens",
        variant: "destructive",
      });
    }
  });

  const handleTransfer = () => {
    if (!transferAmount || isNaN(parseFloat(transferAmount)) || parseFloat(transferAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(transferAmount) > 5000000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum transfer is 5M WPT for safety",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate(transferAmount);
  };

  const quickAmounts = [1000000, 2000000, 3000000];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Clock className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading balances...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Contract Reserve Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transfer WPT tokens from your wallet to contract reserves to reduce bot flagging risk.
            Tokens in contract reserves appear as "locked" and reduce dump risk perception.
          </p>
        </div>

        {/* Current Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Token Distribution
            </CardTitle>
            <CardDescription>
              View current WPT token balances across wallet and contract reserves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Founder Wallet */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Founder Wallet</Label>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {balances ? parseFloat(balances.balances.founderWallet).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} WPT
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    {balances?.balances.founderAddress}
                  </div>
                </div>
              </div>

              {/* Contract Reserves */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Contract Reserves</Label>
                  <Badge variant="secondary">Locked</Badge>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {balances ? parseFloat(balances.balances.contractReserves).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} WPT
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    {balances?.balances.contractAddress}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />
            
            {/* Total Supply */}
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total WPT Supply</div>
              <div className="text-xl font-semibold">10,000,000 WPT</div>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Transfer to Contract Reserves
            </CardTitle>
            <CardDescription>
              Move tokens from your wallet to contract reserves to reduce bot flagging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label>Quick Transfer Amounts</Label>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setTransferAmount(amount.toString())}
                    disabled={transferMutation.isPending}
                  >
                    {(amount / 1000000).toFixed(1)}M WPT
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="transferAmount">Custom Amount (WPT)</Label>
              <Input
                id="transferAmount"
                type="number"
                placeholder="Enter amount in WPT"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                disabled={transferMutation.isPending}
                min="0"
                max="5000000"
                step="1000"
              />
              <div className="text-xs text-gray-500">
                Maximum: 5,000,000 WPT per transfer for safety
              </div>
            </div>

            {/* Transfer Button */}
            <Button
              onClick={handleTransfer}
              disabled={transferMutation.isPending || !transferAmount}
              className="w-full"
              size="lg"
            >
              {transferMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin mr-2" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Transfer to Reserves
                </>
              )}
            </Button>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security:</strong> This operation transfers tokens from your wallet to the contract itself.
                Tokens remain in the WPT ecosystem but appear as "locked reserves" to reduce bot flagging.
                This does NOT affect pools, gas fees, or swap rates.
              </AlertDescription>
            </Alert>

          </CardContent>
        </Card>

        {/* Benefits Info */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Reserve Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <h3 className="font-semibold">Reduced Bot Flagging</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tokens in contract reserves appear as "protocol locked" rather than "dump risk"
                </p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 text-blue-600 mx-auto" />
                <h3 className="font-semibold">Zero Pool Impact</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transfer doesn't affect liquidity pools, prices, or trading operations
                </p>
              </div>
              <div className="text-center space-y-2">
                <Wallet className="h-8 w-8 text-purple-600 mx-auto" />
                <h3 className="font-semibold">Reversible</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can transfer tokens back to your wallet anytime if needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}