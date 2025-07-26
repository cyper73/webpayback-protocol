import React from 'react';
import PolStakingDashboard from '@/components/staking/PolStakingDashboard';

export default function PolStakingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <PolStakingDashboard />
      </div>
    </div>
  );
}