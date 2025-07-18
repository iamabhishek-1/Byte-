const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const sharp = require('sharp');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/questions');
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
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all questions with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      difficulty,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      resolved
    } = req.query;

    // Build query
    const query = {};
    
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (resolved !== undefined) query.isResolved = resolved === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'popularity') {
      sortOptions.upvotes = -1;
    } else if (sortBy === 'views') {
      sortOptions.views = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const questions = await Question.find(query)
      .populate('author', 'anonymousId displayName avatar reputation')
      .populate('answers.author', 'anonymousId displayName avatar reputation')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Questions fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single question by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'anonymousId displayName avatar reputation')
      .populate('answers.author', 'anonymousId displayName avatar reputation')
      .populate('upvotes', 'anonymousId displayName')
      .populate('downvotes', 'anonymousId displayName');

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    console.error('Question fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new question
router.post('/', auth, upload.array('images', 5), [
  body('title').isLength({ min: 1, max: 200 }).trim(),
  body('content').isLength({ min: 1, max: 5000 }).trim(),
  body('subject').isIn(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
                       'English', 'History', 'Geography', 'Economics', 'Psychology', 
                       'Engineering', 'Medicine', 'Law', 'Business', 'Art', 'Other']),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('category').optional().isIn(['Homework Help', 'Concept Clarification', 'Problem Solving', 'Study Tips', 'Exam Preparation', 'Other']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, subject, tags, difficulty, category } = req.body;

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Optimize image
        const optimizedPath = file.path.replace(path.extname(file.path), '_optimized.jpg');
        await sharp(file.path)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        // Remove original file
        fs.unlinkSync(file.path);

        images.push({
          filename: file.filename,
          path: optimizedPath,
          description: `Image for ${title}`
        });
      }
    }

    // Create question
    const question = new Question({
      title,
      content,
      subject,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty: difficulty || 'Intermediate',
      category: category || 'Other',
      author: req.user._id,
      images
    });

    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'anonymousId displayName avatar reputation');

    res.status(201).json({
      message: 'Question created successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Question creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add answer to question
router.post('/:id/answer', auth, upload.array('images', 3), [
  body('content').isLength({ min: 1, max: 3000 }).trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Optimize image
        const optimizedPath = file.path.replace(path.extname(file.path), '_optimized.jpg');
        await sharp(file.path)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        // Remove original file
        fs.unlinkSync(file.path);

        images.push({
          filename: file.filename,
          path: optimizedPath,
          description: `Answer image`
        });
      }
    }

    // Add answer
    question.answers.push({
      content,
      author: req.user._id,
      images
    });

    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'anonymousId displayName avatar reputation')
      .populate('answers.author', 'anonymousId displayName avatar reputation');

    res.json({
      message: 'Answer added successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Answer creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on question
router.post('/:id/vote', auth, [
  body('type').isIn(['upvote', 'downvote'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const userId = req.user._id;

    // Remove existing votes
    question.upvotes = question.upvotes.filter(id => !id.equals(userId));
    question.downvotes = question.downvotes.filter(id => !id.equals(userId));

    // Add new vote
    if (type === 'upvote') {
      question.upvotes.push(userId);
    } else {
      question.downvotes.push(userId);
    }

    await question.save();

    res.json({
      message: `${type} recorded successfully`,
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on answer
router.post('/:id/answer/:answerId/vote', auth, [
  body('type').isIn(['upvote', 'downvote'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const userId = req.user._id;

    // Remove existing votes
    answer.upvotes = answer.upvotes.filter(id => !id.equals(userId));
    answer.downvotes = answer.downvotes.filter(id => !id.equals(userId));

    // Add new vote
    if (type === 'upvote') {
      answer.upvotes.push(userId);
    } else {
      answer.downvotes.push(userId);
    }

    await question.save();

    res.json({
      message: `${type} recorded successfully`,
      upvotes: answer.upvotes.length,
      downvotes: answer.downvotes.length
    });
  } catch (error) {
    console.error('Answer vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept answer
router.post('/:id/answer/:answerId/accept', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only question author can accept answers' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Remove accepted status from all answers
    question.answers.forEach(ans => ans.isAccepted = false);

    // Accept this answer
    answer.isAccepted = true;
    question.isResolved = true;

    await question.save();

    res.json({
      message: 'Answer accepted successfully',
      question
    });
  } catch (error) {
    console.error('Answer acceptance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's questions
router.get('/user/my-questions', auth, async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user._id })
      .populate('author', 'anonymousId displayName avatar reputation')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    console.error('User questions fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update question
router.put('/:id', auth, [
  body('title').optional().isLength({ min: 1, max: 200 }).trim(),
  body('content').optional().isLength({ min: 1, max: 5000 }).trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, content, tags } = req.body;
    
    if (title) question.title = title;
    if (content) question.content = content;
    if (tags) question.tags = tags.split(',').map(tag => tag.trim());

    await question.save();

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Question update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Question deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get image
router.get('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/questions', filename);
    
    if (fs.existsSync(imagePath)) {
      res.sendFile(path.resolve(imagePath));
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Image fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;