
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { VendorComparisonMatrix } from '@/components/evaluation/VendorComparisonMatrix';

const EvaluationsPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
          <div className="grid gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Bid Evaluations</h1>
              <p className="text-muted-foreground">
                Evaluate and compare vendor proposals with AI-powered insights.
              </p>
            </div>
            
            <VendorComparisonMatrix />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EvaluationsPage;
