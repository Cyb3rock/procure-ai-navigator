
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const RFP = require('../models/RFP');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Helper function to format currency
const formatCurrency = (amount) => {
  return parseFloat(amount.toFixed(2));
};

/**
 * @route   GET /analytics/admin/overview
 * @desc    Get admin dashboard overview stats
 * @access  Private (Admin only)
 */
router.get('/admin/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get total procurement value (sum of all awarded RFPs)
    const totalProcurementValue = await RFP.aggregate([
      { $match: { status: 'Awarded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get RFP status summary
    const rfpStatusSummary = await RFP.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Get vendor count
    const vendorCount = await User.countDocuments({ role: 'vendor' });

    // Get recent RFPs (last 5)
    const recentRFPs = await RFP.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendorId', 'name email')
      .select('rfpTitle amount status submissionDeadline createdAt');

    res.json({
      success: true,
      data: {
        totalProcurementValue: totalProcurementValue.length > 0 
          ? formatCurrency(totalProcurementValue[0].total) 
          : 0,
        rfpStatusSummary: rfpStatusSummary.reduce((acc, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        }, { Draft: 0, Submitted: 0, Awarded: 0, Rejected: 0 }),
        vendorCount,
        recentRFPs
      }
    });
  } catch (error) {
    console.error('Error getting admin overview:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /analytics/spending/monthly
 * @desc    Get monthly procurement spending
 * @access  Private (Admin only)
 */
router.get('/spending/monthly', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    const monthlySpending = await RFP.aggregate([
      { 
        $match: { 
          status: 'Awarded',
          $expr: { $eq: [{ $year: '$updatedAt' }, year] }
        } 
      },
      { 
        $group: { 
          _id: { $month: '$updatedAt' }, 
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { 
        $project: { 
          month: '$_id', 
          total: 1, 
          count: 1,
          _id: 0 
        } 
      },
      { $sort: { month: 1 } }
    ]);

    // Format for chart.js or other visualization libraries
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formattedData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlySpending.find(item => item.month === i + 1) || { total: 0, count: 0 };
      return {
        month: months[i],
        shortMonth: months[i].substring(0, 3),
        value: formatCurrency(monthData.total),
        count: monthData.count
      };
    });

    res.json({
      success: true,
      data: {
        year,
        monthlySpending: formattedData,
        totalSpend: formatCurrency(formattedData.reduce((sum, month) => sum + month.value, 0)),
        totalCount: formattedData.reduce((sum, month) => sum + month.count, 0)
      }
    });
  } catch (error) {
    console.error('Error getting monthly spending:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /analytics/top-vendors
 * @desc    Get top performing vendors
 * @access  Private (Admin only)
 */
router.get('/top-vendors', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const metric = req.query.metric === 'count' ? 'count' : 'value';
    
    const topVendors = await RFP.aggregate([
      { $match: { status: 'Awarded' } },
      { 
        $group: { 
          _id: '$vendorId', 
          totalValue: { $sum: '$amount' },
          count: { $sum: 1 },
          rfps: { $push: { id: '$_id', title: '$rfpTitle', amount: '$amount' } }
        } 
      },
      { $sort: metric === 'count' ? { count: -1 } : { totalValue: -1 } },
      { $limit: limit },
      { 
        $lookup: { 
          from: 'users',  // Make sure this matches your MongoDB collection name
          localField: '_id',
          foreignField: '_id',
          as: 'vendorInfo' 
        } 
      },
      { 
        $project: { 
          vendorId: '$_id',
          vendor: { $arrayElemAt: ['$vendorInfo', 0] },
          totalValue: 1,
          count: 1,
          rfps: { $slice: ['$rfps', 3] }, // Include just recent 3 RFPs
          _id: 0 
        } 
      },
      {
        $project: {
          'vendor.password': 0, // Remove sensitive information
          'vendor.__v': 0
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        metric,
        topVendors: topVendors.map(v => ({
          id: v.vendorId,
          name: v.vendor?.name || 'Unknown Vendor',
          email: v.vendor?.email,
          totalValue: formatCurrency(v.totalValue),
          count: v.count,
          recentRFPs: v.rfps
        }))
      }
    });
  } catch (error) {
    console.error('Error getting top vendors:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /analytics/rfp-status
 * @desc    Get RFP status summary
 * @access  Private (Admin only)
 */
router.get('/rfp-status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get detailed RFP status breakdown
    const rfpStatusDetails = await RFP.aggregate([
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalValue: { $sum: '$amount' }
        } 
      },
      { 
        $project: { 
          status: '$_id', 
          count: 1, 
          totalValue: 1,
          _id: 0 
        } 
      },
      { $sort: { totalValue: -1 } }
    ]);
    
    // Total RFPs and their value
    const totalStats = await RFP.aggregate([
      { 
        $group: { 
          _id: null, 
          totalCount: { $sum: 1 },
          totalValue: { $sum: '$amount' }
        } 
      }
    ]);
    
    // Format data for pie chart
    const formattedData = {
      labels: rfpStatusDetails.map(item => item.status),
      counts: rfpStatusDetails.map(item => item.count),
      values: rfpStatusDetails.map(item => formatCurrency(item.totalValue)),
      details: rfpStatusDetails.map(item => ({
        status: item.status,
        count: item.count,
        value: formatCurrency(item.totalValue),
        percentageByCount: totalStats.length > 0 
          ? ((item.count / totalStats[0].totalCount) * 100).toFixed(1) 
          : 0,
        percentageByValue: totalStats.length > 0 
          ? ((item.totalValue / totalStats[0].totalValue) * 100).toFixed(1) 
          : 0
      }))
    };

    res.json({
      success: true,
      data: {
        summary: rfpStatusDetails.reduce((acc, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        }, { Draft: 0, Submitted: 0, Awarded: 0, Rejected: 0 }),
        chartData: formattedData,
        totalStats: totalStats.length > 0 ? {
          totalCount: totalStats[0].totalCount,
          totalValue: formatCurrency(totalStats[0].totalValue)
        } : { totalCount: 0, totalValue: 0 }
      }
    });
  } catch (error) {
    console.error('Error getting RFP status summary:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /analytics/vendor/:id
 * @desc    Get vendor-specific analytics
 * @access  Private (Admin or specific vendor)
 */
router.get('/vendor/:id', authMiddleware, async (req, res) => {
  try {
    const vendorId = req.params.id;
    
    // Check if the user is authorized (admin or the vendor themselves)
    if (req.user.role !== 'admin' && req.user.id !== vendorId) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this data' });
    }
    
    // Get vendor's RFP summary
    const rfpSummary = await RFP.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalValue: { $sum: '$amount' }
        } 
      },
      { $project: { status: '$_id', count: 1, totalValue: 1, _id: 0 } }
    ]);
    
    // Calculate success rate
    const submittedCount = rfpSummary.find(s => s.status === 'Submitted')?.count || 0;
    const awardedCount = rfpSummary.find(s => s.status === 'Awarded')?.count || 0;
    const totalSubmitted = submittedCount + awardedCount;
    const successRate = totalSubmitted > 0 ? (awardedCount / totalSubmitted * 100).toFixed(1) : 0;
    
    // Calculate total earnings
    const totalEarnings = rfpSummary.find(s => s.status === 'Awarded')?.totalValue || 0;
    
    // Get recent RFPs
    const recentRFPs = await RFP.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('rfpTitle amount status submissionDeadline createdAt');

    res.json({
      success: true,
      data: {
        rfpCounts: rfpSummary.reduce((acc, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        }, { Draft: 0, Submitted: 0, Awarded: 0, Rejected: 0 }),
        performance: {
          totalSubmitted,
          totalAwarded: awardedCount,
          successRate: parseFloat(successRate),
          totalEarnings: formatCurrency(totalEarnings)
        },
        recentRFPs,
        chartData: {
          labels: rfpSummary.map(item => item.status),
          counts: rfpSummary.map(item => item.count),
          values: rfpSummary.map(item => formatCurrency(item.totalValue))
        }
      }
    });
  } catch (error) {
    console.error('Error getting vendor analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /analytics/due-payments
 * @desc    Get payment summary
 * @access  Private (Admin only)
 */
router.get('/due-payments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Since we don't have a proper Contract or PurchaseOrder model yet,
    // this is a placeholder that would need to be implemented when those models exist
    res.json({
      success: true,
      data: {
        message: "Payment analytics functionality to be implemented when Contract and PurchaseOrder models are available",
        mockData: {
          totalDue: 350000,
          totalPaid: 275000,
          outstandingAmount: 75000,
          percentagePaid: 78.6,
          byVendor: [
            { vendorId: "1", vendorName: "Acme Corp", due: 50000, paid: 35000 },
            { vendorId: "2", vendorName: "TechSolutions Inc", due: 75000, paid: 75000 },
            { vendorId: "3", vendorName: "Global Services Ltd", due: 125000, paid: 95000 },
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error getting payment summary:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
