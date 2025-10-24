# Firebase Setup Guide for VisionAid Backend

## Overview
The backend now uses Firebase Admin SDK to manage location sharing. This keeps your Firebase credentials secure on the server side instead of exposing them in the mobile app.

## Setup Steps

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Click the gear icon ⚙️ next to "Project Overview" → "Project Settings"
4. Go to the "Service Accounts" tab
5. Click "Generate new private key"
6. Save the JSON file as `serviceAccountKey.json`

### 2. Configure Firebase Realtime Database

1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **test mode** for development (set rules later)
5. Copy your database URL (e.g., `https://your-project-id.firebaseio.com`)

### 3. Setup Backend Configuration

#### Option A: Using Service Account JSON (Recommended for Production)

1. Place `serviceAccountKey.json` in the project root:
   ```
   VisionAid_BE/
   ├── serviceAccountKey.json  ← Place here
   ├── server.js
   ├── package.json
   └── ...
   ```

2. Update `.env.production`:
   ```bash
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
   FIREBASE_PROJECT_ID=your-project-id
   ```

3. Update `src/services/firebase.service.js`:
   ```javascript
   // Uncomment this section:
   const serviceAccount = require('../../serviceAccountKey.json');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     databaseURL: config.FIREBASE_DATABASE_URL
   });
   ```

#### Option B: Using Application Default Credentials (Development)

1. Install Google Cloud SDK
2. Run: `gcloud auth application-default login`
3. Set environment variables in `.env`:
   ```bash
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
   FIREBASE_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
   ```

### 4. Security Rules (Important!)

Set these rules in Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "locations": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

For development (less secure):
```json
{
  "rules": {
    "locations": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 5. Test the Setup

1. Start the backend:
   ```bash
   npm start
   ```

2. Check logs for:
   ```
   ✅ Firebase Admin SDK initialized successfully
   ```

3. Test the location endpoint:
   ```bash
   curl -X PUT http://localhost:3000/api/locations \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"latitude": 10.762622, "longitude": 106.660172}'
   ```

## Troubleshooting

### Error: "Firebase not initialized"
- Check that `FIREBASE_DATABASE_URL` is set in `.env`
- Verify service account JSON is valid
- Check server logs for initialization errors

### Error: "Permission denied"
- Update Firebase Realtime Database rules
- Ensure you're authenticated (JWT token)
- Check that userId exists in your MongoDB

### Socket.IO connection fails
- Update `EXPO_PUBLIC_SOCKET_URL` in mobile app `.env`
- Use your machine's LAN IP (not localhost) for testing on device
- Check firewall rules (port 3000 should be open)

## Migration from Frontend Firebase

The mobile app now:
- ❌ Does NOT import Firebase SDK
- ❌ Does NOT store Firebase API keys
- ✅ Uses REST API (`locationApi`)
- ✅ Uses Socket.IO for realtime updates
- ✅ All Firebase operations happen on backend

## Testing on Physical Device

1. Get your machine's IP:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Update mobile app `.env`:
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:3000
   ```

3. Ensure both devices are on the same WiFi network

4. Open firewall port (Windows):
   ```powershell
   New-NetFirewallRule -DisplayName "VisionAid BE (3000)" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

## Security Best Practices

1. **Never commit** `serviceAccountKey.json` to git
2. Add to `.gitignore`:
   ```
   serviceAccountKey.json
   .env.production
   .env.development
   ```
3. Use environment-specific Firebase projects (dev/staging/prod)
4. Rotate service account keys regularly
5. Implement proper Firebase security rules
6. Use HTTPS in production

## Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Firebase Realtime Database Rules](https://firebase.google.com/docs/database/security)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
