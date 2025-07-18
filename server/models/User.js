const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    unique: true,
    default: () => `student_${crypto.randomBytes(8).toString('hex')}`
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    default: () => `Anonymous Student ${Math.floor(Math.random() * 10000)}`
  },
  avatar: {
    type: String,
    default: () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${uuidv4()}`
  },
  reputation: {
    type: Number,
    default: 0
  },
  subjects: [{
    type: String,
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
           'English', 'History', 'Geography', 'Economics', 'Psychology', 
           'Engineering', 'Medicine', 'Law', 'Business', 'Art', 'Other']
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    transactions: [{
      type: {
        type: String,
        enum: ['purchase', 'sale', 'withdrawal', 'deposit']
      },
      amount: Number,
      description: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function() {
  return {
    anonymousId: this.anonymousId,
    displayName: this.displayName,
    avatar: this.avatar,
    reputation: this.reputation,
    subjects: this.subjects,
    isVerified: this.isVerified
  };
};

module.exports = mongoose.model('User', userSchema);