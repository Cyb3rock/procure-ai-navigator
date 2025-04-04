
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RFP = require('../models/RFP');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Create a new RFP - Vendor only
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Extract RFP data from request body
    const { rfpTitle, description, amount, submissionDeadline, status = 'Draft' } = req.body;
    
    // Create new RFP with vendor ID from auth middleware
    const newRFP = new RFP({
      rfpTitle,
      description,
      amount,
      submissionDeadline,
      status,
      vendorId: req.user.id
    });
    
    // Save the RFP
    const savedRFP = await newRFP.save();
    
    res.status(201).json({
      success: true,
      rfp: savedRFP
    });
  } catch (error) {
    console.error('Error creating RFP:', error);
    res.status(500).json({ 
      error: 'Failed to create RFP',
      details: error.message 
    });
  }
});

// Get all RFPs - Admin only
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { 
      vendor, status, 
      minAmount, maxAmount,
      startDate, endDate,
      page = 1, limit = 10,
      sortBy = 'createdAt', sortOrder = 'desc',
      search
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add filters if provided
    if (vendor) filter.vendorId = vendor;
    if (status) filter.status = status;
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }
    if (startDate || endDate) {
      filter.submissionDeadline = {};
      if (startDate) filter.submissionDeadline.$gte = new Date(startDate);
      if (endDate) filter.submissionDeadline.$lte = new Date(endDate);
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { rfpTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: 'vendorId', // Populate vendor details
    };
    
    // Get total count (for pagination)
    const total = await RFP.countDocuments(filter);
    
    // Get RFPs with pagination and filtering
    const rfps = await RFP.find(filter)
      .populate('vendorId', 'name email')
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    res.json({
      success: true,
      rfps,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    console.error('Error getting RFPs:', error);
    res.status(500).json({ 
      error: 'Failed to get RFPs',
      details: error.message 
    });
  }
});

// Get RFPs by vendor ID - Vendor can get own RFPs, admin can get any vendor's RFPs
router.get('/vendor/:vendorId', authMiddleware, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { 
      status,
      minAmount, maxAmount,
      startDate, endDate,
      page = 1, limit = 10,
      sortBy = 'createdAt', sortOrder = 'desc',
      search
    } = req.query;
    
    // Verify permissions - vendor can only view their own RFPs
    if (req.user.role !== 'admin' && req.user.id !== vendorId) {
      return res.status(403).json({ error: 'Not authorized to view these RFPs' });
    }
    
    // Build filter object
    const filter = { vendorId };
    
    // Add filters if provided
    if (status) filter.status = status;
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }
    if (startDate || endDate) {
      filter.submissionDeadline = {};
      if (startDate) filter.submissionDeadline.$gte = new Date(startDate);
      if (endDate) filter.submissionDeadline.$lte = new Date(endDate);
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { rfpTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };
    
    // Get total count (for pagination)
    const total = await RFP.countDocuments(filter);
    
    // Get RFPs with pagination and filtering
    const rfps = await RFP.find(filter)
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    res.json({
      success: true,
      rfps,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    console.error('Error getting vendor RFPs:', error);
    res.status(500).json({ 
      error: 'Failed to get vendor RFPs',
      details: error.message 
    });
  }
});

// Get a single RFP by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid RFP ID' });
    }
    
    const rfp = await RFP.findById(id).populate('vendorId', 'name email');
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    // Verify permissions - vendors can only view their own RFPs
    if (req.user.role !== 'admin' && req.user.id !== rfp.vendorId.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this RFP' });
    }
    
    res.json({
      success: true,
      rfp
    });
  } catch (error) {
    console.error('Error getting RFP:', error);
    res.status(500).json({ 
      error: 'Failed to get RFP',
      details: error.message 
    });
  }
});

// Update an RFP
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid RFP ID' });
    }
    
    // Find the RFP
    const rfp = await RFP.findById(id);
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    // Verify permissions - vendors can only update their own RFPs
    if (req.user.role !== 'admin' && req.user.id !== rfp.vendorId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this RFP' });
    }
    
    // Handle status change history
    if (updates.status && updates.status !== rfp.status) {
      rfp.statusHistory.push({
        status: updates.status,
        changedAt: new Date(),
        changedBy: req.user.id
      });
    }
    
    // Add comment if provided
    if (updates.comment) {
      rfp.comments.push({
        text: updates.comment,
        author: req.user.id,
        createdAt: new Date()
      });
      delete updates.comment; // Remove from updates object
    }
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (key !== 'vendorId' && key !== '_id' && key !== 'createdAt') {
        rfp[key] = updates[key];
      }
    });
    
    // Save the updated RFP
    const updatedRFP = await rfp.save();
    
    res.json({
      success: true,
      rfp: updatedRFP
    });
  } catch (error) {
    console.error('Error updating RFP:', error);
    res.status(500).json({ 
      error: 'Failed to update RFP',
      details: error.message 
    });
  }
});

