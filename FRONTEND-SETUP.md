# ViWoApp Frontend - Backend Connection Setup

## ✅ Changes Made

All necessary configurations have been applied to connect your React Native/Expo app to the production backend at `https://viwoapp.com`.

---

## 📦 Files Created/Modified

### 1. Environment Configuration ✅
**Files:**
- `.env` - Production configuration
- `.env.example` - Template for other environments

**Configuration:**
```env
EXPO_PUBLIC_API_URL=https://viwoapp.com
EXPO_PUBLIC_WS_URL=wss://viwoapp.com
```

### 2. Android Configuration ✅
**File:** `android/app/src/main/AndroidManifest.xml`
- Added `android:networkSecurityConfig="@xml/network_security_config"`
- Added `android:usesCleartextTraffic="false"` (HTTPS only)

**File:** `android/app/src/main/res/xml/network_security_config.xml` (NEW)
- Configured secure connections to viwoapp.com
- Allows localhost for development
- Enforces SSL certificate validation

### 3. App Configuration ✅
**File:** `app.json`
- Added Android permissions (INTERNET, CAMERA, STORAGE)
- Disabled cleartext traffic (forces HTTPS)

---

## 🚀 How It Works

### API Client (`services/api/client.ts`)
Your API client already uses environment variables:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
});
```

### WebSocket (`services/websocket/socket.ts`)
Your WebSocket client also uses environment variables:
```typescript
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000';

socket = io(`${WS_URL}/messages`, {
  auth: { token },
  transports: ['websocket'],
});
```

---

## 🔧 Backend CORS Update Required

You need to update your backend `.env` file on the VPS to allow requests from your mobile app:

```bash
# SSH into your VPS
ssh ubuntu@your-vps-ip

# Edit backend .env file
cd /var/www/viwoapp-backend/backend
sudo nano .env
```

**Add/Update CORS_ORIGIN:**
```env
# Allow requests from your domain and mobile app
CORS_ORIGIN=https://viwoapp.com,https://www.viwoapp.com,https://app.viwoapp.com
```

For mobile apps, CORS is less strict, but it's good to have:
```env
# If you want to allow all origins (development/testing only)
CORS_ORIGIN=*
```

**After updating, restart backend:**
```bash
sudo docker-compose -f docker-compose.prod.yml restart backend
```

---

## 📱 Testing Your App

### 1. Start Development Server
```bash
# From your project root
cd /Users/moha/Desktop/ViWoApp

# Start Expo dev server
npm start
# or
npx expo start
```

### 2. Test on Android
```bash
# Run on Android emulator
npm run android

# Or scan QR code with Expo Go app on physical device
```

### 3. Test on iOS
```bash
# Run on iOS simulator
npm run ios

# Or scan QR code with Expo Go app on physical device
```

### 4. Test API Connection
The app will automatically connect to `https://viwoapp.com` as configured in `.env`.

---

## 🧪 Verify Connection

### Test Endpoints from App

1. **Health Check**
   - Should connect to: `https://viwoapp.com/api/v1/health`
   - Response: `{"status":"ok",...}`

2. **Register/Login**
   - Should work with your production data
   - Use test accounts:
     - `alice@example.com` / `Test123!`
     - `bob@example.com` / `Test123!`
     - `charlie@example.com` / `Test123!`

3. **Posts Feed**
   - Should load 50 sample posts from backend

4. **WebSocket**
   - Real-time messaging should connect to `wss://viwoapp.com`

---

## 🔄 Environment Switching

### Development Mode
Edit `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000
```

### Physical Device Testing
Get your computer's local IP:
```bash
# On Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows
ipconfig | findstr IPv4
```

Then update `.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3000
```

### Production Mode
```env
EXPO_PUBLIC_API_URL=https://viwoapp.com
EXPO_PUBLIC_WS_URL=wss://viwoapp.com
```

**Note:** You may need to restart the Expo server after changing `.env` values.

---

## 🛠️ Troubleshooting

