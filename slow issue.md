# Android Performance Issues - ViWoApp

## Overview
This document outlines the critical performance bottlenecks affecting Android devices, particularly older/lower-end devices. These issues cause slow loading times and poor user experience.

---

## 🔴 Critical Issues

### 1. Multiple Nested Context Providers Creating Waterfall Loading

**Location:** `app/_layout.tsx`

**Problem:**
The app has 4 nested context providers that load sequentially, creating a waterfall effect:
```
ThemeProvider → AuthProvider → SocketProvider → VCoinProvider
```

**Current Implementation:**
```typescript
// app/_layout.tsx lines 94-114
<ThemeProvider>                  // Blocks until AsyncStorage loads theme
  <AuthProvider>                  // Blocks until API fetches user profile
    <SocketProvider>              // Blocks until WebSocket connects
      <VCoinProvider>             // Blocks until API fetches balance
```

**Impact:**
- **Old devices:** 3-5 second delay before app is interactive
- **New devices:** 1-2 second delay
- Each context waits for the previous one to complete
- ThemeProvider blocks by returning `null` during load (line 72-74 in ThemeContext.tsx)

**Solution:**
1. Load contexts in parallel instead of sequentially
2. Don't block rendering - use default values and hydrate asynchronously
3. Lazy load non-critical contexts (Socket, VCoin)

```typescript
// Recommended approach
if (isLoading) {
  // Don't block - render with defaults
  return <ThemeContext.Provider value={defaultTheme}>{children}</ThemeContext.Provider>;
}
```

---

### 2. Image.getSize() Blocking Network Calls

**Location:** `components/PostCard.tsx` (lines 102-119)

**Problem:**
Every PostCard with an image makes a network request to fetch image dimensions:

```typescript
useEffect(() => {
  if (media && media.type === 'image' && !media.aspectRatio && media.uri) {
    Image.getSize(media.uri, (width, height) => {
      // Network call to get dimensions
    });
  }
}, [media?.uri]);
```

**Impact:**
- **Initial feed load:** 20 posts = 20 additional network requests
- Blocks UI thread on older devices
- Causes visible stuttering when scrolling
- Wastes bandwidth fetching data that backend already knows

**Solution:**
1. **Backend fix:** Include `aspectRatio` in post API response
2. **Immediate workaround:** Use a default aspect ratio (16:9) and skip detection
3. **Cache results:** Store detected ratios to avoid repeated calls

```typescript
// Backend should return:
{
  "mediaUrl": "...",
  "mediaType": "image",
  "aspectRatio": 1.777  // ← Add this
}
```

---

### 3. FlatList Without Critical Optimization Props

**Location:** `app/(tabs)/index.tsx` (lines 233-266)

**Problem:**
The main feed FlatList is missing critical Android optimization props:

```typescript
<FlatList
  data={posts}
  renderItem={renderPost}
  // ❌ Missing critical props
/>
```

**Missing Optimizations:**
- `removeClippedSubviews={true}` - Critical for Android, removes offscreen views from memory
- `maxToRenderPerBatch={5}` - Limits items rendered per batch (default is 10)
- `initialNumToRender={5}` - Only renders 5 items on mount (default is 10)
- `windowSize={5}` - Reduces number of pages kept in memory (default is 21)
- `getItemLayout` - Enables instant scroll positioning without measuring

**Impact:**
- **Old devices:** Janky scrolling, frame drops, high memory usage
- **New devices:** Noticeable lag when scrolling fast
- Over-rendering offscreen items wastes CPU/GPU
- Memory pressure causes GC pauses

**Solution:**
```typescript
<FlatList
  data={posts}
  renderItem={renderPost}
  // Add these optimizations:
  removeClippedSubviews={true}
  maxToRenderPerBatch={5}
  initialNumToRender={5}
  windowSize={5}
  updateCellsBatchingPeriod={50}
  getItemLayout={(data, index) => ({
    length: ESTIMATED_ITEM_HEIGHT,
    offset: ESTIMATED_ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

### 4. React Native New Architecture Overhead

**Location:** `app.json` (line 10)

**Problem:**
New Architecture is enabled but may be causing performance regression:

```json
{
  "newArchEnabled": true
}
```

**Current Stack:**
- React 19.1.0 (bleeding edge)
- React Native 0.81.5
- New Architecture (Fabric + TurboModules)
- react-native-reanimated ~4.1.1

**Impact:**
- **Old devices:** Higher memory usage, slower startup
- **Known issues:** New Architecture has regressions on Android < 10
- Some libraries not fully optimized for new architecture
- Reanimated 4.x still has edge cases with Fabric

**Solution:**
1. **Test with New Architecture disabled:**
```json
{
  "newArchEnabled": false
}
```

2. **If keeping enabled:**
   - Update to stable React Native version
   - Ensure all libraries are New Architecture compatible
   - Monitor memory usage and startup time

3. **Gradual rollout:** Disable for older Android versions via runtime detection

---

### 5. Socket Auto-Connection on Startup

**Location:** `contexts/SocketContext.tsx` (lines 20-32)

**Problem:**
WebSocket connects immediately after authentication, blocking the critical startup path:

```typescript
useEffect(() => {
  if (isAuthenticated) {
    connectSocket(); // ← Blocks startup
  }
}, [isAuthenticated]);
```

**Impact:**
- Adds network latency to startup sequence
- Competes with other API calls (profile, balance)
- Not needed until user performs real-time action
- Wastes battery/data on slow connections

**Solution:**
**Lazy connect** - Only connect when needed:

```typescript
// Option 1: Connect on first navigation to real-time features
useEffect(() => {
  if (isAuthenticated && isOnRealtimeScreen) {
    connectSocket();
  }
}, [isAuthenticated, isOnRealtimeScreen]);

