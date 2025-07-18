const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
           'English', 'History', 'Geography', 'Economics', 'Psychology', 
           'Engineering', 'Medicine', 'Law', 'Business', 'Art', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  thumbnail: {
    type: String
  },
  preview: {
    type: String // Base64 encoded preview of first page
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  pages: {
    type: Number,
    default: 1
  },
  language: {
    type: String,
    default: 'English'
  }
}, {
  timestamps: true
});

// Index for search optimization
noteSchema.index({ title: 'text', description: 'text', tags: 'text' });
noteSchema.index({ subject: 1, price: 1 });
noteSchema.index({ seller: 1 });

module.exports = mongoose.model('Note', noteSchema);