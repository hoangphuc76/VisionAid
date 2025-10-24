# 🚀 HƯỚNG DẪN LẤY SERVICE ACCOUNT KEY - 3 PHÚT

## Bước 1: Mở Firebase Console

Truy cập: https://console.firebase.google.com/

## Bước 2: Chọn Project

Click vào project **zact-13cef**

## Bước 3: Vào Settings

1. Click vào icon **⚙️ (Settings)** bên cạnh "Project Overview"
2. Chọn **"Project settings"**

## Bước 4: Generate Service Account Key

1. Click tab **"Service accounts"** (thứ 3 từ trái sang)
2. Kéo xuống phần **"Firebase Admin SDK"**
3. Click nút **"Generate new private key"** (màu xanh)
4. Click **"Generate key"** để confirm

→ File JSON sẽ được download tự động

## Bước 5: Di chuyển file

1. File vừa download có tên dạng: `zact-13cef-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`
2. **Đổi tên** file thành: `serviceAccountKey.json`
3. **Di chuyển** file vào thư mục:

```
d:\workplace\VisionAid\VisionAid_BE\serviceAccountKey.json
```

Cấu trúc thư mục cuối cùng:

```
VisionAid_BE/
├── serviceAccountKey.json  ← File bạn vừa download
├── server.js
├── package.json
├── .env.production
└── src/
    └── ...
```

## Bước 6: Uncomment code

Mở file: `src/services/firebase.service.js`

Tìm đoạn code này (dòng ~23-27):

```javascript
// Option 1: Using service account JSON file (recommended for production)
// const serviceAccount = require('../../serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: config.FIREBASE_DATABASE_URL
// });
```

**Xóa dấu `//`** để uncomment:

```javascript
// Option 1: Using service account JSON file (recommended for production)
const serviceAccount = require('../../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.FIREBASE_DATABASE_URL
});
```

**Comment lại** các Option khác bên dưới (Option 2, Option 3).

## Bước 7: Restart Server

```powershell
cd d:\workplace\VisionAid\VisionAid_BE
$env:NODE_ENV="production"; $env:PORT="3000"; $env:HOST="0.0.0.0"; node server.js
```

## Bước 8: Kiểm tra

Khi server start, bạn sẽ thấy:

```
✅ Firebase Admin SDK initialized successfully
✅ Firebase initialized with service account from env
```

Thay vì lỗi credentials!

## ✅ XONG!

Server bây giờ đã kết nối Firebase thành công và sẵn sàng xử lý location sharing!

---

## 🔒 QUAN TRỌNG: Bảo mật

Sau khi setup xong, thêm vào `.gitignore`:

```
serviceAccountKey.json
.env.production
.env.development
```

**KHÔNG BAO GIỜ** commit file `serviceAccountKey.json` lên Git!

---

## 🧪 Test thử

```bash
# Lấy IP máy
ipconfig | Select-String "IPv4"

# Test location API
curl -X PUT http://YOUR_IP:3000/api/locations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 10.762622, "longitude": 106.660172}'
```

---

**Thời gian: ~3 phút**  
**Độ khó: ⭐☆☆☆☆ (Rất dễ)**
