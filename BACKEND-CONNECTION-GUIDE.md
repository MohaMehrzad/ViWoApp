# 🔌 ViWoApp Frontend - Backend Connection Guide

## ✅ Configuration Complete!

Your React Native/Expo app is now configured to connect to your production backend at **https://viwoapp.com**

---

## 📋 What Was Changed

### 1. Environment Variables (NEW)
- **`.env`** - Production configuration pointing to https://viwoapp.com
- **`.env.example`** - Template for different environments

### 2. Android Configuration
- **`android/app/src/main/res/xml/network_security_config.xml`** (NEW)
  - Enforces HTTPS for viwoapp.com
  - Allows localhost for development
  - Trust system certificates

- **`android/app/src/main/AndroidManifest.xml`**
  - Added network security config reference
  - Disabled cleartext traffic (HTTPS only)

### 3. App Configuration
- **`app.json`**
  - Added Android permissions
  - Configured secure networking

### 4. iOS Configuration
- **Already configured!** ✅
  - App Transport Security enforces HTTPS
  - Local networking allowed for development

---

## 🚀 Quick Start

### Step 1: Start Your App

```bash
# Install dependencies (if fresh clone)
npm install

# Start Expo dev server
npx expo start
```

### Step 2: Run on Device

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Or scan QR code with Expo Go app**

---

## 🔧 Backend CORS Configuration (REQUIRED!)

Your backend needs to allow requests from your mobile app.

**On your VPS:**
```bash
# SSH into VPS
ssh ubuntu@your-vps-ip

# Edit backend .env
cd /var/www/viwoapp-backend/backend
sudo nano .env
```

**Update CORS_ORIGIN:**

**Option 1: Allow specific origins (Recommended)**
```env
CORS_ORIGIN=https://viwoapp.com,https://www.viwoapp.com,https://app.viwoapp.com
```

**Option 2: Allow all origins (For mobile apps - easier)**
```env
CORS_ORIGIN=*
```

**Restart backend:**
```bash
sudo docker-compose -f docker-compose.prod.yml restart backend
```

---

## 🧪 Test Your Connection

### From Your App

1. **Open the app** on your device/simulator

2. **Try Registration**
   - Navigate to Register screen
   - Create a new account
   - Should connect to: `https://viwoapp.com/api/v1/auth/register`

3. **Try Login**
   - Use test account: `alice@example.com` / `Test123!`
   - Should receive JWT tokens

4. **View Posts Feed**
   - Should load 50 sample posts
   - Images should display

5. **Test WebSocket**
   - Navigate to messages
   - Should connect to: `wss://viwoapp.com`

---

## 📱 Environment Variables Reference

Your app uses these environment variables:

### `EXPO_PUBLIC_API_URL`
- **Production:** `https://viwoapp.com`
- **Development:** `http://localhost:3000`
- **Physical Device:** `http://YOUR_COMPUTER_IP:3000`

### `EXPO_PUBLIC_WS_URL`
- **Production:** `wss://viwoapp.com`
- **Development:** `ws://localhost:3000`
- **Physical Device:** `ws://YOUR_COMPUTER_IP:3000`

---

## 🔄 Switching Environments

### Development (Local Backend)
```bash
# Edit .env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000

# Restart Expo
npx expo start
```

### Production (Deployed Backend)
```bash
# Edit .env
EXPO_PUBLIC_API_URL=https://viwoapp.com
EXPO_PUBLIC_WS_URL=wss://viwoapp.com

# Restart Expo
npx expo start
```

### Physical Device Testing
```bash
# Find your computer's IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Edit .env (replace with your IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3000

# Restart Expo
npx expo start
```

---

## 🛡️ Security Features

### Android
- ✅ Network Security Config enforces HTTPS
- ✅ Certificate pinning ready
- ✅ Cleartext traffic disabled
- ✅ System certificates trusted

### iOS  
- ✅ App Transport Security enabled
- ✅ HTTPS enforced by default
- ✅ Local networking allowed for dev
- ✅ Strong cipher requirements

### Backend
- ✅ SSL/TLS with Let's Encrypt
- ✅ CORS protection
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Request validation

---

## 📊 Connection Flow

```
Mobile App (React Native/Expo)
  ↓
.env Configuration
  ↓
API Client (axios) → https://viwoapp.com/api/v1/*
WebSocket Client → wss://viwoapp.com/socket.io/
  ↓
Nginx (SSL/TLS termination)
  ↓
Backend (NestJS Docker container)
  ↓
PostgreSQL + Redis
```

---

## 🐛 Troubleshooting

### "Network request failed"
1. Check `.env` URLs are correct
2. Verify backend is running: `curl https://viwoapp.com/api/v1/health`
3. Check internet connection
4. For Android: Verify network permissions in AndroidManifest
5. For iOS: Check ATS settings in Info.plist

### "CORS policy error"
1. Update backend `CORS_ORIGIN` in `.env` on VPS
2. Restart backend
3. For mobile apps, you can use `CORS_ORIGIN=*`

### "SSL certificate error"
1. For production: Should not happen (Let's Encrypt is trusted)
2. For development with self-signed: Add exception in network config
3. Verify certificate: `openssl s_client -connect viwoapp.com:443`

### "WebSocket connection failed"
1. Verify WSS URL (must use `wss://` not `ws://`)
2. Check backend WebSocket is running
3. Test: Install wscat and run `wscat -c wss://viwoapp.com/socket.io/`

### "Cannot connect on physical device"
1. Ensure device and computer on same network
2. Use computer's local IP in .env
3. Start backend with `0.0.0.0` binding (Docker does this by default)

---

## 📱 Production Build Configuration

### EAS Build (Recommended)

Create `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://viwoapp.com",
        "EXPO_PUBLIC_WS_URL": "wss://viwoapp.com"
      }
    },
    "development": {
      "developmentClient": true,
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000",
        "EXPO_PUBLIC_WS_URL": "ws://localhost:3000"
      }
    }
  }
}
```

**Build commands:**
```bash
# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production

# Build for development
eas build --platform android --profile development
```

---

## 🎯 Next Steps

1. **Update Backend CORS** (on VPS)
   ```bash
   cd /var/www/viwoapp-backend/backend
   sudo nano .env
   # Set: CORS_ORIGIN=*
   sudo docker-compose -f docker-compose.prod.yml restart backend
   ```

2. **Start Your App**
   ```bash
   npx expo start
   ```

3. **Test Connection**
   - Register new account
   - Login with test accounts
   - Browse posts feed
   - Test file uploads
   - Try messaging

4. **Monitor Backend**
   ```bash
   # View logs
   sudo docker logs viwoapp-backend -f
   
   # Check health
   curl https://viwoapp.com/api/v1/health
   ```

---

## 🎉 Ready to Go!

Your frontend is configured and ready to connect to your production backend!

**Backend:** https://viwoapp.com ✅  
**Frontend:** Configured ✅  
**SSL:** Let's Encrypt (valid) ✅  
**CORS:** Needs update on VPS ⏳

Just update the CORS setting and you're all set! 🚀

