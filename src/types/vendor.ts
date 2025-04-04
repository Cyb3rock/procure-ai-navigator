
// Vendor types
export interface Vendor {
  id: string;
  name: string;
  email: string;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  dueAmount: number;
  entryDate: string;
  dueDate: string;
  paidDate: string | null;
  paidAmount: number | null;
  contactNumber: string;
}

// Google Sheets configuration
export interface GoogleSheetsConfig {
  sheetId: string;
  sheetName: string;
}

// Twilio configuration
export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  reminderMessage: string;
}
