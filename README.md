# MiratApp

MiratApp, robot sensör ve kamera verilerini görüntüleyen bir mobil uygulamadır. Bu uygulama robot sisteminden gelen verileri gerçek zamanlı olarak takip etmenizi sağlar.

## Özellikler

### 📊 Sensör Verileri
- Gaz sensörleri (Karbondioksit ve Yanıcı Gaz seviyeleri)
- Ultrasonik sensör mesafe algılama (Sol/Sağ)
- Renk kodlu uyarı sistemi (Yeşil/Sarı/Kırmızı)
- Grafik ve trend analizi
- Veri geçmişi takibi

### 📹 Kamera Verileri
- Normal ve termal kamera görüntüleri
- Manuel görüntü yakalama
- Eş zamanlı video kaydı
- Galeri görüntüleme
- Tam ekran görüntü modu

### 🎮 Hareket Kontrol
- İvmeölçer verilerini gerçek zamanlı görüntüleme
- Robot yön kontrolü (İleri/Geri/Sol/Sağ)
- Hız kontrolü (0-50 km/h)
- Hareket durumu takibi
- Uzaktan robot kontrolü

### 🗺️ Haritalama
- LIDAR verilerini gerçek zamanlı görüntüleme
- 360° tarama simülasyonu
- Mesafe tabanlı renk kodlaması
- Harita verilerini kaydetme ve temizleme
- Tarama ilerlemesi takibi

### 🔧 Sistem Sağlığı
- Batarya durumu ve gerilimi
- Anlık akım çekimi
- Güç tüketimi
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
- **@react-navigation/stack** - Stack navigasyonu
- **react-native-chart-kit** - Grafik ve chart bileşenleri
- **@expo/vector-icons** - İkonlar
- **expo-camera** - Kamera erişimi
- **expo-sensors** - Sensör verileri (İvmeölçer)
- **@react-native-community/slider** - Hız kontrol slider'ı
- **expo-linear-gradient** - Gradient efektleri
- **expo-av** - Video ve ses işleme
- **expo-location** - Konum servisleri
- **expo-network** - Ağ durumu
- **expo-status-bar** - Status bar kontrolü

## Proje Yapısı

```
MiratApp/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         # Ana navigasyon yapısı (Tab + Stack)
│   └── screens/
│       ├── SensorDataScreen.js     # Sensör verileri sayfası
│       ├── CameraDataScreen.js     # Kamera verileri sayfası
│       ├── SystemHealthScreen.js   # Sistem sağlığı sayfası
│       ├── MovementControlScreen.js # Hareket kontrol sayfası
│       ├── MappingScreen.js        # LIDAR haritalama sayfası
│       └── GalleryScreen.js        # Kamera galeri sayfası
├── assets/                         # Uygulama varlıkları
│   ├── icon.png                    # Uygulama ikonu (128x128)
│   ├── splash.png                  # Splash screen (512x512)
│   ├── adaptive-icon.png           # Android adaptive icon
│   └── favicon.png                 # Web favicon
├── App.js                          # Ana uygulama bileşeni (JavaScript)
├── app.json                        # Expo konfigürasyonu
├── babel.config.js                 # Babel konfigürasyonu
├── package.json                    # Proje bağımlılıkları
├── package-lock.json               # Bağımlılık kilidi
├── README.md                       # Proje dokümantasyonu
├── LICENSE                         # Lisans dosyası
├── android/                        # Android platform dosyaları
│   └── app/src/main/
├── ios/                            # iOS platform dosyaları
│   └── MiratApp/
└── node_modules/                   # NPM bağımlılıkları
```

## Kullanım

1. Uygulamayı başlatın (`npx expo start`)
2. Expo Go uygulamasını kullanarak QR kodu tarayın
3. Robot ile bağlantı kurmak için "Bağlan" butonuna tıklayın
4. Alt tablardan istediğiniz veri türünü seçin:
   - **Sistem Sağlığı**: Robot sistem durumu ve bakım araçları
   - **Sensör Verileri**: Gaz sensörleri ve ultrasonik mesafe algılama
   - **Kamera Verileri**: Normal ve termal kamera görüntüleri
   - **Hareket Kontrol**: Robot yön ve hız kontrolü
   - **Haritalama**: LIDAR verileri ve harita görselleştirmesi

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