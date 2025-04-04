import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AddCustomerForm from '@/components/vendors/AddCustomerForm';
import GoogleSheetSetup from '@/components/vendors/GoogleSheetSetup';
import TwilioSetup from '@/components/vendors/TwilioSetup';
import CustomersList from '@/components/vendors/CustomersList';
import { Customer, TwilioConfig } from '@/types/vendor';
import { BellIcon, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VendorDashboardProps {
  vendor: { id: string; name: string } | null;
  onLogout: () => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, onLogout }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSheetConnected, setIsSheetConnected] = useState(false);
  const [isTwilioConnected, setIsTwilioConnected] = useState(false);
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig | null>(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "ABC Corp",
        dueAmount: 5000,
        entryDate: "2023-01-15",
        dueDate: "2023-02-15",
        paidDate: null,
        paidAmount: null,
        contactNumber: "+1234567890"
      },
      {
        id: "2",
        name: "XYZ Ltd",
        dueAmount: 3500,
        entryDate: "2023-01-20",
        dueDate: "2023-02-20",
        paidDate: null,
        paidAmount: null,
        contactNumber: "+1987654321"
      }
    ];
    
    setCustomers(mockCustomers);
    
    setUnreadNotifications(3);
  }, []);

  const handleAddCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Math.random().toString(36).substring(7),
    };

    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);

    toast({
      title: "Customer Added",
      description: `${customer.name} has been added to your credit tracking list.`,
    });

    if (isSheetConnected) {
      syncToGoogleSheets(newCustomer);
    }
  };

  const handleRecordPayment = (id: string, paidAmount: number) => {
    const updatedCustomers = customers.map(customer => {
      if (customer.id === id) {
        return {
          ...customer,
          paidDate: new Date().toISOString().split('T')[0],
          paidAmount
        };
      }
      return customer;
    });

    setCustomers(updatedCustomers);

    toast({
      title: "Payment Recorded",
      description: `Payment of $${paidAmount} has been recorded.`,
    });

    if (isSheetConnected) {
      const paidCustomer = updatedCustomers.find(c => c.id === id);
      if (paidCustomer) {
        updateGoogleSheetsRecord(paidCustomer);
      }
    }
  };

  const syncToGoogleSheets = (customer: Customer) => {
    console.log("Syncing to Google Sheets:", customer);
  };

  const updateGoogleSheetsRecord = (customer: Customer) => {
    console.log("Updating Google Sheets record:", customer);
  };

  const handleConnectGoogleSheets = (sheetId: string) => {
    setIsSheetConnected(true);
    toast({
      title: "Google Sheets Connected",
      description: "Your data will now automatically sync to Google Sheets.",
    });
  };

  const handleConnectTwilio = (accountSid: string, authToken: string, phoneNumber: string, reminderMessage: string, defaultLanguage: string) => {
    setIsTwilioConnected(true);
    setTwilioConfig({
      accountSid,
      authToken,
      phoneNumber,
      reminderMessage,
      defaultLanguage
    });
    toast({
      title: "Twilio Connected",
      description: "Voice reminders are now enabled for overdue payments.",
    });
  };

  const handleNotificationsClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications.",
    });
    setUnreadNotifications(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {vendor?.name || 'Vendor'}</h2>
          <p className="text-muted-foreground">Manage your credit tracking and procurement system</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNotificationsClick}
            >
              <BellIcon className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </div>
          <Button variant="destructive" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your procurement and credit tracking overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-2xl font-bold">
                  ${customers.reduce((sum, c) => sum + (c.paidDate ? 0 : c.dueAmount), 0)}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => !c.paidDate && new Date(c.dueDate) < new Date()).length}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.paidDate).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Google Sheets</span>
              <Badge variant={isSheetConnected ? "default" : "outline"}>{isSheetConnected ? "Connected" : "Not Connected"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Twilio Voice Reminders</span>
              <Badge variant={isTwilioConnected ? "default" : "outline"}>{isTwilioConnected ? "Connected" : "Not Connected"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="rfps">RFPs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Customer</CardTitle>
              <CardDescription>Create a new customer credit entry</CardDescription>
            </CardHeader>
            <CardContent>
              <AddCustomerForm 
                onAddCustomer={handleAddCustomer} 
                languages={twilioConfig?.defaultLanguage ? [twilioConfig.defaultLanguage] : ["english", "hindi", "gujarati", "marathi"]} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>Manage your customer credit tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomersList 
                customers={customers} 
                onRecordPayment={handleRecordPayment} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Sheets Integration</CardTitle>
              <CardDescription>Connect to Google Sheets for automatic data sync</CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleSheetSetup isConnected={isSheetConnected} onConnect={handleConnectGoogleSheets} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Twilio Voice Reminders</CardTitle>
              <CardDescription>Set up automated voice call reminders for overdue payments</CardDescription>
            </CardHeader>
            <CardContent>
              <TwilioSetup isConnected={isTwilioConnected} onConnect={handleConnectTwilio} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RFP Management</CardTitle>
              <CardDescription>Manage your Request for Proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">RFP management features coming soon!</p>
                <Button className="mt-4" variant="outline">Create New RFP</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;
