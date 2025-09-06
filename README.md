# Mirat Backend API

Node.js (Express) + MongoDB kullanarak geliştirilmiş backend API.

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyasını oluşturun:
```bash
cp env.example .env
```

3. `.env` dosyasındaki değerleri düzenleyin:
- `MONGO_URI`: MongoDB bağlantı string'i
- `JWT_SECRET`: Güçlü bir JWT secret key
- `PORT`: Sunucu portu (varsayılan: 5000)

4. MongoDB'yi başlatın

5. Sunucuyu çalıştırın:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Auth Endpoints

#### POST /api/auth/register
Kullanıcı kaydı
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Kullanıcı girişi
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Robot Data Endpoints (Auth Required)

#### POST /api/robot
Robot sensör verisi ekleme
```json
{
  "sensorType": "temperature",
  "value": 25.5,
  "unit": "°C",
  "location": "Room 1",
  "notes": "Normal temperature"
}
```

#### GET /api/robot
Robot sensör verilerini listeleme (en yeniye göre)
Query parameters:
- `sensorType`: Sensör tipi filtreleme
- `limit`: Sayfa başına kayıt sayısı (varsayılan: 50)
- `page`: Sayfa numarası (varsayılan: 1)

### Health Check

#### GET /api/health
Sunucu durumu kontrolü

## Authentication

Tüm robot data endpoint'leri JWT token gerektirir. Token'ı header'da `x-auth-token` olarak gönderin.

## Sensor Types

Desteklenen sensör tipleri:
- temperature
- humidity
- pressure
- motion
- light
- sound
- vibration
- other