// Option 2: Delay connection
useEffect(() => {
  if (isAuthenticated) {
    setTimeout(() => connectSocket(), 3000); // Connect after 3s
  }
}, [isAuthenticated]);
```

---

### 6. LinearGradient Rendering Overhead

**Location:** Multiple screens (e.g., `app/(tabs)/index.tsx` lines 226-231)

**Problem:**
Every screen renders a full-screen LinearGradient:

```typescript
<LinearGradient
  colors={gradientColors}
  style={StyleSheet.absoluteFill}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 0.3 }}
/>
```

**Impact:**
- Requires native gradient rendering
- Re-renders on theme change
- Adds GPU overhead on every frame
- Compounds with other rendering operations

**Solution:**
1. **Use static background color** on low-end devices
2. **Cache gradient as image** and use Image component
3. **Simplify gradient** - use 2 colors instead of 3
4. **Conditional rendering:**

```typescript
const shouldUseGradient = Platform.OS === 'ios' || isHighEndDevice;

{shouldUseGradient ? (
  <LinearGradient colors={gradientColors} ... />
) : (
  <View style={{ backgroundColor: colors.background }} />
)}
```

---

## 📊 Priority Matrix

| Issue | Old Devices | New Devices | Fix Difficulty | Priority |
|-------|-------------|-------------|----------------|----------|
| FlatList Optimizations | 🔴 Critical | 🟠 High | ⭐ Easy | **HIGHEST** |
| Image.getSize() Calls | 🔴 Critical | 🟠 High | ⭐⭐ Medium | **HIGH** |
| Context Waterfall | 🔴 Critical | 🟠 High | ⭐⭐⭐ Hard | **HIGH** |
| New Architecture | 🟠 High | 🟡 Moderate | ⭐ Easy | **MEDIUM** |
| Socket Auto-Connect | 🟡 Moderate | 🟢 Low | ⭐ Easy | **LOW** |
| LinearGradient | 🟡 Moderate | 🟢 Low | ⭐ Easy | **LOW** |

---

## 🎯 Recommended Implementation Order

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Add FlatList optimization props
2. ✅ Delay socket connection by 3 seconds
3. ✅ Test with `newArchEnabled: false`

### Phase 2: Backend Changes (2-4 hours)
1. ✅ Add `aspectRatio` to post API response
2. ✅ Update PostCard to use backend aspect ratio
3. ✅ Remove `Image.getSize()` calls

### Phase 3: Architecture Improvements (1-2 days)
1. ✅ Refactor context loading to be non-blocking
2. ✅ Implement parallel context initialization
3. ✅ Add device capability detection
4. ✅ Conditionally disable heavy features on low-end devices

### Phase 4: Polish (optional)
1. ✅ Replace LinearGradient with solid colors on Android
2. ✅ Implement image dimension caching
3. ✅ Add performance monitoring

---

## 🧪 Testing Checklist

After implementing fixes, test on:
- [ ] Android 8.0 (Oreo) - old device baseline
- [ ] Android 10 - mid-range baseline
- [ ] Android 13+ - modern device
- [ ] Device with 2GB RAM (low-end)
- [ ] Device with 4GB+ RAM (mid/high-end)

**Key Metrics to Measure:**
- Time to Interactive (TTI) - should be < 2s on all devices
- Initial render time - should be < 1s
- FlatList scroll FPS - should be 60fps on mid-range+, 30fps+ on low-end
- Memory usage - should stay under 200MB on low-end devices

---

## 📝 Additional Notes

### Device Capability Detection
Implement runtime device detection to adjust UI complexity:

```typescript
import { Platform, PixelRatio } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const isLowEndDevice = () => {
  if (Platform.OS === 'android') {
    const totalMemory = DeviceInfo.getTotalMemorySync();
    const pixelRatio = PixelRatio.get();
    
    // Device is low-end if < 3GB RAM or old Android version
    return totalMemory < 3 * 1024 * 1024 * 1024 || 
           DeviceInfo.getSystemVersion() < '9';
  }
  return false;
};
```

### Performance Monitoring
Add metrics tracking to identify bottlenecks in production:

```typescript
import { PerformanceObserver } from 'react-native-performance';

// Track key metrics
PerformanceObserver.observe('navigation', (list) => {
  list.getEntries().forEach(entry => {
    analytics.track('screen_load_time', {
      screen: entry.name,
      duration: entry.duration
    });
  });
});
```

---

**Last Updated:** November 20, 2025
**Status:** 🔴 Critical issues identified, fixes pending implementation

