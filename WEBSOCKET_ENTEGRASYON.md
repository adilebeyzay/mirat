# WebSocket Entegrasyon Rehberi

## 🎯 **Tamamlanan Entegrasyon**

Arkadaşınızın JavaScript ve HTML kodlarını React Native uygulamanıza başarıyla entegre ettim!

## 🔄 **Yeni Özellikler**

### 1. **WebSocket Servisi** (`src/services/websocketService.js`)
- ✅ ESP32 WebSocket bağlantısı
- ✅ Otomatik yeniden bağlanma
- ✅ Motor komut gönderme
- ✅ Sensör veri alma
- ✅ Bağlantı durumu takibi

### 2. **Güncellenmiş SensorDataScreen**
- ✅ WebSocket ve TCP seçenekleri
- ✅ Bağlantı tipi değiştirme
- ✅ Gerçek zamanlı sensör verisi
- ✅ Risk seviyesi gösterimi

### 3. **Güncellenmiş MovementControlScreen**
- ✅ WebSocket motor kontrolü
- ✅ ESP32 bağlantı kontrolü
- ✅ Gerçek motor komutları

### 4. **Yeni Robot Control Screen** (`src/screens/RobotControlScreen.js`)
- ✅ HTML arayüzünün tam kopyası
- ✅ Tüm sensör verilerini görüntüleme
- ✅ Motor kontrol paneli
- ✅ Ayarlar paneli
- ✅ Sistem logları
- ✅ Bağlantı durumu göstergesi

### 5. **Yeni Bileşenler**
- ✅ `ConnectionHeader` - Bağlantı durumu
- ✅ `SensorPanel` - Sensör verileri
- ✅ `MotorControlPanel` - Motor kontrolü
- ✅ `SettingsPanel` - Ayarlar
- ✅ `LogPanel` - Sistem logları

## 🔌 **Bağlantı Seçenekleri**

### **WebSocket (Önerilen)**
```
IP: 192.168.4.1
Port: 81
Protokol: WebSocket
```

### **TCP (Alternatif)**
```
IP: 192.168.4.1
Port: 4000
Protokol: TCP
```

## 📊 **Veri Formatı**

### **Sensör Verisi**
```
sensor_data:us1,us2,gas1,gas2,imu1x,imu1y,imu1z,imu2x,imu2y,imu2z
```

### **Motor Komutları**
```
motor_ct:forward    # İleri
motor_ct:backward   # Geri
motor_ct:left       # Sol
motor_ct:right      # Sağ
motor_ct:stop       # Dur
```

## 🚀 **Kullanım Adımları**

### 1. **ESP32'yi Başlatın**
- `Deneyap_AP_V3.ino` kodunu ESP32'ye yükleyin
- "Deneyap_AP" ağını oluşturur (şifre: miratrobot)

### 2. **Diğer Cihazları Başlatın**
- STM32F401 (sensör toplama)
- STM32F103 (motor kontrol)
- ESP8266 (iletişim köprüsü)

### 3. **Mobil Uygulamayı Açın**
- "Sensör Verileri" sayfasına gidin
- Bağlantı tipini seçin (WebSocket önerilen)
- "Bağlan" butonuna basın

### 4. **Motor Kontrolü**
- "Hareket Kontrol" sayfasına gidin
- "Bağlan" butonuna basın
- Yön tuşlarını kullanın

## 🎮 **Kontrol Tuşları**

### **Mobil Uygulama**
- ✅ Dokunmatik butonlar
- ✅ Hız ayarı (slider)
- ✅ Bağlantı durumu

### **Arkadaşınızın Web Arayüzü**
- ✅ WASD tuşları
- ✅ Ok tuşları
- ✅ Space/Esc (dur)

## 🔧 **Teknik Detaylar**

### **WebSocket Mesajları**
```javascript
// Bağlantı kurulduğunda
ws.send('MOBILE');

// Motor komutu
ws.send('motor_ct:forward');

// Gelen sensör verisi
ws.onmessage = (event) => {
  const data = event.data; // "sensor_data:1,2,1,3,128,130,125,..."
};
```

### **Risk Seviyeleri**
- `1` = Güvenli (Safe) → 10%
- `2` = Uyarı (Warning) → 50%
- `3` = Tehlikeli (Danger) → 90%

### **IMU Verileri**
- `0-255` arası (128 = nötr)
- `<128` = negatif yön
- `>128` = pozitif yön

## 🐛 **Sorun Giderme**

### **WebSocket Bağlantı Sorunu**
1. ESP32'nin çalıştığından emin olun
2. "Deneyap_AP" ağına bağlandığınızdan emin olun
3. Port 81'in açık olduğundan emin olun

### **Motor Kontrol Sorunu**
1. Önce Sensör Verileri sayfasından bağlanın
2. Hareket Kontrol sayfasında tekrar bağlanın
3. Kontrolü başlatın

### **Sensör Veri Sorunu**
1. STM32F401'nin çalıştığından emin olun
2. ESP8266'nın bağlandığından emin olun
3. I2C bağlantılarını kontrol edin

## 📱 **Mobil vs Web Karşılaştırması**

| Özellik | Mobil Uygulama | Web Arayüzü |
|---------|----------------|-------------|
| Bağlantı | WebSocket + TCP | Sadece WebSocket |
| Kontrol | Dokunmatik | Klavye + Dokunmatik |
| Sensörler | Görsel + Grafik | Sadece Görsel |
| Portabilite | ✅ Yüksek | ❌ Düşük |
| Offline | ❌ Hayır | ❌ Hayır |

## 🎉 **Sonuç**

Artık arkadaşınızın web arayüzü ile aynı işlevselliğe sahip bir mobil uygulamanız var! WebSocket entegrasyonu sayesinde gerçek zamanlı veri alışverişi ve motor kontrolü yapabilirsiniz.
