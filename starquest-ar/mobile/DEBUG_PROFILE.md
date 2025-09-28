# Debug ProfileScreen Navigation Issue

## 🐛 **Current Issue**
When clicking the Profile tab, the app shows loading and then completely restarts from the wallet connection screen.

## 🔍 **Debugging Steps Applied**

### 1. **Simplified ProfileScreen**
- Replaced complex ProfileScreen with minimal version
- Removed all wagmi hooks and external dependencies
- Added extensive console logging
- Wrapped in try-catch blocks

### 2. **Added Debug Logging**
- GameContext: TAB_CHANGE action debugging
- App.tsx: renderMainScreen debugging  
- ProfileScreen: Component mounting debugging

### 3. **Error Boundaries**
- Added error boundaries around ProfileScreen rendering
- Safe fallbacks for any rendering errors

## 🧪 **Testing Instructions**

### Step 1: Check Console Logs
When you click the Profile tab, you should see these logs in order:

1. `🔄 GameContext: Tab change requested: profile`
2. `🔄 GameContext: TAB_CHANGE received - tab: profile`
3. `✅ GameReducer: Tab changed successfully to: profile`
4. `🎨 App.tsx: renderMainScreen - activeTab: profile`
5. `👤 App.tsx: Rendering ProfileScreen`
6. `🏠 ProfileScreen: Main component rendering`
7. `🏠 ProfileScreen: Rendering minimal version`

### Step 2: Expected Behavior
- Profile screen should show: "Profile Screen" title
- Should display "✅ Profile screen loaded successfully!"
- Should NOT restart the entire app

### Step 3: If Issue Persists
If you still see the app restarting, the issue is likely:

#### A. **Memory Issue**
- React Native is running out of memory
- Check device/simulator memory usage

#### B. **Global Error**
- An unhandled error is crashing the JS context
- Check Metro bundler terminal for red error messages

#### C. **State Management Bug**
- Something in GameContext is causing state reset
- Check for circular dependencies or infinite loops

#### D. **Navigation Issue**
- React Navigation might be interfering
- Check if you have React Navigation installed

## 🔧 **Next Debugging Steps**

If the minimal ProfileScreen still causes issues:

### 1. **Test Other Tabs**
Try clicking other tabs (Map, Quests, Leaderboard) to see if they work

### 2. **Check for React Navigation**
```bash
# Check if React Navigation is installed
npm list | grep navigation
```

### 3. **Add Memory Monitoring**
Add this to App.tsx:
```typescript
React.useEffect(() => {
  const interval = setInterval(() => {
    console.log('🧠 Memory check - activeTab:', state.activeTab);
  }, 1000);
  return () => clearInterval(interval);
}, [state.activeTab]);
```

### 4. **Test Direct ProfileScreen**
Temporarily replace HomeScreen with ProfileScreen to test direct rendering:
```typescript
// In App.tsx, change "home" case to render ProfileScreen
case "home":
  return <ProfileScreen />; // Test direct rendering
```

## 📊 **Expected Results**

- **Success**: Minimal ProfileScreen loads without issues
- **Failure**: App still restarts → Deeper system issue (likely memory or global error)

## 🚀 **Recovery Plan**

If minimal ProfileScreen works:
1. Gradually add back features one by one
2. Test each addition to find the breaking point
3. Focus on wagmi hooks, complex components, or API calls

If minimal ProfileScreen still fails:
1. Check React Native/Expo versions for compatibility issues
2. Clear all caches: `expo r -c`
3. Restart development server completely
4. Check for conflicting packages
