# 🚀 StudyShare - Complete Setup Guide

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
3. **Git** (optional) - [Download here](https://git-scm.com/)
4. **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 📁 Step 1: Create Project Structure

Create the following folder structure on your computer:

```
student-exchange-platform/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── (other files)
│   ├── package.json
│   └── (other config files)
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   ├── index.js
│   ├── package.json
│   └── .env
├── package.json
└── README.md
```

## 📝 Step 2: Copy All Files

Copy all the code files I provided into their respective directories:

### Root Directory Files:
- `package.json` (root)
- `README.md`
- `SETUP_GUIDE.md`

### Server Directory (`server/`):
- `package.json`
- `index.js`
- `.env` (copy from .env.example)
- `.env.example`
- `models/User.js`
- `models/Note.js`
- `models/Question.js`
- `routes/auth.js`
- `routes/notes.js`
- `routes/questions.js`
- `routes/chatbot.js`
- `middleware/auth.js`
- `utils/encryption.js`

### Client Directory (`client/`):
- `package.json`
- `tailwind.config.js`
- `postcss.config.js`
- `public/index.html`
- `src/index.js`
- `src/index.css`
- `src/App.js`
- `src/contexts/AuthContext.js`
- `src/components/Navbar.js`
- `src/components/LoadingSpinner.js`
- `src/pages/Home.js`
- `src/pages/Login.js`
- `src/pages/Register.js`
- `src/pages/Dashboard.js`
- `src/pages/NotesMarketplace.js`
- `src/pages/QuestionsExchange.js`
- `src/pages/ChatBot.js`
- `src/pages/Profile.js`
- `src/pages/NotFound.js`

## 🔧 Step 3: Install Dependencies

Open your terminal/command prompt and navigate to the project directory:

```bash
# Navigate to project directory
cd student-exchange-platform

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Go back to root directory
cd ..
```

## 🗄️ Step 4: Setup MongoDB

### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace the MONGODB_URI in your .env file

## ⚙️ Step 5: Configure Environment Variables

Edit the `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-exchange
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
ENCRYPTION_KEY=your-32-character-encryption-key-here-abc123
OPENAI_API_KEY=demo-key
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 🤖 Optional: OpenAI API Key
To enable the AI assistant:
1. Go to [OpenAI](https://openai.com/api/)
2. Create an account and get an API key
3. Replace `demo-key` with your actual API key in the .env file

## 🚀 Step 6: Run the Application

### Option A: Run Both Client and Server Together
```bash
# From the root directory
npm run dev
```

### Option B: Run Separately
```bash
# Terminal 1 - Run Server
cd server
npm run dev

# Terminal 2 - Run Client
cd client
npm start
```

## 🌐 Step 7: Access the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📱 Step 8: Test the Application

1. **Register a new account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Explore the dashboard** and different features
4. **Test the AI assistant** (works in demo mode without API key)

## 🛠️ Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check your connection string in .env
   - For Atlas, ensure your IP is whitelisted

2. **Port Already in Use**
   - Change the PORT in server/.env
   - Kill existing processes using the port

3. **Dependencies Issues**
   - Delete node_modules folders and package-lock.json
   - Run `npm install` again

4. **Build Errors**
   - Make sure all files are in the correct directories
   - Check for syntax errors in the code

### Commands to Check:

```bash
# Check if MongoDB is running
mongosh

# Check Node.js version
node --version

# Check npm version
npm --version

# Kill process on port 3000 (if needed)
npx kill-port 3000

# Kill process on port 5000 (if needed)
npx kill-port 5000
```

## 📋 Development Tips

1. **Use VS Code Extensions**:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - MongoDB for VS Code

2. **API Testing**:
   - Use Postman or Thunder Client
   - Test endpoints at http://localhost:5000/api

3. **Database Viewing**:
   - Use MongoDB Compass
   - Connect to mongodb://localhost:27017

## 🔄 Project Scripts

```bash
# Root directory
npm run dev          # Run both client and server
npm run install-all  # Install all dependencies

# Server directory
npm start           # Production start
npm run dev         # Development with nodemon

# Client directory
npm start           # Development server
npm run build       # Production build
```

## 🎯 Next Steps

1. **Customize the application** to your needs
2. **Add your OpenAI API key** for full AI functionality
3. **Deploy to production** when ready
4. **Add more features** as needed

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify MongoDB is running
4. Check that all files are in the correct locations

---

**🎉 Congratulations! Your StudyShare platform should now be running successfully!**