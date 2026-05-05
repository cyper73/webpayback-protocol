import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, CheckCircle2, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HumanityStatusProps {
  creatorId: number;
}

export function HumanityStatus({ creatorId }: HumanityStatusProps) {
  // Fetch current backend humanity status
  const { data: status, isLoading } = useQuery({
    queryKey: ['humanity-status', creatorId],
    queryFn: async () => {
      const res = await fetch(`/api/humanity/status/${creatorId}`);
      if (!res.ok) throw new Error('Failed to fetch humanity status');
      return res.json();
    },
    enabled: !!creatorId,
  });

  if (isLoading) {
    return (
      <Card className="border-gray-800 bg-black/40">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const isVerified = status?.isVerified;
  const score = status?.score || 0;

  // Calculate multiplier based on the same logic in backend
  let multiplier = 1.0;
  if (score >= 95) multiplier = 2.0;
  else if (score >= 85) multiplier = 1.75;
  else if (score >= 75) multiplier = 1.5;
  else if (score > 0) multiplier = 1.25;

  return (
    <Card className={`border ${isVerified ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Fingerprint className={`h-5 w-5 ${isVerified ? 'text-green-500' : 'text-amber-500'}`} />
            Proof of Humanity
          </CardTitle>
          <Badge variant={isVerified ? "default" : "outline"} className={isVerified ? "bg-green-600 hover:bg-green-700" : "text-amber-500 border-amber-500"}>
            {isVerified ? 'Verified' : 'Not Verified'}
          </Badge>
        </div>
        <CardDescription>
          {isVerified 
            ? "Your human identity is confirmed on the blockchain."
            : "Verify your humanity to unlock reward multipliers."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isVerified ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-black/40 rounded-lg p-3 border border-gray-800">
                <p className="text-xs text-gray-400 mb-1">Humanity Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{score}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
              </div>
              <div className="bg-black/40 rounded-lg p-3 border border-gray-800">
                <p className="text-xs text-gray-400 mb-1">Reward Multiplier</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-400">{multiplier}x</span>
                  <Sparkles className="h-4 w-4 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Last verification: {status.verificationDate ? new Date(status.verificationDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-black/40 rounded-lg p-4 border border-gray-800 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-1">Why verify?</p>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>Reward multiplier up to 2x</li>
                  <li>Protection against bots and sybil attacks</li>
                  <li>Access to protocol governance</li>
                </ul>
              </div>
            </div>
            
            <div className="w-full flex justify-center">
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                onClick={() => {
                  window.location.href = "/login";
                }}
              >
                Open Humanity Login
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