### Issue: "Network request failed"
**Solution:**
1. Check `.env` file has correct URLs
2. Verify backend is running: `curl https://viwoapp.com/api/v1/health`
3. Check Android network permissions
4. For physical devices, ensure device can reach the server

### Issue: "SSL handshake failed"
**Solution:**
1. Verify SSL certificate: `curl -v https://viwoapp.com/api/v1/health`
2. Check network_security_config.xml includes your domain
3. For development, you may need to allow cleartext traffic

### Issue: "CORS error"
**Solution:**
1. Update backend CORS_ORIGIN in `.env`
2. Restart backend: `sudo docker-compose -f docker-compose.prod.yml restart backend`

### Issue: WebSocket not connecting
**Solution:**
1. Verify WSS URL in `.env` (must use `wss://` not `ws://`)
2. Check firewall allows WebSocket connections
3. Test WebSocket: `wscat -c wss://viwoapp.com/socket.io/`

---

## 📱 Android-Specific Setup

### Network Security Config
Already created at: `android/app/src/main/res/xml/network_security_config.xml`

This file:
- ✅ Enforces HTTPS for viwoapp.com
- ✅ Allows localhost for development
- ✅ Trusts system certificates

### AndroidManifest.xml
Updated with:
- ✅ `android:networkSecurityConfig` reference
- ✅ `android:usesCleartextTraffic="false"` (HTTPS only)
- ✅ INTERNET permission

### Rebuild Android After Changes
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

## 🍎 iOS-Specific Setup

### App Transport Security (ATS)
iOS enforces HTTPS by default, which is perfect for your setup!

Your backend uses:
- ✅ HTTPS with valid Let's Encrypt certificate
- ✅ TLS 1.2+ (secure)
- ✅ Strong ciphers

No additional ATS configuration needed since you're using proper HTTPS!

### If You Need to Allow HTTP (Development Only)
Edit `ios/ViWoApp/Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### Rebuild iOS After Changes
```bash
cd ios
pod install
cd ..
npm run ios
```

---

## 🔗 Complete API Endpoints Available

Your app can now access:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh tokens
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get profile

### Users
- `GET /users/me` - Current user
- `GET /users/:id` - User profile
- `GET /users/search` - Search users
- `PUT /users/:id` - Update profile
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/follow` - Unfollow

### Posts
- `GET /posts` - Feed
- `POST /posts` - Create post
- `GET /posts/:id` - Get post
- `POST /posts/:id/like` - Like post
- `POST /posts/:id/share` - Share post
- `DELETE /posts/:id` - Delete post

### VCoin
- `GET /vcoin/balance` - Get balance
- `GET /vcoin/transactions` - Transaction history
- `POST /vcoin/send` - Send VCoin
- `GET /vcoin/stats` - Token stats

### Upload
- `POST /upload/image` - Upload image
- `POST /upload/video` - Upload video

### Shorts
- `GET /shorts` - Get shorts feed
- `POST /shorts` - Create short
- `POST /shorts/:id/like` - Like short

### Messages (WebSocket)
- Real-time messaging
- Typing indicators
- Read receipts

### And 30+ more endpoints!

---

## 🎯 Quick Start Commands

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Start development server
npx expo start

# 3. Run on Android
npm run android

# 4. Run on iOS
npm run ios

# 5. Build for production
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

---

## ✅ Checklist

Before running your app:

- [x] `.env` file created with production URLs
- [x] Android network security config created
- [x] AndroidManifest.xml updated
- [x] app.json permissions configured
- [x] Backend running at https://viwoapp.com
- [x] SSL certificate installed
- [ ] Backend CORS_ORIGIN updated (do this on VPS)
- [ ] Test registration/login
- [ ] Test posts feed
- [ ] Test file uploads
- [ ] Test WebSocket messaging

---

## 🎉 You're Ready!

Your frontend is now configured to connect to your production backend at:
- **API:** https://viwoapp.com/api/v1
- **WebSocket:** wss://viwoapp.com

Just update the backend CORS and you're good to go! 🚀

