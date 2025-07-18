#!/bin/bash

# StudyShare - Installation Script
echo "🚀 StudyShare - Setting up your student exchange platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install

# Go back to root
cd ..

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads/notes
mkdir -p server/uploads/questions

# Copy environment file
echo "⚙️ Setting up environment file..."
cp server/.env.example server/.env

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running on your system"
echo "2. (Optional) Add your OpenAI API key to server/.env"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📖 Read SETUP_GUIDE.md for detailed instructions"