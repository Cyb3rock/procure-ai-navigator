
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { ActiveProcurementsTable } from '@/components/dashboard/ActiveProcurementsTable';
import { RecentActivitiesCard } from '@/components/dashboard/RecentActivitiesCard';
import { UpcomingDeadlinesCard } from '@/components/dashboard/UpcomingDeadlinesCard';
import { ProcurementStatusChart } from '@/components/dashboard/ProcurementStatusChart';
import { ProcurementSavingsChart } from '@/components/dashboard/ProcurementSavingsChart';
import { DocumentParser } from '@/components/documents/DocumentParser';
import { VendorComparisonMatrix } from '@/components/evaluation/VendorComparisonMatrix';
import { AuditTrailViewer } from '@/components/audit/AuditTrailViewer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Cpu, DollarSign, FileText, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
          <div className="grid gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">AI-Powered Procurement Dashboard</h1>
              <p className="text-muted-foreground">
                Optimize your procurement process with AI-driven insights and automation.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Active RFPs"
                value="12"
                description="3 awaiting evaluation"
                icon={<FileText className="h-4 w-4" />}
                trend={{ value: 20, isPositive: true }}
              />
              <MetricsCard
                title="Total Vendors"
                value="87"
                description="15 added this month"
                icon={<Users className="h-4 w-4" />}
                trend={{ value: 12, isPositive: true }}
              />
              <MetricsCard
                title="Cost Savings"
                value="$1.2M"
                description="YTD procurement savings"
                icon={<DollarSign className="h-4 w-4" />}
                trend={{ value: 8.5, isPositive: true }}
              />
              <MetricsCard
                title="AI Automations"
                value="1,450"
                description="Tasks automated this quarter"
                icon={<Cpu className="h-4 w-4" />}
                trend={{ value: 32, isPositive: true }}
              />
            </div>
            
            <Tabs defaultValue="dashboard">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="documents">Document Processing</TabsTrigger>
                  <TabsTrigger value="evaluation">Vendor Evaluation</TabsTrigger>
                  <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm">
                  <span>Export</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-6">
                  <ActiveProcurementsTable className="md:col-span-6" />
                </div>
                
                <div className="grid gap-6 md:grid-cols-6">
                  <ProcurementStatusChart className="md:col-span-3" />
                  <ProcurementSavingsChart className="md:col-span-3" />
                </div>
                
                <div className="grid gap-6 md:grid-cols-6">
                  <RecentActivitiesCard className="md:col-span-3" />
                  <UpcomingDeadlinesCard className="md:col-span-3" />
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <DocumentParser />
              </TabsContent>
              
              <TabsContent value="evaluation">
                <VendorComparisonMatrix />
              </TabsContent>
              
              <TabsContent value="audit">
                <AuditTrailViewer />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
