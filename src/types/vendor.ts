
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
  preferredLanguage?: string; // Added language preference
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
  defaultLanguage: string;
}

// Added new types for the full-stack application

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendor';
  createdAt: string;
}

// RFP types
export interface RFP {
  id: string;
  title: string;
  value: number;
  deadline: string;
  status: 'draft' | 'submitted' | 'awarded' | 'rejected';
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}

// Contract types
export interface Contract {
  id: string;
  title: string;
  vendorId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'terminated';
  milestones: Milestone[];
  documentUrl?: string;
  relatedRfpId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

// Purchase Order types
export interface PurchaseOrder {
  id: string;
  customerName: string;
  paidAmount: number;
  paymentDate: string;
  relatedContractId?: string;
  relatedRfpId?: string;
  notes?: string;
  vendorId: string;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'rfp_deadline' | 'voice_call' | 'overdue_payment' | 'contract_expiration' | 'milestone_due';
  userId: string;
  message: string;
  read: boolean;
  timestamp: string;
  relatedEntityId?: string;
  relatedEntityType?: 'rfp' | 'contract' | 'customer' | 'purchase_order';
}

// Admin Settings
export interface AdminSettings {
  siteTitle: string;
  logoUrl?: string;
  supportEmail: string;
  enableVoiceReminders: boolean;
  paymentGatewayKeys?: {
    publicKey: string;
    privateKey: string;
  };
}
