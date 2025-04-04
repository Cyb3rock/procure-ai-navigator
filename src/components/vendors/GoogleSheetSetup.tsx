
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check } from 'lucide-react';

interface GoogleSheetSetupProps {
  isConnected: boolean;
  onConnect: (sheetId: string) => void;
}

const GoogleSheetSetup: React.FC<GoogleSheetSetupProps> = ({ isConnected, onConnect }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('Credit Tracking');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    // Extract Sheet ID from the URL
    try {
      // This is a very basic extraction - in reality you'd need proper URL parsing
      const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;
      
      if (!sheetId) {
        setError("Invalid Google Sheet URL. Please check and try again.");
        setIsLoading(false);
        return;
      }
      
      // Simulate API call
      setTimeout(() => {
        onConnect(sheetId);
        setIsLoading(false);
      }, 1500);
      
    } catch (err) {
      setError("Failed to connect to Google Sheet. Please try again.");
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <Alert>
          <Check className="h-4 w-4" />
          <AlertTitle>Connected to Google Sheets</AlertTitle>
          <AlertDescription>
            Your data is automatically syncing to your Google Sheets document.
          </AlertDescription>
        </Alert>
        <div className="text-sm text-muted-foreground">
          <p>Your sheet contains the following columns:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Customer Name</li>
            <li>Entry Date</li>
            <li>Due Amount</li>
            <li>Due Date</li>
            <li>Paid Date</li>
            <li>Days Left (auto-calculated)</li>
          </ul>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.open('https://docs.google.com/spreadsheets', '_blank')}
        >
          Open Google Sheets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sheet-url">Google Sheet URL</Label>
        <Input
          id="sheet-url"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sheet-name">Sheet Name</Label>
        <Input
          id="sheet-name"
          placeholder="Credit Tracking"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
        />
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
          disabled={!sheetUrl || isLoading}
          className="w-full"
        >
          {isLoading ? 'Connecting...' : 'Connect Google Sheet'}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>Note: In a real application, you would need to:</p>
        <ol className="list-decimal list-inside mt-1">
          <li>Create a Google Cloud Project</li>
          <li>Enable Google Sheets API</li>
          <li>Set up OAuth 2.0 for user authorization</li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleSheetSetup;
