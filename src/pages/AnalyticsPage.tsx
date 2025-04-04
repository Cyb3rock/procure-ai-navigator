
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from 'recharts';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChartIcon, PieChartIcon, LineChart as LineChartIcon, Users, Calendar, FileCheck, CircleDollarSign, ArrowUpCircle, Percent, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// This would typically come from a context or store
const mockUser = {
  id: '1',
  name: 'Test User',
  role: 'admin', // Change to 'vendor' to test vendor view
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(mockUser.role === 'admin' ? 'overview' : 'performance');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [vendorStats, setVendorStats] = useState<any>(null);
  const [spendingData, setSpendingData] = useState<any[]>([]);
  const [rfpStatusData, setRfpStatusData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeIndex, setActiveIndex] = useState(0);

  const isAdmin = mockUser.role === 'admin';

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be API calls
        if (isAdmin) {
          await fetchAdminData();
        } else {
          await fetchVendorData();
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        // Add a short delay for demo purposes
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchData();
  }, [isAdmin, selectedYear]);

  const fetchAdminData = async () => {
    // Mock data - in a real app this would be API calls
    
    // Admin overview
    const overviewData = {
      totalProcurementValue: 2750000,
      rfpStatusSummary: { Draft: 28, Submitted: 45, Awarded: 32, Rejected: 15 },
      vendorCount: 18,
      recentRFPs: []
    };
    setAdminStats(overviewData);

    // Monthly spending
    const spendingMockData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(selectedYear, i).toLocaleString('default', { month: 'short' }),
      shortMonth: new Date(selectedYear, i).toLocaleString('default', { month: 'short' }).substring(0, 3),
      value: Math.floor(Math.random() * 300000) + 100000,
      count: Math.floor(Math.random() * 8) + 1
    }));
    setSpendingData(spendingMockData);

    // RFP status data
    const statusData = {
      labels: ['Draft', 'Submitted', 'Awarded', 'Rejected'],
      counts: [28, 45, 32, 15],
      values: [425000, 1200000, 2750000, 480000],
      details: [
        { status: 'Draft', count: 28, value: 425000, percentageByCount: 23.3, percentageByValue: 8.7 },
        { status: 'Submitted', count: 45, value: 1200000, percentageByCount: 37.5, percentageByValue: 24.7 },
        { status: 'Awarded', count: 32, value: 2750000, percentageByCount: 26.7, percentageByValue: 56.6 },
        { status: 'Rejected', count: 15, value: 480000, percentageByCount: 12.5, percentageByValue: 9.9 }
      ]
    };
    setRfpStatusData(statusData);
  };

  const fetchVendorData = async () => {
    // Mock data for vendor view
    const vendorData = {
      rfpCounts: { Draft: 5, Submitted: 8, Awarded: 4, Rejected: 2 },
      performance: {
        totalSubmitted: 14,
        totalAwarded: 4,
        successRate: 28.6,
        totalEarnings: 387500
      },
      chartData: {
        labels: ['Draft', 'Submitted', 'Awarded', 'Rejected'],
        counts: [5, 8, 4, 2],
        values: [75000, 215000, 387500, 45000]
      }
    };
    setVendorStats(vendorData);
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderAdminDashboard = () => {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="rfp-status">RFP Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-28" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricsCard
                title="Total Procurement Value"
                value={formatCurrency(adminStats?.totalProcurementValue || 0)}
                description="Sum of all awarded RFPs"
                icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricsCard
                title="Total Vendors"
                value={adminStats?.vendorCount}
                description="Registered vendors in the system"
                icon={<Users className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricsCard
                title="Total RFPs"
                value={(adminStats?.rfpStatusSummary?.Draft + 
                       adminStats?.rfpStatusSummary?.Submitted + 
                       adminStats?.rfpStatusSummary?.Awarded + 
                       adminStats?.rfpStatusSummary?.Rejected) || 0}
                description="All RFPs in the system"
                icon={<FileCheck className="h-5 w-5 text-muted-foreground" />}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>RFP Status Distribution</CardTitle>
                <CardDescription>Number of RFPs by current status</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? (
                  <div className="flex justify-center items-center h-60">
                    <Skeleton className="h-full w-full rounded-md" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Draft', value: adminStats?.rfpStatusSummary?.Draft || 0 },
                          { name: 'Submitted', value: adminStats?.rfpStatusSummary?.Submitted || 0 },
                          { name: 'Awarded', value: adminStats?.rfpStatusSummary?.Awarded || 0 },
                          { name: 'Rejected', value: adminStats?.rfpStatusSummary?.Rejected || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                      >
                        {[
                          { name: 'Draft', value: adminStats?.rfpStatusSummary?.Draft || 0 },
                          { name: 'Submitted', value: adminStats?.rfpStatusSummary?.Submitted || 0 },
                          { name: 'Awarded', value: adminStats?.rfpStatusSummary?.Awarded || 0 },
                          { name: 'Rejected', value: adminStats?.rfpStatusSummary?.Rejected || 0 }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} RFPs`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Procurement Trend</CardTitle>
                <CardDescription>RFP count by month for the current year</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? (
                  <div className="flex justify-center items-center h-60">
                    <Skeleton className="h-full w-full rounded-md" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={spendingData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="shortMonth" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'RFP Count']} />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="spending" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Monthly Procurement Spending</CardTitle>
                <CardDescription>Expenditure by month for awarded RFPs</CardDescription>
              </div>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), 'Procurement Value']}
                      labelFormatter={(label) => `${label} ${selectedYear}`}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Spending" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricsCard
              title="Total Annual Spend"
              value={formatCurrency(spendingData.reduce((sum, item) => sum + item.value, 0))}
              description={`Total for ${selectedYear}`}
              icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />}
            />
            <MetricsCard
              title="Average Monthly"
              value={formatCurrency(spendingData.reduce((sum, item) => sum + item.value, 0) / 12)}
              description={`Monthly average for ${selectedYear}`}
              icon={<BarChartIcon className="h-5 w-5 text-muted-foreground" />}
            />
            <MetricsCard
              title="Total RFPs Awarded"
              value={spendingData.reduce((sum, item) => sum + item.count, 0)}
              description={`RFPs awarded in ${selectedYear}`}
              icon={<Award className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="rfp-status" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>RFP Status by Count</CardTitle>
                  <CardDescription>Distribution of RFPs by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={rfpStatusData?.details}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {rfpStatusData?.details.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} RFPs (${props.payload.percentageByCount}%)`, 
                          props.payload.status
                        ]} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>RFP Status by Value</CardTitle>
                  <CardDescription>Distribution of RFP value by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={rfpStatusData?.details}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rfpStatusData?.details.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${formatCurrency(value as number)} (${props.payload.percentageByValue}%)`, 
                          props.payload.status
                        ]} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>RFP Status Details</CardTitle>
              <CardDescription>Detailed breakdown by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Draft', 'Submitted', 'Awarded', 'Rejected'].map((status, index) => {
                  const statusData = rfpStatusData?.details.find((d: any) => d.status === status);
                  return (
                    <div 
                      key={status} 
                      className="flex flex-col p-4 rounded-md border"
                      style={{ borderLeftColor: COLORS[index % COLORS.length], borderLeftWidth: '4px' }}
                    >
                      <span className="text-sm text-muted-foreground">{status}</span>
                      <span className="text-2xl font-bold">{statusData?.count || 0}</span>
                      <span className="text-sm">{formatCurrency(statusData?.value || 0)}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {statusData?.percentageByCount}% of total count
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };

  const renderVendorDashboard = () => {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="submissions">RFP Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-28" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Earnings"
                value={formatCurrency(vendorStats?.performance?.totalEarnings || 0)}
                description="From awarded RFPs"
                icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricsCard
                title="Success Rate"
                value={`${vendorStats?.performance?.successRate || 0}%`}
                description="RFPs awarded vs. submitted"
                icon={<Percent className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricsCard
                title="Total Submissions"
                value={vendorStats?.performance?.totalSubmitted || 0}
                description="RFPs submitted + awarded"
                icon={<ArrowUpCircle className="h-5 w-5 text-muted-foreground" />}
              />
              <MetricsCard
                title="Total Awarded"
                value={vendorStats?.performance?.totalAwarded || 0}
                description="Successfully awarded RFPs"
                icon={<Award className="h-5 w-5 text-muted-foreground" />}
              />
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>RFP Value by Status</CardTitle>
              <CardDescription>Total value of your RFPs by status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={vendorStats?.chartData?.labels.map((label: string, index: number) => ({
                      status: label,
                      value: vendorStats?.chartData?.values[index] || 0
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Value']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {vendorStats?.chartData?.labels.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RFP Status Distribution</CardTitle>
              <CardDescription>Count of your RFPs by status</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="w-full max-w-md">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={vendorStats?.chartData?.labels.map((label: string, index: number) => ({
                          name: label,
                          value: vendorStats?.chartData?.counts[index] || 0
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {vendorStats?.chartData?.labels.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} RFPs`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Draft', 'Submitted', 'Awarded', 'Rejected'].map((status, index) => (
              <Card key={status}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">{status} RFPs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vendorStats?.rfpCounts?.[status] || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(vendorStats?.chartData?.values[index] || 0)} total value
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
          <div className="grid gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Procurement Analytics</h1>
              <p className="text-muted-foreground">
                {isAdmin 
                  ? 'Insights into procurement activities across all vendors.'
                  : 'Track your RFP performance and procurement activities.'
                }
              </p>
            </div>
            
            {isAdmin ? renderAdminDashboard() : renderVendorDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
