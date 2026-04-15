import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Crown, Users, Gift, Trophy, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Creator, ReferralReward } from "@shared/schema";

interface ReferralSystemProps {
  creatorId?: number;
  creator?: Creator;
}

interface ReferralStatsData {
  totalReferrals: number;
  totalBonus: string;
  pendingRewards: number;
  completedRewards: number;
  rewards: ReferralReward[];
}

export function ReferralSystem({ creatorId, creator }: ReferralSystemProps) {
  const [referralCode, setReferralCode] = useState("");
  const [showShareCode, setShowShareCode] = useState(false);
  const { toast } = useToast();

  const { data: referralStats, isLoading } = useQuery<any>({
    queryKey: ['/api/referrals/rewards', creatorId],
    queryFn: async () => {
      const res = await fetch(`/api/referrals/rewards${creatorId ? `?creatorId=${creatorId}` : ''}`);
      const rewards = await res.json();
      
      const pendingRewards = rewards.filter((r: ReferralReward) => r.status === 'pending').length;
      const completedRewards = rewards.filter((r: ReferralReward) => r.status === 'completed').length;
      const totalBonus = rewards.reduce((sum: number, r: ReferralReward) => sum + parseFloat(r.rewardAmount), 0);
      
      return {
        totalReferrals: (creator as any)?.totalReferrals || 0,
        totalBonus: totalBonus.toFixed(8),
        pendingRewards,
        completedRewards,
        rewards
      };
    },
    enabled: !!creatorId,
  });

  useEffect(() => {
    if ((creator as any)?.referralCode) {
      setReferralCode((creator as any).referralCode);
    }
  }, [creator]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Referral code copied successfully",
    });
  };

  const generateShareUrl = () => {
    if (!referralCode) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/creator-portal?ref=${referralCode}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Early Adopter Badge */}
      {creator?.isEarlyAdopter && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-purple-400">Early Adopter</CardTitle>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                #{creator.earlyAdopterRank}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">
              You're among the first 100 creators on WebPayback Protocol! 
              Enjoy exclusive Early Adopter benefits including enhanced referral bonuses.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {referralStats?.totalReferrals || 0}
            </div>
            <p className="text-xs text-gray-400">Creators referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Total Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {referralStats?.totalBonus || "0.00000000"} WPT
            </div>
            <p className="text-xs text-gray-400">Referral rewards earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {referralStats?.pendingRewards || 0}
            </div>
            <p className="text-xs text-gray-400">Processing rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your referral code to invite new creators and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <div className="flex gap-2">
              <Input
                id="referralCode"
                value={referralCode}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referralCode)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {referralCode && (
            <div className="space-y-2">
              <Label htmlFor="shareUrl">Share URL</Label>
              <div className="flex gap-2">
                <Input
                  id="shareUrl"
                  value={generateShareUrl()}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateShareUrl())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-cyan-400 mb-2">Referral Rewards</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Base reward: 5 WPT per successful referral</li>
              {creator?.isEarlyAdopter && (
                <li>• Early Adopter bonus: +2 WPT per referral</li>
              )}
              <li>• Rewards distributed automatically when referred creator completes verification</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referral Rewards */}
      {referralStats?.rewards && referralStats.rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referral Rewards</CardTitle>
            <CardDescription>
              Your latest referral reward activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralStats.rewards.slice(0, 5).map((reward: any) => (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(reward.status)}
                    <div>
                      <div className="font-medium text-sm">
                        {reward.rewardType === 'early_adopter_bonus' ? 'Early Adopter Bonus' : 'Referral Reward'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-400">
                      +{reward.rewardAmount} WPT
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {reward.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}