#!/bin/bash

# Start development servers for StarQuest AR

echo "🚀 Starting StarQuest AR Development Environment..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On Windows: net start MongoDB"
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
    exit 1
fi

# Start backend
echo "📡 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start mobile app
echo "📱 Starting mobile app..."
cd ../mobile
npm start &
MOBILE_PID=$!

echo "✅ Development environment started!"
echo "📡 Backend: http://localhost:5000"
echo "📱 Mobile: Check Expo CLI for mobile app URL"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping servers..."
kill $BACKEND_PID $MOBILE_PID 2>/dev/null
echo "✅ All servers stopped"

