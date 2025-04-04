
// This file represents what would be in your Node.js backend

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const twilio = require('twilio');
const cron = require('node-cron');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Store vendor configurations in memory (would use a database in production)
const vendorConfigs = {
  // vendorId: {
  //   googleSheets: { sheetId, credentials },
  //   twilio: { accountSid, authToken, phoneNumber }
  // }
};

// Google Sheets helper
async function getGoogleSheetsClient(credentials) {
  // In production, you'd use OAuth2 for proper authentication
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

// Add customer to Google Sheet
app.post('/api/customer', async (req, res) => {
  try {
    const { vendorId, customer } = req.body;
    
    const vendorConfig = vendorConfigs[vendorId];
    if (!vendorConfig || !vendorConfig.googleSheets) {
      return res.status(400).json({ error: 'Google Sheets not configured for this vendor' });
    }
    
    const { sheetId } = vendorConfig.googleSheets;
    
    // Get Google Sheets client
    const sheets = await getGoogleSheetsClient(vendorConfig.googleSheets.credentials);
    
    // Add row to sheet
    const values = [
      [
        customer.name,
        customer.entryDate,
        customer.dueAmount,
        customer.dueDate,
        customer.paidDate || '',
        `=IF(E2="", IF(TODAY()>D2, "Overdue", D2-TODAY()), "Paid")`  // Days left formula
      ]
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding customer to Google Sheet:', error);
    res.status(500).json({ error: 'Failed to add customer to Google Sheet' });
  }
});

// Update customer in Google Sheet
app.put('/api/customer/:customerId', async (req, res) => {
  try {
    const { vendorId, customer, row } = req.body;
    
    const vendorConfig = vendorConfigs[vendorId];
    if (!vendorConfig || !vendorConfig.googleSheets) {
      return res.status(400).json({ error: 'Google Sheets not configured for this vendor' });
    }
    
    const { sheetId } = vendorConfig.googleSheets;
    
    // Get Google Sheets client
    const sheets = await getGoogleSheetsClient(vendorConfig.googleSheets.credentials);
    
    // Update row in sheet
    const values = [
      [
        customer.name,
        customer.entryDate,
        customer.dueAmount,
        customer.dueDate,
        customer.paidDate || '',
        `=IF(E${row}="", IF(TODAY()>D${row}, "Overdue", D${row}-TODAY()), "Paid")`  // Days left formula
      ]
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!A${row}:F${row}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating customer in Google Sheet:', error);
    res.status(500).json({ error: 'Failed to update customer in Google Sheet' });
  }
});

// Set up Twilio for a vendor
app.post('/api/twilio/setup', (req, res) => {
  try {
    const { vendorId, accountSid, authToken, phoneNumber } = req.body;
    
    // Store Twilio config
    if (!vendorConfigs[vendorId]) {
      vendorConfigs[vendorId] = {};
    }
    
    vendorConfigs[vendorId].twilio = { accountSid, authToken, phoneNumber };
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting up Twilio:', error);
    res.status(500).json({ error: 'Failed to set up Twilio' });
  }
});

// Make a test call with Twilio
app.post('/api/twilio/test', async (req, res) => {
  try {
    const { vendorId, phoneNumber } = req.body;
    
    const vendorConfig = vendorConfigs[vendorId];
    if (!vendorConfig || !vendorConfig.twilio) {
      return res.status(400).json({ error: 'Twilio not configured for this vendor' });
    }
    
    const { accountSid, authToken, phoneNumber: twilioNumber } = vendorConfig.twilio;
    
    // Create Twilio client
    const client = twilio(accountSid, authToken);
    
    // Make test call
    await client.calls.create({
      twiml: '<Response><Say>This is a test call from your credit tracking system.</Say></Response>',
      to: phoneNumber,
      from: twilioNumber
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error making Twilio test call:', error);
    res.status(500).json({ error: 'Failed to make Twilio test call' });
  }
});

// Cron job to check for overdue payments and make reminder calls
cron.schedule('0 9 * * *', async () => {  // Run every day at 9 AM
  try {
    // Loop through all vendors
    for (const vendorId in vendorConfigs) {
      const vendorConfig = vendorConfigs[vendorId];
      
      // Skip if Google Sheets or Twilio not configured
      if (!vendorConfig.googleSheets || !vendorConfig.twilio) {
        continue;
      }
      
      // Get Google Sheets client
      const sheets = await getGoogleSheetsClient(vendorConfig.googleSheets.credentials);
      
      // Get all rows from sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: vendorConfig.googleSheets.sheetId,
        range: 'Sheet1!A2:F',
      });
      
      const rows = response.data.values || [];
      
      // Create Twilio client
      const { accountSid, authToken, phoneNumber: twilioNumber } = vendorConfig.twilio;
      const twilioClient = twilio(accountSid, authToken);
      
      // Check each row for overdue payments
      rows.forEach(async (row, index) => {
        const [name, entryDate, dueAmount, dueDate, paidDate, daysLeft] = row;
        
        // Skip if already paid
        if (paidDate) {
          return;
        }
        
        // Check if due date has passed
        const today = new Date();
        const due = new Date(dueDate);
        
        if (today >= due) {
          // Get customer phone number (would be stored in your database in production)
          // For this example, we'll assume it's stored somewhere else
          const customerPhone = ''; // you'd get this from your database
          
          if (customerPhone) {
            // Make reminder call
            await twilioClient.calls.create({
              twiml: `<Response><Say>Hello, this is a reminder that your payment of ${dueAmount} was due on ${dueDate}. Please make your payment as soon as possible.</Say></Response>`,
              to: customerPhone,
              from: twilioNumber
            });
            
            console.log(`Made reminder call to ${name} for payment of ${dueAmount}`);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
