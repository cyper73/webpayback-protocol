import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function TestSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">🔧 Test Infrastructure Section</h2>
          <p className="text-gray-400">This is a test to verify the section renders correctly</p>
        </div>
      </div>

      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="text-electric-blue" />
            Test Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Section Rendering</span>
              <span className="font-mono text-sm text-neon-green">✅ Working</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Gas Pool Data</span>
              <span className="font-mono text-sm text-electric-blue">Loading...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Chainlink Data</span>
              <span className="font-mono text-sm text-purple-400">Loading...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}