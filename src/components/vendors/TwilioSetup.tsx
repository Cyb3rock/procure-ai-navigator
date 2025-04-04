
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TwilioConfig } from '@/types/vendor';

interface TwilioSetupProps {
  isConnected: boolean;
  onConnect: (accountSid: string, authToken: string, phoneNumber: string, reminderMessage: string, defaultLanguage: string) => void;
}

const TwilioSetup: React.FC<TwilioSetupProps> = ({ isConnected, onConnect }) => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reminderMessage, setReminderMessage] = useState(
    'Hello, this is a reminder that your payment of {{amount}} is due on {{dueDate}}. Please contact us to make a payment.'
  );
  const [defaultLanguage, setDefaultLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would validate the Twilio credentials here
      
      // Simulate API call
      setTimeout(() => {
        onConnect(accountSid, authToken, phoneNumber, reminderMessage, defaultLanguage);
        setIsLoading(false);
      }, 1500);
      
    } catch (err) {
      setError("Failed to connect to Twilio. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleTestCall = () => {
    // In a real app, this would make a test call using your Twilio credentials
    alert("In a production app, this would make a real test call using the Twilio API.");
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <Alert>
          <Check className="h-4 w-4" />
          <AlertTitle>Twilio Connected</AlertTitle>
          <AlertDescription>
            Voice reminders are configured and will trigger automatically for overdue payments.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="message">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="message">Message</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="message" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-message">Reminder Message</Label>
              <Input
                id="reminder-message"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can use {'{{amount}}'}, {'{{dueDate}}'}, and {'{{customerName}}'} variables in your message.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleTestCall}
            >
              Send Test Voice Call
            </Button>
          </TabsContent>
          
          <TabsContent value="language" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-language">Default Language</Label>
              <Select
                value={defaultLanguage}
                onValueChange={(value) => setDefaultLanguage(value)}
              >
                <SelectTrigger id="default-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi 🇮🇳</SelectItem>
                  <SelectItem value="gujarati">Gujarati 🇬🇴</SelectItem>
                  <SelectItem value="marathi">Marathi 🇲🇭</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default language for voice reminders. This can be overridden per customer.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="text-sm">
              <p className="font-medium">Current Reminder Schedule:</p>
              <ul className="list-disc list-inside mt-2">
                <li>First reminder: Day of due date</li>
                <li>Second reminder: 3 days after due date</li>
                <li>Final reminder: 7 days after due date</li>
              </ul>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Custom scheduling options will be available in a future update.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="account-sid">Twilio Account SID</Label>
        <Input
          id="account-sid"
          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={accountSid}
          onChange={(e) => setAccountSid(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="auth-token">Twilio Auth Token</Label>
        <Input
          id="auth-token"
          type="password"
          placeholder="Your Twilio Auth Token"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone-number">Twilio Phone Number</Label>
        <Input
          id="phone-number"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="default-language">Default Language</Label>
        <Select
          value={defaultLanguage}
          onValueChange={(value) => setDefaultLanguage(value)}
        >
          <SelectTrigger id="default-language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="hindi">Hindi 🇮🇳</SelectItem>
            <SelectItem value="gujarati">Gujarati 🇬🇴</SelectItem>
            <SelectItem value="marathi">Marathi 🇲🇭</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="pt-2">
        <Button 
          onClick={handleConnect} 
          disabled={!accountSid || !authToken || !phoneNumber || isLoading}
          className="w-full"
        >
          {isLoading ? 'Connecting...' : 'Connect Twilio'}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>You'll need:</p>
        <ol className="list-decimal list-inside mt-1">
          <li>A Twilio account</li>
          <li>Account SID and Auth Token from your Twilio dashboard</li>
          <li>A Twilio phone number with voice capabilities</li>
        </ol>
      </div>
    </div>
  );
};

export default TwilioSetup;
