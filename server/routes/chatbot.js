const express = require('express');
const OpenAI = require('openai');
const { body, validationResult } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
});

// Rate limiting for chatbot
const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many chatbot requests, please try again later.'
});

// System prompt for educational assistance
const SYSTEM_PROMPT = `You are an AI tutor assistant for students. Your role is to:
1. Help students understand concepts across various subjects
2. Provide step-by-step explanations for problems
3. Suggest study strategies and resources
4. Encourage learning and critical thinking
5. Maintain a supportive and encouraging tone

Guidelines:
- Always explain concepts clearly and simply
- Break down complex problems into manageable steps
- Encourage students to think through problems themselves
- Provide hints rather than direct answers when appropriate
- Be patient and supportive
- Focus on educational value
- If asked about non-educational topics, politely redirect to academic subjects

Remember: You're here to facilitate learning, not to do homework for students.`;

// Chat with AI assistant
router.post('/chat', chatbotLimiter, optionalAuth, [
  body('message').isLength({ min: 1, max: 1000 }).trim(),
  body('subject').optional().isString(),
  body('context').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, subject, context } = req.body;

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
      return res.json({
        response: `I'm a demo AI assistant. To enable full AI functionality, please configure your OpenAI API key in the environment variables.

For your question about "${message}", I'd suggest:
1. Breaking down the problem into smaller parts
2. Looking up relevant concepts in your textbooks
3. Asking specific questions in the Q&A section
4. Seeking help from fellow students

Would you like to post this as a question in the community forum instead?`,
        isDemo: true
      });
    }

    // Prepare conversation context
    let conversationContext = SYSTEM_PROMPT;
    
    if (subject) {
      conversationContext += `\n\nCurrent subject context: ${subject}`;
    }
    
    if (context) {
      conversationContext += `\n\nAdditional context: ${context}`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: conversationContext },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    // Log usage if user is authenticated
    if (req.user) {
      // Could implement usage tracking here
      console.log(`Chatbot used by ${req.user.anonymousId}: ${message.substring(0, 50)}...`);
    }

    res.json({
      response,
      isDemo: false,
      usage: {
        tokensUsed: completion.usage.total_tokens,
        model: "gpt-3.5-turbo"
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle different types of errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'AI service quota exceeded. Please try again later.' 
      });
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait before making another request.' 
      });
    }

    res.status(500).json({ 
      error: 'AI service temporarily unavailable. Please try again later.' 
    });
  }
});

// Get suggested questions based on subject
router.get('/suggestions/:subject', optionalAuth, async (req, res) => {
  try {
    const { subject } = req.params;
    
    const suggestions = {
      'Mathematics': [
        'How do I solve quadratic equations?',
        'What are the properties of derivatives?',
        'Explain the concept of limits',
        'How do I factor polynomials?',
        'What is the difference between permutations and combinations?'
      ],
      'Physics': [
        'What is Newton\'s second law?',
        'How do I calculate kinetic energy?',
        'Explain the concept of momentum',
        'What is the difference between velocity and acceleration?',
        'How do electric circuits work?'
      ],
      'Chemistry': [
        'What is the periodic table?',
        'How do I balance chemical equations?',
        'Explain molecular bonding',
        'What are acids and bases?',
        'How do I calculate molarity?'
      ],
      'Biology': [
        'What is photosynthesis?',
        'How does DNA replication work?',
        'Explain the cell cycle',
        'What is evolution?',
        'How do enzymes work?'
      ],
      'Computer Science': [
        'What is object-oriented programming?',
        'How do algorithms work?',
        'Explain data structures',
        'What is the difference between arrays and linked lists?',
        'How does recursion work?'
      ],
      'English': [
        'How do I write a thesis statement?',
        'What are literary devices?',
        'How do I analyze poetry?',
        'What is the difference between metaphor and simile?',
        'How do I structure an essay?'
      ],
      'History': [
        'What caused World War I?',
        'Explain the Industrial Revolution',
        'What was the Renaissance?',
        'How did democracy develop?',
        'What were the causes of the American Revolution?'
      ],
      'Other': [
        'How do I manage my study time?',
        'What are effective note-taking strategies?',
        'How do I prepare for exams?',
        'What is active learning?',
        'How do I overcome procrastination?'
      ]
    };

    res.json({
      subject,
      suggestions: suggestions[subject] || suggestions['Other']
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get study tips for a specific subject
router.get('/study-tips/:subject', optionalAuth, async (req, res) => {
  try {
    const { subject } = req.params;
    
    const studyTips = {
      'Mathematics': [
        'Practice problems regularly - math requires consistent practice',
        'Work through problems step by step',
        'Don\'t just memorize formulas - understand the concepts',
        'Use visual aids like graphs and diagrams',
        'Form study groups to discuss problem-solving strategies'
      ],
      'Physics': [
        'Connect concepts to real-world applications',
        'Draw diagrams for every problem',
        'Practice dimensional analysis',
        'Work on conceptual understanding before calculations',
        'Use online simulations to visualize concepts'
      ],
      'Chemistry': [
        'Make flashcards for chemical formulas and reactions',
        'Practice balancing equations regularly',
        'Understand the periodic table trends',
        'Connect molecular structure to properties',
        'Do lots of practice problems'
      ],
      'Biology': [
        'Create concept maps to show relationships',
        'Use mnemonics for memorization',
        'Draw and label diagrams',
        'Connect processes to their functions',
        'Study with visual aids and models'
      ],
      'Computer Science': [
        'Practice coding regularly',
        'Break down complex problems into smaller parts',
        'Learn by doing - build projects',
        'Study algorithms and data structures',
        'Join coding communities and forums'
      ],
      'English': [
        'Read widely and regularly',
        'Practice writing daily',
        'Analyze texts for themes and techniques',
        'Build your vocabulary systematically',
        'Discuss literature with others'
      ],
      'History': [
        'Create timelines for major events',
        'Understand cause and effect relationships',
        'Use maps to understand geographical context',
        'Connect past events to current issues',
        'Practice writing historical essays'
      ],
      'Other': [
        'Set specific, achievable study goals',
        'Create a consistent study schedule',
        'Find your optimal learning environment',
        'Take regular breaks to maintain focus',
        'Use active recall and spaced repetition'
      ]
    };

    res.json({
      subject,
      tips: studyTips[subject] || studyTips['Other']
    });

  } catch (error) {
    console.error('Study tips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get AI-powered explanation for a concept
router.post('/explain', chatbotLimiter, optionalAuth, [
  body('concept').isLength({ min: 1, max: 200 }).trim(),
  body('subject').optional().isString(),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { concept, subject, level = 'intermediate' } = req.body;

    // Demo response if no API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
      return res.json({
        explanation: `This is a demo explanation for "${concept}". 

To get AI-powered explanations, please configure your OpenAI API key. 

In the meantime, I recommend:
1. Searching for this concept in your textbooks
2. Looking up educational videos online
3. Asking about it in the Q&A section
4. Discussing with fellow students

Would you like to post this as a question in the community?`,
        isDemo: true
      });
    }

    const prompt = `Explain the concept of "${concept}" ${subject ? `in ${subject}` : ''} at a ${level} level. 
    
    Please provide:
    1. A clear, concise definition
    2. Key points or characteristics
    3. A simple example if applicable
    4. Why this concept is important
    
    Keep the explanation appropriate for a ${level} student.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.7
    });

    const explanation = completion.choices[0].message.content;

    res.json({
      concept,
      subject,
      level,
      explanation,
      isDemo: false
    });

  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

module.exports = router;