// Delete an RFP
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid RFP ID' });
    }
    
    // Find the RFP
    const rfp = await RFP.findById(id);
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    // Verify permissions - vendors can only delete their own RFPs
    if (req.user.role !== 'admin' && req.user.id !== rfp.vendorId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this RFP' });
    }
    
    // Delete the RFP
    await RFP.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'RFP deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting RFP:', error);
    res.status(500).json({ 
      error: 'Failed to delete RFP',
      details: error.message 
    });
  }
});

// Get RFP analytics - Admin can see all, vendors can see only their own
router.get('/analytics/summary', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendorId: req.user.id };
    
    // Get total counts by status
    const statusCounts = await RFP.aggregate([
      { $match: filter },
      { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        } 
      }
    ]);
    
    // Get total RFPs
    const totalRFPs = await RFP.countDocuments(filter);
    
    // Get average amount
    const avgResult = await RFP.aggregate([
      { $match: filter },
      { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
    ]);
    const avgAmount = avgResult.length > 0 ? avgResult[0].avgAmount : 0;
    
    // If admin, get vendor stats
    let vendorStats = [];
    if (req.user.role === 'admin') {
      vendorStats = await RFP.aggregate([
        { $group: { 
            _id: '$vendorId', 
            totalRFPs: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            awardedCount: { 
              $sum: { $cond: [{ $eq: ['$status', 'Awarded'] }, 1, 0] } 
            }
          } 
        },
        { $lookup: { 
            from: 'users', 
            localField: '_id', 
            foreignField: '_id', 
            as: 'vendor' 
          } 
        },
        { $unwind: '$vendor' },
        { $project: { 
            vendorId: '$_id',
            vendorName: '$vendor.name',
            vendorEmail: '$vendor.email',
            totalRFPs: 1,
            totalAmount: 1,
            awardedCount: 1,
            winRate: { 
              $cond: [
                { $eq: ['$totalRFPs', 0] }, 
                0, 
                { $multiply: [{ $divide: ['$awardedCount', '$totalRFPs'] }, 100] }
              ]
            }
          } 
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 }
      ]);
    }
    
    // Get monthly trend (RFPs submitted per month for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await RFP.aggregate([
      { 
        $match: { 
          ...filter,
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      { 
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        total: totalRFPs,
        avgAmount,
        byStatus: statusCounts,
        monthlyTrend,
        ...(req.user.role === 'admin' && { topVendors: vendorStats })
      }
    });
  } catch (error) {
    console.error('Error generating RFP analytics:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics',
      details: error.message 
    });
  }
});

// Add middleware and route for RFP analytics
router.get('/analytics/vendor-performance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vendorPerformance = await RFP.aggregate([
      { 
        $group: {
          _id: '$vendorId',
          totalRFPs: { $sum: 1 },
          totalValue: { $sum: '$amount' },
          awarded: { 
            $sum: { $cond: [{ $eq: ['$status', 'Awarded'] }, 1, 0] } 
          },
          rejected: { 
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } 
          }
        } 
      },
      { 
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $project: {
          vendorId: '$_id',
          name: '$vendor.name',
          email: '$vendor.email',
          totalRFPs: 1,
          totalValue: 1,
          awarded: 1,
          rejected: 1,
          winRate: { 
            $multiply: [
              { $divide: [
                '$awarded',
                { $cond: [{ $eq: ['$totalRFPs', 0] }, 1, '$totalRFPs'] }
              ] },
              100
            ]
          }
        }
      },
      { $sort: { winRate: -1 } }
    ]);
    
    res.json({
      success: true,
      vendorPerformance
    });
  } catch (error) {
    console.error('Error generating vendor performance analytics:', error);
    res.status(500).json({ 
      error: 'Failed to generate vendor performance analytics',
      details: error.message 
    });
  }
});

module.exports = router;
