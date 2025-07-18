# StudyShare - Anonymous Student Exchange Platform

A beautiful, full-stack web application for students to sell PDF notes and exchange questions while maintaining complete anonymity with end-to-end encryption.

## 🌟 Features

### 📚 PDF Notes Marketplace
- **Buy & Sell Notes**: Students can upload and sell their study notes as PDFs
- **Secure Transactions**: Built-in wallet system with transaction history
- **Preview System**: Preview notes before purchasing
- **Rating & Reviews**: Rate and review purchased notes
- **Subject Categorization**: Organize notes by academic subjects

### 💬 Free Question Exchange
- **Ask Questions**: Post questions with image support for diagrams
- **Community Answers**: Get answers from fellow students
- **Voting System**: Upvote/downvote questions and answers
- **Accept Answers**: Mark the best answer to resolve questions
- **Image Support**: Upload diagrams and images to enhance questions

### 🔒 Complete Anonymity & Security
- **Anonymous Accounts**: Generated anonymous IDs instead of real names
- **End-to-End Encryption**: All sensitive data is encrypted
- **Privacy First**: No personal information required beyond email
- **Secure Authentication**: JWT-based authentication system

### 🤖 AI Assistant (Demo Mode)
- **Educational Support**: AI tutor for various subjects
- **Study Tips**: Subject-specific study recommendations
- **Concept Explanations**: Get explanations for complex topics
- **OpenAI Integration**: Uses GPT-3.5-turbo for responses

### 🎨 Beautiful UI/UX
- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Smooth Animations**: Framer Motion animations throughout
- **Mobile Responsive**: Works perfectly on all devices
- **Dark/Light Themes**: Beautiful gradient backgrounds

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication**
- **Multer** for file uploads
- **Sharp** for image processing
- **OpenAI API** for chatbot
- **Crypto** for encryption
- **Helmet** for security
- **Rate Limiting** for API protection

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Icons** for icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-exchange-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-exchange
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 4. Start MongoDB
Make sure MongoDB is running on your system.

### 5. Run the Application
```bash
# From root directory - runs both client and server
npm run dev

# Or run separately:
# Server (from server directory)
npm run dev

# Client (from client directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Configuration

### OpenAI API Key
To enable the AI assistant:
1. Get an API key from [OpenAI](https://openai.com/api/)
2. Add it to your `.env` file as `OPENAI_API_KEY`
3. The app will work in demo mode without an API key

### MongoDB Setup
- **Local**: Install MongoDB locally
- **Cloud**: Use MongoDB Atlas for cloud database
- Update `MONGODB_URI` in your `.env` file

### File Upload Configuration
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `UPLOAD_DIR`: Directory for uploaded files

## 🏗️ Project Structure

```
student-exchange-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── uploads/            # File uploads
│   ├── index.js
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔐 Security Features

### Anonymous Accounts
- Users get generated anonymous IDs like `student_a1b2c3d4`
- No personal information stored beyond email
- Random avatar generation

### End-to-End Encryption
- Sensitive data encrypted using AES-256-GCM
- Encryption keys generated per session
- File encryption for uploaded content

### API Security
- Rate limiting on all endpoints
- Helmet.js for security headers
- Input validation and sanitization
- JWT token expiration

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout user

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Upload new note
- `GET /api/notes/:id` - Get single note
- `POST /api/notes/:id/purchase` - Purchase note
- `GET /api/notes/:id/download` - Download purchased note

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get single question
- `POST /api/questions/:id/answer` - Add answer
- `POST /api/questions/:id/vote` - Vote on question

### Chatbot
- `POST /api/chatbot/chat` - Chat with AI
- `GET /api/chatbot/suggestions/:subject` - Get suggestions
- `POST /api/chatbot/explain` - Get explanations

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key
OPENAI_API_KEY=your-openai-api-key
```

### Build for Production
```bash
# Build client
cd client
npm run build

# The built files will be served by the Express server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

## 🔮 Future Features

- [ ] Real-time chat system
- [ ] Advanced search and filtering
- [ ] Mobile app (React Native)
- [ ] Blockchain integration for payments
- [ ] Advanced AI features
- [ ] Study group formation
- [ ] Exam scheduling system
- [ ] Achievement and badge system

---

**Built with ❤️ for students, by students**