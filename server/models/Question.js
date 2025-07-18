const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
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
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    filename: String,
    path: String,
    description: String
  }],
  answers: [{
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    images: [{
      filename: String,
      path: String,
      description: String
    }],
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isAccepted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  bounty: {
    amount: {
      type: Number,
      default: 0
    },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  category: {
    type: String,
    enum: ['Homework Help', 'Concept Clarification', 'Problem Solving', 'Study Tips', 'Exam Preparation', 'Other'],
    default: 'Other'
  }
}, {
  timestamps: true
});

// Index for search optimization
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);