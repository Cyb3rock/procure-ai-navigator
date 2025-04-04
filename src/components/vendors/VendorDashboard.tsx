
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CustomersList from '@/components/vendors/CustomersList';
import AddCustomerForm from '@/components/vendors/AddCustomerForm';
import GoogleSheetSetup from '@/components/vendors/GoogleSheetSetup';
import TwilioSetup from '@/components/vendors/TwilioSetup';

interface Customer {
  id: string;
  name: string;
  dueAmount: number;
  entryDate: string;
  dueDate: string;
  paidDate: string | null;
  paidAmount: number | null;
  contactNumber: string;
}

interface VendorDashboardProps {
  vendor: { id: string; name: string } | null;
  onLogout: () => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, onLogout }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSheetConnected, setIsSheetConnected] = useState(false);
  const [isTwilioConnected, setIsTwilioConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");
  const { toast } = useToast();

  // Mock initial data
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: 'c1',
        name: 'John Doe',
        dueAmount: 500,
        entryDate: '2024-04-01',
        dueDate: '2024-04-15',
        paidDate: null,
        paidAmount: null,
        contactNumber: '+1234567890'
      },
      {
        id: 'c2',
        name: 'Jane Smith',
        dueAmount: 750,
        entryDate: '2024-03-28',
        dueDate: '2024-04-10',
        paidDate: null,
        paidAmount: null,
        contactNumber: '+0987654321'
      },
    ];
    
    setCustomers(mockCustomers);
  }, []);

  const handleAddCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = {
      ...customer,
      id: `c${customers.length + 1}`
    };
    
    setCustomers([...customers, newCustomer]);
    
    toast({
      title: "Customer Added",
      description: `${customer.name} has been added to your credit tracking list.`,
    });

    // In a real app, we would sync to Google Sheet here
    if (isSheetConnected) {
      syncToGoogleSheets(newCustomer);
    }
  };

  const handleMarkAsPaid = (id: string, paidAmount: number) => {
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

    // In a real app, we would update the Google Sheet here
    if (isSheetConnected) {
      const paidCustomer = updatedCustomers.find(c => c.id === id);
      if (paidCustomer) {
        updateGoogleSheetsRecord(paidCustomer);
      }
    }
  };

  const syncToGoogleSheets = (customer: Customer) => {
    // This would call your backend API to add to Google Sheets
    console.log("Syncing to Google Sheets:", customer);
    // In a real app, make API call to your backend
  };

  const updateGoogleSheetsRecord = (customer: Customer) => {
    // This would call your backend API to update Google Sheets
    console.log("Updating Google Sheets record:", customer);
    // In a real app, make API call to your backend
  };

  const handleConnectGoogleSheets = (sheetId: string) => {
    // In a real app, this would validate and store the Google Sheets connection
    setIsSheetConnected(true);
    toast({
      title: "Google Sheets Connected",
      description: "Your credit tracking data will now sync automatically.",
    });
  };

  const handleConnectTwilio = (accountSid: string, authToken: string, phoneNumber: string) => {
    // In a real app, this would validate and store Twilio credentials
    setIsTwilioConnected(true);
    toast({
      title: "Twilio Connected",
      description: "Voice reminders are now enabled for overdue payments.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{vendor?.name}'s Dashboard</h2>
          <p className="text-muted-foreground">Manage your customers and credit tracking</p>
        </div>
        <Button variant="outline" onClick={onLogout}>Logout</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add New Customer</CardTitle>
                <CardDescription>
                  Enter customer details and credit information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddCustomerForm onAddCustomer={handleAddCustomer} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Credit Tracking</CardTitle>
                <CardDescription>
                  Manage your customer credit and receive payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomersList 
                  customers={customers}
                  onMarkAsPaid={handleMarkAsPaid} 
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {customers.length} active credit entries
                </div>
                <Button 
                  variant="outline" 
                  disabled={!isSheetConnected}
                  onClick={() => toast({
                    title: "Synced Successfully",
                    description: "All data is up to date with Google Sheets.",
                  })}
                >
                  Sync Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Google Sheets Integration</CardTitle>
                <CardDescription>
                  Connect your Google Sheet for automatic data syncing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleSheetSetup 
                  isConnected={isSheetConnected}
                  onConnect={handleConnectGoogleSheets}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Twilio Voice Reminders</CardTitle>
                <CardDescription>
                  Setup automated voice calls for payment reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TwilioSetup 
                  isConnected={isTwilioConnected}
                  onConnect={handleConnectTwilio}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>
                Track payment trends and outstanding credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground">Analytics will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;
