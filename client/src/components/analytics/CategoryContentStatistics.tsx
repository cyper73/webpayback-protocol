import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function CategoryContentStatistics() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
  });

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl border-electric-blue/30 h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </Card>
    );
  }

  const creators = dashboardData?.creators || [];
  
  // Aggrega le categorie
  const categoryData = creators.reduce((acc: any, creator: any) => {
    const category = creator.contentCategory || 'Other';
    const existingCategory = acc.find((c: any) => c.name === category);
    
    if (existingCategory) {
      existingCategory.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    
    return acc;
  }, []);

  // Ordina per valore decrescente
  categoryData.sort((a: any, b: any) => b.value - a.value);

  // Formatta i nomi delle categorie per la visualizzazione
  const formattedData = categoryData.map((item: any) => ({
    ...item,
    name: item.name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));

  return (
    <Card className="glass-card rounded-2xl shadow-neon-blue border-electric-blue/30 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold gradient-text">
            User Category Statistics
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Total Creators: {creators.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {formattedData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {formattedData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid #333' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No category data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}