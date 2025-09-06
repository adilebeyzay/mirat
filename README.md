
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

# MiratAppUI

MiratApp, robot sensör ve kamera verilerini görüntüleyen bir mobil uygulamadır. Bu uygulama robot sisteminden gelen verileri gerçek zamanlı olarak takip etmenizi sağlar.

## Özellikler

### 📊 Sensör Verileri
- Sıcaklık, nem, basınç ve titreşim verilerini gerçek zamanlı görüntüleme
- Grafik ve trend analizi
- Veri geçmişi takibi

### 📹 Kamera Verileri
- Ön ve termal kamera görüntüleri
- Canlı görüntü akışı
- Görüntü kaydetme ve geçmiş
- Kamera kontrolü

### 🔧 Sistem Sağlığı
- Batarya durumu
- CPU, bellek ve disk kullanımı
- Sistem sıcaklığı
- Ağ durumu
- Hata ve uyarı takibi
- Sistem bakım araçları

## Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- Expo CLI
- Expo Go uygulaması (test için)

### Paket Kurulumu

```bash
# Expo CLI'yi global olarak yükle
npm install -g @expo/cli

# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npx expo start

# Android için
npx expo start --android

# iOS için
npx expo start --ios

# Web için
npx expo start --web
```

### Gerekli Paketler

Uygulama aşağıdaki ana Expo paketlerini kullanır:

- **@react-navigation/native** - Navigasyon
- **@react-navigation/bottom-tabs** - Alt tab navigasyonu
- **react-native-chart-kit** - Grafik ve chart bileşenleri
- **@expo/vector-icons** - İkonlar
- **expo-camera** - Kamera erişimi
- **expo-sensors** - Sensör verileri
- **expo-bluetooth** - Bluetooth Low Energy
- **expo-linear-gradient** - Gradient efektleri
- **expo-av** - Video ve ses işleme
- **expo-location** - Konum servisleri
- **expo-network** - Ağ durumu

## Proje Yapısı

```
MiratApp/
├── src/
│   └── screens/
│       ├── SensorDataScreen.tsx    # Sensör verileri sayfası
│       ├── CameraDataScreen.tsx    # Kamera verileri sayfası
│       └── SystemHealthScreen.tsx  # Sistem sağlığı sayfası
├── assets/                         # Uygulama varlıkları
│   ├── icon.png                    # Uygulama ikonu
│   ├── splash.png                  # Splash screen
│   ├── adaptive-icon.png           # Android adaptive icon
│   └── favicon.png                 # Web favicon
├── App.tsx                         # Ana uygulama bileşeni
├── app.json                        # Expo konfigürasyonu
├── babel.config.js                 # Babel konfigürasyonu
├── tsconfig.json                   # TypeScript konfigürasyonu
└── package.json                    # Proje bağımlılıkları
```

## Kullanım

1. Uygulamayı başlatın (`npx expo start`)
2. Expo Go uygulamasını kullanarak QR kodu tarayın
3. Robot ile bağlantı kurmak için "Bağlan" butonuna tıklayın
4. Alt tablardan istediğiniz veri türünü seçin:
   - **Sensör Verileri**: Robot sensörlerinden gelen veriler
   - **Kamera Verileri**: Kamera görüntüleri ve kontrolleri
   - **Sistem Sağlığı**: Robot sistem durumu ve bakım araçları

## Geliştirme

### Mock Data
Şu anda uygulama mock (sahte) veriler kullanmaktadır. Gerçek robot API'si entegrasyonu için:

1. `src/screens/` klasöründeki her sayfada mock data kısımlarını gerçek API çağrıları ile değiştirin
2. Robot bağlantı protokolünü implement edin
3. WebSocket veya HTTP API entegrasyonu yapın

### Expo Özellikleri
- **Expo Go**: Geliştirme sırasında hızlı test için
- **EAS Build**: Production build'ler için
- **Expo Updates**: OTA güncellemeler için
- **Expo Notifications**: Push notification desteği

### Özelleştirme
- Renk şeması: `styles` objelerinde renk değerlerini değiştirin
- Grafik türleri: `react-native-chart-kit` dokümantasyonunu inceleyin
- İkonlar: `@expo/vector-icons` kütüphanesinden farklı ikonlar seçin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
