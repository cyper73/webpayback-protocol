import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quote, Coins, TrendingUp, Brain, Globe, Bot, Sparkles, ExternalLink } from 'lucide-react';

interface UnifiedCitationStats {
  totalCitations: number;
  totalRewards: number;
  citationsByAI: Record<string, number>;
  recentCitations: Array<{
    id: number;
    aiModel: string;  
    citationType: string;
    sourceUrl: string;
    citationContext: string;
    rewardAmount: string | number;
    timestamp: string;
    metadata?: any;
  }>;
  citedSources: string[];
  isAuthentic: boolean;
}

interface UnifiedCitationRewardsDashboardProps {
  userId: number;
  walletAddress?: string;
}

export function UnifiedCitationRewardsDashboard({ userId, walletAddress }: UnifiedCitationRewardsDashboardProps) {
  // Use wallet endpoint if walletAddress is provided, otherwise use user endpoint
  const endpoint = walletAddress ? `/api/citations/wallet/${walletAddress}` : `/api/citations/unified/${userId}`;
  
  const { data: response, isLoading: statsLoading } = useQuery<{
    success: boolean;
    stats: UnifiedCitationStats;
    message: string;
  }>({
    queryKey: walletAddress ? ['/api/citations/wallet', walletAddress] : ['/api/citations/unified', userId],
    enabled: !!(walletAddress || userId),
    refetchInterval: 10000,
    queryFn: () => fetch(endpoint).then(res => res.json()),
  });

  const stats = response?.stats;

  const getAIModelIcon = (model: string) => {
    switch (model?.toLowerCase()) {
      case 'claude': return <Bot className="h-4 w-4 text-orange-600" />;
      case 'gpt': case 'chatgpt': return <Sparkles className="h-4 w-4 text-green-600" />;
      case 'gemini': return <Globe className="h-4 w-4 text-blue-600" />;
      case 'grok': return <Brain className="h-4 w-4 text-purple-600" />;
      case 'perplexity': return <TrendingUp className="h-4 w-4 text-teal-600" />;
      case 'deepseek': return <Quote className="h-4 w-4 text-indigo-600" />;
      case 'mistral': return <Bot className="h-4 w-4 text-red-600" />;
      default: return <Bot className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAIModelColor = (model: string) => {
    switch (model?.toLowerCase()) {
      case 'claude': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'gpt': case 'chatgpt': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'gemini': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'grok': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'perplexity': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      case 'deepseek': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'mistral': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSiteName = (url: string) => {
    if (url.includes('github.com')) return 'GitHub Repository';
    if (url.includes('youtube.com')) return 'YouTube Channel/Video';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'Twitter/X Profile';
    if (url.includes('discord.com')) return 'Discord Channel';
    if (url.includes('linkedin.com')) return 'LinkedIn Profile';
    return new URL(url).hostname;
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Citation-Based Rewards</h1>
          <p className="text-muted-foreground">Loading authentic citation data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Citation-Based Rewards Dashboard</h1>
        <p className="text-gray-300">
          Authentic AI citation tracking across all your registered platforms
        </p>
        {stats?.isAuthentic && (
          <Badge variant="outline" className="mt-2 border-green-500 text-green-400 bg-green-500/10">
            ✓ 100% Authentic Data - Zero Simulation
          </Badge>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Quote className="h-4 w-4" />
              Total Citations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalCitations || 0}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats?.totalRewards?.toFixed(2) || '0.00'} WPT</div>
            <p className="text-xs text-muted-foreground">From authentic AI access</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Cited Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats?.citedSources?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registered platforms</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{Object.keys(stats?.citationsByAI || {}).length}</div>
            <p className="text-xs text-muted-foreground">Different AI systems</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border-border/50">
          <TabsTrigger value="sources" className="data-[state=active]:bg-primary/20">
            Cited Sources
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-primary/20">
            AI Models  
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-primary/20">
            Recent Citations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                All Your Cited Sources
              </CardTitle>
              <CardDescription>
                All registered platforms that received authentic AI citations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.citedSources?.length ? (
                <div className="space-y-3">
                  {stats.citedSources.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-white">{getSiteName(url)}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {url}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No cited sources found yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Models by Citations
              </CardTitle>
              <CardDescription>
                Distribution of citations across different AI systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats?.citationsByAI || {}).length ? (
                <div className="space-y-4">
                  {Object.entries(stats?.citationsByAI || {})
                    .sort(([,a], [,b]) => Number(b) - Number(a))
                    .map(([model, count]) => (
                      <div key={model} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAIModelIcon(model)}
                          <span className="font-medium text-white capitalize">{model}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getAIModelColor(model)}>
                            {count} citations
                          </Badge>
                          <div className="w-24">
                            <Progress 
                              value={(Number(count) / stats.totalCitations) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI model citations found yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Citations
              </CardTitle>
              <CardDescription>
                Latest authentic AI citations across all your platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentCitations?.length ? (
                <div className="space-y-4">
                  {stats.recentCitations.slice(0, 10).map((citation) => (
                    <div
                      key={citation.id}
                      className="p-4 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getAIModelIcon(citation.aiModel)}
                          <Badge className={getAIModelColor(citation.aiModel)}>
                            {citation.aiModel}
                          </Badge>
                          <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                            +{Number(citation.rewardAmount).toFixed(4)} WPT
                          </Badge>
                          {citation.metadata?.rewardCalculation?.humanityMultiplier > 1 && (
                            <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10">
                              Human Bonus {citation.metadata.rewardCalculation.humanityMultiplier}x
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(citation.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Source: <span className="text-white">{getSiteName(citation.sourceUrl)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {citation.sourceUrl}
                      </div>
                      <div className="text-sm text-white mt-2">
                        {citation.citationContext}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent citations found yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}