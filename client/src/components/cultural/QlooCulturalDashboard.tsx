/**
 * Qloo Cultural Intelligence Dashboard
 * Shows taste-aware content analysis and culturally-enhanced WPT rewards
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Heart, 
  Star, 
  Brain, 
  Palette, 
  Music, 
  Utensils,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const QlooCulturalDashboard: React.FC = () => {
  const [analysisForm, setAnalysisForm] = useState({
    creatorId: '',
    contentUrl: '',
    contentText: '',
    aiModelUsed: 'Claude',
    userLocation: '',
    userDemographics: {
      age_range: '',
      interests: '',
      cultural_background: ''
    }
  });

  const queryClient = useQueryClient();

  // Fetch cultural stats
  const { data: culturalStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/cultural/stats'],
    refetchInterval: 30000
  });

  // Fetch trending opportunities
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/cultural/trending'],
    refetchInterval: 60000
  });

  // Cultural analysis mutation
  const culturalAnalysisMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/cultural/analyze', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cultural/stats'] });
    }
  });

  const handleAnalyzeContent = async () => {
    if (!analysisForm.contentUrl || !analysisForm.creatorId) {
      return;
    }

    const requestData = {
      ...analysisForm,
      userDemographics: {
        ...analysisForm.userDemographics,
        interests: analysisForm.userDemographics.interests.split(',').map(s => s.trim())
      }
    };

    culturalAnalysisMutation.mutate(requestData);
  };

  const stats = culturalStats?.stats;
  const trending = trendingData?.opportunities;
  const analysisResult = culturalAnalysisMutation.data?.result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Qloo Cultural Intelligence</CardTitle>
                <CardDescription>Taste-aware WPT token rewards powered by cultural AI</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
              LLM → Qloo → WebPayback
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Cultural Analytics</TabsTrigger>
          <TabsTrigger value="analyze">Content Analysis</TabsTrigger>
          <TabsTrigger value="trending">Trending Cultures</TabsTrigger>
          <TabsTrigger value="rewards">Smart Rewards</TabsTrigger>
        </TabsList>

        {/* Cultural Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {statsLoading ? (
            <Card className="glass-card">
              <CardContent className="flex items-center justify-center h-32">
                <div className="animate-pulse flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span>Loading cultural analytics...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Total Cultural Rewards */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Cultural Rewards Distributed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">
                    {stats?.total_cultural_rewards_distributed.toFixed(1)} WPT
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enhanced by cultural intelligence
                  </p>
                </CardContent>
              </Card>

              {/* Cultural Diversity Score */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Cultural Diversity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-blue-400">
                        {((stats?.cultural_diversity_score || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(stats?.cultural_diversity_score || 0) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">Platform inclusivity metric</p>
                  </div>
                </CardContent>
              </Card>

              {/* Inclusivity Metrics */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Inclusivity Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <div className="text-lg font-bold text-pink-400">
                        {stats?.inclusivity_metrics?.underrepresented_cultures_supported || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Cultures</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-pink-400">
                        {stats?.inclusivity_metrics?.cross_cultural_collaborations || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Collabs</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-pink-400">
                        {stats?.inclusivity_metrics?.cultural_education_content || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Education</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Cultural Categories */}
              <Card className="glass-card md:col-span-2 xl:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Top Cultural Categories
                  </CardTitle>
                  <CardDescription>Highest WPT rewards by cultural content type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.top_cultural_categories?.map((category: any, index: number) => (
                      <div key={category.category} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            {category.category === 'vegan_cuisine' && <Utensils className="h-4 w-4 text-green-500" />}
                            {category.category === 'street_art' && <Palette className="h-4 w-4 text-purple-500" />}
                            {category.category === 'sustainable_fashion' && <Sparkles className="h-4 w-4 text-blue-500" />}
                            {category.category === 'cultural_fusion' && <Globe className="h-4 w-4 text-orange-500" />}
                            {category.category === 'indigenous_art' && <Star className="h-4 w-4 text-amber-500" />}
                          </div>
                          <div>
                            <div className="font-medium capitalize">
                              {category.category.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {category.creator_count} creators
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-400">
                            {category.reward_total.toFixed(1)} WPT
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Content Analysis Tab */}
        <TabsContent value="analyze" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analysis Form */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Cultural Content Analysis
                </CardTitle>
                <CardDescription>Analyze content for cultural intelligence and taste-aware rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creatorId">Creator ID</Label>
                    <Input
                      id="creatorId"
                      value={analysisForm.creatorId}
                      onChange={(e) => setAnalysisForm(prev => ({ ...prev, creatorId: e.target.value }))}
                      placeholder="e.g., 4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aiModel">AI Model Used</Label>
                    <select
                      id="aiModel"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={analysisForm.aiModelUsed}
                      onChange={(e) => setAnalysisForm(prev => ({ ...prev, aiModelUsed: e.target.value }))}
                    >
                      <option value="Claude">Claude</option>
                      <option value="GPT-4">GPT-4</option>
                      <option value="DeepSeek">DeepSeek</option>
                      <option value="Mistral">Mistral</option>
                      <option value="Grok">Grok</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="contentUrl">Content URL</Label>
                  <Input
                    id="contentUrl"
                    value={analysisForm.contentUrl}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, contentUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=example"
                  />
                </div>

                <div>
                  <Label htmlFor="contentText">Content Description (Optional)</Label>
                  <Textarea
                    id="contentText"
                    value={analysisForm.contentText}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, contentText: e.target.value }))}
                    placeholder="Describe the content for better cultural analysis..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userLocation">User Location</Label>
                    <Input
                      id="userLocation"
                      value={analysisForm.userLocation}
                      onChange={(e) => setAnalysisForm(prev => ({ ...prev, userLocation: e.target.value }))}
                      placeholder="e.g., Italy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interests">Interests</Label>
                    <Input
                      id="interests"
                      value={analysisForm.userDemographics.interests}
                      onChange={(e) => setAnalysisForm(prev => ({ 
                        ...prev, 
                        userDemographics: { ...prev.userDemographics, interests: e.target.value }
                      }))}
                      placeholder="vegan, art, sustainability"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalyzeContent}
                  disabled={culturalAnalysisMutation.isPending || !analysisForm.contentUrl || !analysisForm.creatorId}
                  className="w-full"
                >
                  {culturalAnalysisMutation.isPending ? 'Analyzing...' : 'Analyze Cultural Content'}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Analysis Results
                </CardTitle>
                <CardDescription>Cultural intelligence and reward calculation</CardDescription>
              </CardHeader>
              <CardContent>
                {culturalAnalysisMutation.isPending && (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-pulse flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span>Processing cultural analysis...</span>
                    </div>
                  </div>
                )}

                {analysisResult && (
                  <div className="space-y-4">
                    {/* Reward Summary */}
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Original Reward</span>
                        <span className="text-green-400">{analysisResult.original_reward} WPT</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Cultural Enhanced</span>
                        <span className="text-green-400 font-bold text-lg">
                          {analysisResult.reward_calculation.final_reward} WPT
                        </span>
                      </div>
                      <div className="text-xs text-green-300 mt-1">
                        +{((analysisResult.reward_calculation.cultural_multiplier - 1) * 100).toFixed(1)}% cultural bonus
                      </div>
                    </div>

                    {/* Cultural Categories */}
                    <div>
                      <h4 className="font-medium mb-2">Detected Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.cultural_analysis.detected_categories.map((category: string) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Cultural Insights */}
                    <div>
                      <h4 className="font-medium mb-2">Cultural Insights</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Inclusivity:</span>
                          <span className="ml-2 text-pink-400">
                            {(analysisResult.cultural_insights.inclusivity_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Taste Relevance:</span>
                          <span className="ml-2 text-blue-400">
                            {(analysisResult.cultural_insights.taste_relevance * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {analysisResult.recommendation.cultural_optimization_advice.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Optimization Tips</h4>
                        <div className="space-y-1">
                          {analysisResult.recommendation.cultural_optimization_advice.slice(0, 3).map((tip: string, index: number) => (
                            <div key={index} className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                              • {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!culturalAnalysisMutation.isPending && !analysisResult && (
                  <div className="text-center text-muted-foreground py-8">
                    Submit content for cultural analysis to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trending Cultures Tab */}
        <TabsContent value="trending" className="space-y-4">
          {trendingLoading ? (
            <Card className="glass-card">
              <CardContent className="flex items-center justify-center h-32">
                <div className="animate-pulse">Loading trending opportunities...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trending Categories */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Trending Categories
                  </CardTitle>
                  <CardDescription>High-engagement cultural content types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trending?.trending_categories?.map((category: string, index: number) => (
                      <div key={category} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* High Reward Potential */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    High Reward Potential
                  </CardTitle>
                  <CardDescription>Categories with enhanced WPT bonuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trending?.high_reward_potential?.map((category: string, index: number) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
                        <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                          +{15 + index * 5}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Underrepresented Cultures */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Underrepresented Cultures
                  </CardTitle>
                  <CardDescription>Support diversity with bonus rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trending?.underrepresented_cultures?.map((culture: string) => (
                      <div key={culture} className="flex items-center justify-between p-2 bg-pink-500/10 rounded">
                        <span className="text-sm capitalize">{culture.replace('_', ' ')}</span>
                        <Badge variant="secondary" className="bg-pink-500/20 text-pink-400">
                          +50% Bonus
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cross-Cultural Opportunities */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Cross-Cultural Opportunities
                  </CardTitle>
                  <CardDescription>Fusion content with high engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trending?.cross_cultural_opportunities?.map((opportunity: string) => (
                      <div key={opportunity} className="p-2 bg-blue-500/10 rounded">
                        <span className="text-sm capitalize">{opportunity.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Smart Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Smart Reward System Architecture
              </CardTitle>
              <CardDescription>How Cultural Intelligence enhances WPT token distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flow Diagram */}
              <div className="bg-muted/10 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-center">LLM → Qloo → WebPayback Flow</h4>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Brain className="h-8 w-8 text-blue-500" />
                    </div>
                    <span className="font-medium">Content Analysis</span>
                    <span className="text-xs text-muted-foreground">LLM Processing</span>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <Globe className="h-8 w-8 text-purple-500" />
                    </div>
                    <span className="font-medium">Cultural Intelligence</span>
                    <span className="text-xs text-muted-foreground">Qloo API</span>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-green-500" />
                    </div>
                    <span className="font-medium">Smart Rewards</span>
                    <span className="text-xs text-muted-foreground">Enhanced WPT</span>
                  </div>
                </div>
              </div>

              {/* Reward Multipliers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Cultural Multipliers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-green-500/10 rounded">
                      <span className="text-sm">Diverse Culture Bonus</span>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">+30%</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-pink-500/10 rounded">
                      <span className="text-sm">Underrepresented Culture</span>
                      <Badge variant="secondary" className="bg-pink-500/20 text-pink-400">+50%</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-500/10 rounded">
                      <span className="text-sm">Regional Affinity</span>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">+20%</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-orange-500/10 rounded">
                      <span className="text-sm">Taste Alignment</span>
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">+40%</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Engagement Bonuses</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-purple-500/10 rounded">
                      <span className="text-sm">Community Impact</span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">+25%</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-yellow-500/10 rounded">
                      <span className="text-sm">Cross-Cultural Content</span>
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">+35%</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-indigo-500/10 rounded">
                      <span className="text-sm">Educational Value</span>
                      <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400">+15%</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-teal-500/10 rounded">
                      <span className="text-sm">Innovation Score</span>
                      <Badge variant="secondary" className="bg-teal-500/20 text-teal-400">+20%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QlooCulturalDashboard;