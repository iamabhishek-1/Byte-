const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const encryptionUtil = require('../utils/encryption');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/notes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get all notes with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      subject,
      difficulty,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const notes = await Note.find(query)
      .populate('seller', 'anonymousId displayName avatar reputation')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Notes fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single note by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('seller', 'anonymousId displayName avatar reputation')
      .populate('reviews.user', 'anonymousId displayName avatar');

    if (!note || !note.isActive) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Note fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload new note
router.post('/', auth, upload.single('file'), [
  body('title').isLength({ min: 1, max: 100 }).trim(),
  body('description').isLength({ min: 1, max: 1000 }).trim(),
  body('subject').isIn(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
                       'English', 'History', 'Geography', 'Economics', 'Psychology', 
                       'Engineering', 'Medicine', 'Law', 'Business', 'Art', 'Other']),
  body('price').isNumeric().custom(value => value >= 0),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const { title, description, subject, price, tags, difficulty, pages, language } = req.body;

    // Create note
    const note = new Note({
      title,
      description,
      subject,
      price: parseFloat(price),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty: difficulty || 'Intermediate',
      pages: pages || 1,
      language: language || 'English',
      seller: req.user._id,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size
    });

    await note.save();

    const populatedNote = await Note.findById(note._id)
      .populate('seller', 'anonymousId displayName avatar reputation');

    res.status(201).json({
      message: 'Note uploaded successfully',
      note: populatedNote
    });
  } catch (error) {
    console.error('Note upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Purchase note
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('seller');
    
    if (!note || !note.isActive) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot purchase your own note' });
    }

    if (req.user.wallet.balance < note.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Process transaction
    const buyer = req.user;
    const seller = note.seller;

    // Deduct from buyer
    buyer.wallet.balance -= note.price;
    buyer.wallet.transactions.push({
      type: 'purchase',
      amount: -note.price,
      description: `Purchased: ${note.title}`
    });

    // Add to seller (minus platform fee)
    const platformFee = note.price * 0.05; // 5% platform fee
    const sellerAmount = note.price - platformFee;
    
    seller.wallet.balance += sellerAmount;
    seller.wallet.transactions.push({
      type: 'sale',
      amount: sellerAmount,
      description: `Sold: ${note.title}`
    });

    // Update note downloads
    note.downloads += 1;

    // Save all changes
    await Promise.all([
      buyer.save(),
      seller.save(),
      note.save()
    ]);

    res.json({
      message: 'Note purchased successfully',
      downloadUrl: `/api/notes/${note._id}/download`,
      transaction: {
        amount: note.price,
        platformFee,
        sellerAmount
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download purchased note
router.get('/:id/download', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note || !note.isActive) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user has purchased this note or is the seller
    const hasPurchased = req.user.wallet.transactions.some(
      transaction => transaction.description.includes(note.title) && transaction.type === 'purchase'
    );

    if (!hasPurchased && note.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. Purchase required.' });
    }

    const filePath = path.resolve(note.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, note.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review to note
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user has purchased this note
    const hasPurchased = req.user.wallet.transactions.some(
      transaction => transaction.description.includes(note.title) && transaction.type === 'purchase'
    );

    if (!hasPurchased && note.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Purchase required to review' });
    }

    // Check if user already reviewed
    const existingReview = note.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ error: 'Already reviewed this note' });
    }

    // Add review
    note.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = note.reviews.reduce((sum, review) => sum + review.rating, 0);
    note.rating.average = totalRating / note.reviews.length;
    note.rating.count = note.reviews.length;

    await note.save();

    const populatedNote = await Note.findById(note._id)
      .populate('reviews.user', 'anonymousId displayName avatar');

    res.json({
      message: 'Review added successfully',
      note: populatedNote
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's notes
router.get('/user/my-notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('User notes fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note
router.put('/:id', auth, [
  body('title').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ min: 1, max: 1000 }).trim(),
  body('price').optional().isNumeric().custom(value => value >= 0),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, price, tags, isActive } = req.body;
    
    if (title) note.title = title;
    if (description) note.description = description;
    if (price !== undefined) note.price = parseFloat(price);
    if (tags) note.tags = tags.split(',').map(tag => tag.trim());
    if (isActive !== undefined) note.isActive = isActive;

    await note.save();

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Note update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete
    note.isActive = false;
    await note.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Note deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;