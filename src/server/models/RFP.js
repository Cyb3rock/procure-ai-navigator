
const mongoose = require('mongoose');

const rfpSchema = new mongoose.Schema({
  rfpTitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  submissionDeadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Awarded', 'Rejected'],
    default: 'Draft'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Awarded', 'Rejected']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days remaining until submission deadline
rfpSchema.virtual('daysRemaining').get(function() {
  if (!this.submissionDeadline) return null;
  
  const today = new Date();
  const deadline = new Date(this.submissionDeadline);
  const timeDiff = deadline.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff > 0 ? daysDiff : 0;
});

// Pre-save hook to track status changes
rfpSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.vendorId
    });
  } else if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.vendorId // Ideally, this should be the current user making the change
    });
  }
  next();
});

const RFP = mongoose.model('RFP', rfpSchema);

module.exports = RFP;
