
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', budgeted: 620000, actual: 500000 },
  { name: 'Feb', budgeted: 540000, actual: 470000 },
  { name: 'Mar', budgeted: 700000, actual: 590000 },
  { name: 'Apr', budgeted: 510000, actual: 485000 },
  { name: 'May', budgeted: 620000, actual: 530000 },
  { name: 'Jun', budgeted: 680000, actual: 610000 },
];

const formatter = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
};

export function ProcurementSavingsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Procurement Savings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis 
                fontSize={12} 
                tickFormatter={formatter} 
                axisLine={false} 
                tickLine={false} 
                width={50}
              />
              <Tooltip 
                formatter={(value: number) => [`${formatter(value)}`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="budgeted" name="Budgeted" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#0da2e7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
