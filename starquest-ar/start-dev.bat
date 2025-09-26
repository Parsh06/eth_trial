@echo off
echo 🚀 Starting StarQuest AR Development Environment...

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  MongoDB is not running. Please start MongoDB first.
    echo    Run: net start MongoDB
    pause
    exit /b 1
)

REM Start backend
echo 📡 Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start mobile app
echo 📱 Starting mobile app...
cd ..\mobile
start "Mobile App" cmd /k "npm start"

echo ✅ Development environment started!
echo 📡 Backend: http://localhost:5000
echo 📱 Mobile: Check Expo CLI for mobile app URL
echo.
echo Press any key to stop all servers
pause >nul

echo 🛑 Stopping servers...
taskkill /F /IM node.exe 2>nul
echo ✅ All servers stopped

