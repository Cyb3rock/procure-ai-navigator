
// This file represents what would be in your Node.js backend

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const twilio = require('twilio');
const cron = require('node-cron');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your_jwt_secret_key';

// Store vendor configurations in memory (would use MongoDB in production)
const vendorConfigs = {
  // vendorId: {
  //   googleSheets: { sheetId, credentials },
  //   twilio: { accountSid, authToken, phoneNumber, defaultLanguage }
  // }
};

// MongoDB connection (commented out for now)
// mongoose.connect('mongodb://localhost:27017/procurement-platform', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// User Schema and Model (would use MongoDB in production)
const users = [];

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
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

// User registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, role = 'vendor' } = req.body;
    
    // Check if user already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Create JWT token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, user: { id: newUser.id, name, email, role } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add customer to Google Sheet
app.post('/api/customer', authMiddleware, async (req, res) => {
  try {
    const { vendorId, customer } = req.body;
    
    // Check if vendor ID matches authenticated user
    if (req.user.id !== vendorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
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
        `=IF(E2="", IF(TODAY()>D2, "Overdue", D2-TODAY()), "Paid")`,  // Days left formula
        customer.preferredLanguage || vendorConfig.twilio?.defaultLanguage || 'english'  // Include language preference
      ]
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:G',  // Updated range to include language column
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
app.put('/api/customer/:customerId', authMiddleware, async (req, res) => {
  try {
    const { vendorId, customer, row } = req.body;
    
    // Check if vendor ID matches authenticated user
    if (req.user.id !== vendorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
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
        `=IF(E${row}="", IF(TODAY()>D${row}, "Overdue", D${row}-TODAY()), "Paid")`,  // Days left formula
        customer.preferredLanguage || vendorConfig.twilio?.defaultLanguage || 'english'  // Include language preference
      ]
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!A${row}:G${row}`,  // Updated range to include language column
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
app.post('/api/twilio/setup', authMiddleware, (req, res) => {
  try {
    const { vendorId, accountSid, authToken, phoneNumber, reminderMessage, defaultLanguage } = req.body;
    
    // Check if vendor ID matches authenticated user
    if (req.user.id !== vendorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Store Twilio config
    if (!vendorConfigs[vendorId]) {
      vendorConfigs[vendorId] = {};
    }
    
    vendorConfigs[vendorId].twilio = { 
      accountSid, 
      authToken, 
      phoneNumber, 
      reminderMessage,
      defaultLanguage 
    };
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting up Twilio:', error);
    res.status(500).json({ error: 'Failed to set up Twilio' });
  }
});

// Make a test call with Twilio
app.post('/api/twilio/test', authMiddleware, async (req, res) => {
  try {
    const { vendorId, phoneNumber, language } = req.body;
    
    // Check if vendor ID matches authenticated user
    if (req.user.id !== vendorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const vendorConfig = vendorConfigs[vendorId];
    if (!vendorConfig || !vendorConfig.twilio) {
      return res.status(400).json({ error: 'Twilio not configured for this vendor' });
    }
    
    const { accountSid, authToken, phoneNumber: twilioNumber } = vendorConfig.twilio;
    
    // Create Twilio client
    const client = twilio(accountSid, authToken);
    
    // Get message based on language
    const message = getLocalizedMessage(language || vendorConfig.twilio.defaultLanguage || 'english', {
      amount: '1000',
      dueDate: '2023-05-01',
      customerName: 'Test Customer'
    });
    
    // Make test call
    await client.calls.create({
      twiml: `<Response><Say language="${getLanguageCode(language || vendorConfig.twilio.defaultLanguage)}">${message}</Say></Response>`,
      to: phoneNumber,
      from: twilioNumber
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error making Twilio test call:', error);
    res.status(500).json({ error: 'Failed to make Twilio test call' });
  }
});

// Helper function to get localized message
function getLocalizedMessage(language, data) {
  const { amount, dueDate, customerName } = data;
  
  const messages = {
    english: `Hello ${customerName}, this is a reminder that your payment of ${amount} is due on ${dueDate}. Please contact us to make a payment.`,
    hindi: `नमस्ते ${customerName}, यह याद दिलाने के लिए है कि आपका ${amount} का भुगतान ${dueDate} को देय है। कृपया भुगतान करने के लिए हमसे संपर्क करें।`,
    gujarati: `નમસ્તે ${customerName}, આ યાદ અપાવવા માટે છે કે તમારી ${amount} ની ચુકવણી ${dueDate} ના રોજ બાકી છે. કૃપા કરીને ચુકવણી કરવા માટે અમારો સંપર્ક કરો.`,
    marathi: `नमस्कार ${customerName}, ही आठवण आहे की तुमचे ${amount} चे देय ${dueDate} रोजी देय आहे. कृपया पेमेंट करण्यासाठी आमच्याशी संपर्क साधा.`
  };
  
  return messages[language] || messages.english;
}

// Helper function to get language code for Twilio
function getLanguageCode(language) {
  const languageCodes = {
    english: 'en-US',
    hindi: 'hi-IN',
    gujarati: 'gu-IN',
    marathi: 'mr-IN'
  };
  
  return languageCodes[language] || languageCodes.english;
}

// RFP Routes
app.post('/api/rfps', authMiddleware, async (req, res) => {
  try {
    const { title, value, deadline } = req.body;
    
    const newRFP = {
      id: Date.now().toString(),
      title,
      value,
      deadline,
      status: 'draft',
      vendorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, save to database
    res.json({ success: true, rfp: newRFP });
  } catch (error) {
    console.error('Error creating RFP:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Contract Routes
app.post('/api/contracts', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    const { title, startDate, endDate, milestones, relatedRfpId } = req.body;
    
    const newContract = {
      id: Date.now().toString(),
      title,
      vendorId: req.user.id,
      startDate,
      endDate,
      status: 'active',
      milestones: JSON.parse(milestones),
      documentUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      relatedRfpId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, save to database
    res.json({ success: true, contract: newContract });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Purchase Order Routes
app.post('/api/purchase-orders', authMiddleware, async (req, res) => {
  try {
    const { customerName, paidAmount, paymentDate, relatedContractId, relatedRfpId, notes } = req.body;
    
    const newPO = {
      id: Date.now().toString(),
      customerName,
      paidAmount,
      paymentDate,
      relatedContractId,
      relatedRfpId,
      notes,
      vendorId: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    // In a real app, save to database
    res.json({ success: true, purchaseOrder: newPO });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Settings Routes
app.put('/api/admin/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { siteTitle, logoUrl, supportEmail, enableVoiceReminders, paymentGatewayKeys } = req.body;
    
    // In a real app, save to database
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Notification Routes
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    // In a real app, get notifications from database
    const notifications = [];
    
    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    // In a real app, update notification in database
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Server error' });
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
        range: 'Sheet1!A2:G',  // Updated range to include language column
      });
      
      const rows = response.data.values || [];
      
      // Create Twilio client
      const { accountSid, authToken, phoneNumber: twilioNumber } = vendorConfig.twilio;
      const twilioClient = twilio(accountSid, authToken);
      
      // Check each row for overdue payments
      rows.forEach(async (row, index) => {
        const [name, entryDate, dueAmount, dueDate, paidDate, daysLeft, language] = row;
        
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
            // Get message based on language
            const message = getLocalizedMessage(language || vendorConfig.twilio.defaultLanguage || 'english', {
              amount: dueAmount,
              dueDate,
              customerName: name
            });
            
            // Make reminder call
            await twilioClient.calls.create({
              twiml: `<Response><Say language="${getLanguageCode(language || vendorConfig.twilio.defaultLanguage)}">${message}</Say></Response>`,
              to: customerPhone,
              from: twilioNumber
            });
            
            console.log(`Made reminder call to ${name} for payment of ${dueAmount}`);
            
            // In a real app, create notification in database
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
