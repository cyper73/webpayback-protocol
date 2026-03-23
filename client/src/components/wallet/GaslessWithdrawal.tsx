import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Wallet, ArrowRight, Zap, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePrivy } from '@privy-io/react-auth';
// Import the paymaster client (currently mocked for UI)
// import { getPaymasterAndData } from '@/lib/paymaster';

interface GaslessWithdrawalProps {
  creatorId: number;
}

export function GaslessWithdrawal({ creatorId }: GaslessWithdrawalProps) {
  const { user, authenticated } = usePrivy();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  // MOCK DATA: In a real app, this would come from a react-query hook fetching the DB/Contract
  const availableBalance = 1250.50; 
  const paymasterFee = 0.5; // Cost in WPT-HUMAN

  const handleMaxClick = () => {
    setAmount(availableBalance.toString());
  };

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Importo non valido",
        description: "Inserisci un importo maggiore di zero.",
        variant: "destructive"
      });
      return;
    }

    if (numAmount > availableBalance) {
      toast({
        title: "Fondi insufficienti",
        description: "Non hai abbastanza WPT-HUMAN nel tuo saldo.",
        variant: "destructive"
      });
      return;
    }

    if (numAmount <= paymasterFee) {
      toast({
        title: "Importo troppo basso",
        description: `L'importo deve essere maggiore della commissione di rete (${paymasterFee} WPT-HUMAN).`,
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);
    setWithdrawalSuccess(false);

    try {
      // SIMULATION OF PAYMASTER & SMART CONTRACT CALL
      // 1. Prepare UserOp
      // 2. Call getPaymasterAndData(userOp) from our Pimlico integration
      // 3. Send UserOp to bundler
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network delay
      
      setWithdrawalSuccess(true);
      setAmount('');
      
      toast({
        title: "Prelievo Completato!",
        description: `${numAmount - paymasterFee} WPT-HUMAN sono stati inviati al tuo wallet. Il gas è stato pagato automaticamente!`,
        variant: "default"
      });

    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast({
        title: "Errore di Prelievo",
        description: "Impossibile completare la transazione gasless al momento.",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!authenticated) {
    return (
      <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-200">
        <Info className="h-4 w-4 text-amber-500" />
        Autenticati con Privy per gestire il tuo wallet e i prelievi.
      </Alert>
    );
  }

  const numAmount = parseFloat(amount) || 0;
  const netAmount = Math.max(0, numAmount - paymasterFee);

  return (
    <Card className="border-gray-800 bg-black/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wallet className="h-5 w-5 text-electric-blue" />
            Prelievo Gasless
          </CardTitle>
          <Badge className="bg-electric-blue/20 text-electric-blue border-electric-blue/50">
            ERC-4337 Attivo
          </Badge>
        </div>
        <CardDescription>
          Preleva i tuoi WPT-HUMAN direttamente sul tuo wallet. Non hai bisogno di $tHP per pagare le commissioni, ci pensa il nostro Paymaster.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-electric-blue/10 to-transparent p-6 rounded-xl border border-electric-blue/20">
          <p className="text-sm text-gray-400 mb-1">Saldo Disponibile</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">{availableBalance.toLocaleString()}</span>
            <span className="text-lg text-electric-blue font-medium mb-1">WPT-HUMAN</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            Wallet: {user?.wallet?.address || 'Non connesso'}
          </p>
        </div>

        {/* Withdrawal Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Importo da prelevare</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-black/60 border-gray-700 pl-4 pr-20 text-lg"
              />
              <Button 
                variant="ghost" 
                className="absolute right-1 top-1 h-8 text-xs text-electric-blue hover:text-electric-blue hover:bg-electric-blue/10"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-black/60 rounded-lg p-4 border border-gray-800 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Importo Richiesto:</span>
              <span>{numAmount > 0 ? numAmount.toFixed(2) : '0.00'} WPT-HUMAN</span>
            </div>
            <div className="flex justify-between items-center text-amber-400/80">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" /> Commissione Paymaster:
              </span>
              <span>- {paymasterFee.toFixed(2)} WPT-HUMAN</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs pl-4 border-l border-gray-800 ml-1">
              <span>(Gas di rete sponsorizzato)</span>
              <span>0.00 $tHP</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-800 flex justify-between font-medium text-white">
              <span>Riceverai:</span>
              <span className="text-green-400">{netAmount > 0 ? netAmount.toFixed(2) : '0.00'} WPT-HUMAN</span>
            </div>
          </div>
        </div>

        {withdrawalSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 text-green-400">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Transazione completata con successo! I token sono nel tuo wallet.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white font-medium py-6 text-lg"
          onClick={handleWithdraw}
          disabled={isWithdrawing || !amount || parseFloat(amount) <= paymasterFee}
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sponsorizzazione e Trasferimento...
            </>
          ) : (
            <>
              Preleva Ora <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}