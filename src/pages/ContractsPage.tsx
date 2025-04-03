
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

const ContractsPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
          <div className="grid gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
              <p className="text-muted-foreground">
                Manage procurement contracts and monitor compliance.
              </p>
            </div>
            
            <div className="flex items-center justify-center h-[70vh]">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Coming Soon</h2>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContractsPage;
