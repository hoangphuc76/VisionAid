# 🔐 Quick Firebase Service Account Setup

## Cách 1: Download Service Account Key (KHUYẾN NGHỊ)

### Bước 1: Vào Firebase Console
1. Mở https://console.firebase.google.com/
2. Chọn project: **zact-13cef**
3. Click vào icon ⚙️ (Settings) bên cạnh "Project Overview"
4. Chọn **"Project settings"**

### Bước 2: Generate Service Account Key
1. Chọn tab **"Service accounts"**
2. Click **"Generate new private key"**
3. Confirm và download file JSON
4. Đổi tên file thành `serviceAccountKey.json`
5. Di chuyển vào thư mục `VisionAid_BE/`

```
VisionAid_BE/
├── serviceAccountKey.json  ← Đặt file ở đây
├── server.js
├── package.json
└── ...
```

### Bước 3: Uncomment code trong firebase.service.js

Mở `src/services/firebase.service.js` và uncomment phần này:

```javascript
// Option 1: Using service account JSON file (recommended for production)
const serviceAccount = require('../../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.FIREBASE_DATABASE_URL
});
```

### Bước 4: Cập nhật .env.production

Chỉ cần database URL:

```bash
FIREBASE_DATABASE_URL=https://zact-13cef-default-rtdb.asia-southeast1.firebasedatabase.app
```

### Bước 5: Restart server

```powershell
cd d:\workplace\VisionAid\VisionAid_BE
$env:NODE_ENV="production"; node server.js
```

---

## Cách 2: Sử dụng Environment Variables (TẠM THỜI)

Nếu không muốn download file, bạn có thể dùng env vars (ít bảo mật hơn):

### Bước 1: Lấy credentials từ Service Account

1. Vào Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key" và download
3. Mở file JSON, copy toàn bộ nội dung

### Bước 2: Thêm vào .env.production

```bash
# Firebase Configuration (Using Service Account JSON)
FIREBASE_DATABASE_URL=https://zact-13cef-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_PROJECT_ID=zact-13cef
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"zact-13cef",...}'
```

HOẶC chia nhỏ ra:

```bash
FIREBASE_DATABASE_URL=https://zact-13cef-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_PROJECT_ID=zact-13cef
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@zact-13cef.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

### Bước 3: Restart server

```powershell
$env:NODE_ENV="production"; node server.js
```

---

## Kiểm tra setup thành công

Khi server start, bạn sẽ thấy:

```
✅ Firebase Admin SDK initialized successfully
```

Thay vì:

```
⚠️  Firebase not configured - location sharing will not work
```

---

## Test API

```bash
# Get your IP
ipconfig | Select-String "IPv4"

# Test location update (replace YOUR_TOKEN and YOUR_IP)
curl -X PUT http://YOUR_IP:3000/api/locations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 10.762622, "longitude": 106.660172}'
```

---

## Troubleshooting

### ❌ "Could not load the default credentials"
→ Bạn đang dùng `applicationDefault()` mà chưa setup credentials  
→ Làm theo Cách 1 hoặc Cách 2 ở trên

### ❌ "Firebase not configured"
→ Check file `.env.production` có `FIREBASE_DATABASE_URL` chưa  
→ Kiểm tra `NODE_ENV=production` khi chạy server

### ❌ "serviceAccountKey.json not found"
→ Đảm bảo file ở đúng vị trí: `VisionAid_BE/serviceAccountKey.json`  
→ Hoặc dùng Cách 2 với env variables

### ❌ Firebase warnings vẫn xuất hiện
→ Firebase đã được init nhưng credentials sai  
→ Download lại service account key mới  
→ Kiểm tra project ID có đúng không

---

## Security Best Practices

1. ✅ **QUAN TRỌNG**: Add vào `.gitignore`:
   ```
   serviceAccountKey.json
   .env.production
   .env.development
   ```

2. ✅ Không commit credentials lên git
3. ✅ Rotate service account keys định kỳ
4. ✅ Dùng different Firebase projects cho dev/staging/prod
5. ✅ Set Firebase Database rules đúng cách

---

## Database URL hiện tại

```
https://zact-13cef-default-rtdb.asia-southeast1.firebasedatabase.app
```

Project ID: `zact-13cef`

---

Làm theo **Cách 1** (Service Account JSON file) để bảo mật và dễ quản lý nhất! 🔐
