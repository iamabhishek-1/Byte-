@echo off
echo 🚀 StudyShare - Setting up your student exchange platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm found
npm --version

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
npm install

REM Install client dependencies
echo 📦 Installing client dependencies...
cd ..\client
npm install

REM Go back to root
cd ..

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist "server\uploads\notes" mkdir server\uploads\notes
if not exist "server\uploads\questions" mkdir server\uploads\questions

REM Copy environment file
echo ⚙️ Setting up environment file...
copy server\.env.example server\.env

echo.
echo 🎉 Installation complete!
echo.
echo 📋 Next steps:
echo 1. Make sure MongoDB is running on your system
echo 2. (Optional) Add your OpenAI API key to server\.env
echo 3. Run 'npm run dev' to start the application
echo.
echo 🌐 The app will be available at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 📖 Read SETUP_GUIDE.md for detailed instructions
pause