# MiratApp

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