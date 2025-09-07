# Python 3D LIDAR Sunucusu Kurulumu

## 🐍 Python Sunucusu Kurulumu

### 1. Python Kurulumu
```bash
# Python 3.8+ gerekli
python --version
```

### 2. Gereksinimler Kurulumu
```bash
pip install -r requirements.txt
```

### 3. Sunucuyu Başlatma
```bash
python python_3d_server.py
```

### 4. Test Etme
- **Tarayıcıda**: http://localhost:8080
- **Mobil uygulamada**: Otomatik olarak yüklenecek

## 📱 Mobil Uygulama Entegrasyonu

### WebView Ayarları
- **URL**: `http://10.0.2.2:8080/lidar-3d`
- **Emülatör için**: `10.0.2.2` (localhost yerine)
- **Gerçek cihaz için**: Bilgisayarın IP adresi

### Özellikler
- ✅ **3D LIDAR görselleştirme** (Three.js)
- ✅ **Gerçek zamanlı veri güncelleme**
- ✅ **Renkli mesafe gösterimi**
- ✅ **Dönen 3D görsel**
- ✅ **Responsive tasarım**

## 🔧 Özelleştirme

### LIDAR Verilerini Değiştirme
`python_3d_server.py` dosyasındaki `generate_lidar_data()` fonksiyonunu düzenleyin:

```python
def generate_lidar_data():
    # Gerçek LIDAR verilerinizi buraya ekleyin
    points = []
    # ... veri işleme kodu
    return points
```

### Görsel Ayarları
- **Nokta boyutu**: `SphereGeometry(2, 8, 6)`
- **Renkler**: Mesafeye göre (kırmızı/yellow/yeşil)
- **Döndürme hızı**: `lidarGroup.rotation.y += 0.005`

## 🚨 Sorun Giderme

### Sunucu Başlamıyor
```bash
# Port 8080 kullanımda mı kontrol et
netstat -an | findstr :8080

# Farklı port kullan
python python_3d_server.py --port 8081
```

### Mobil Uygulamada Görünmüyor
1. **Emülatör IP**: `10.0.2.2` kullanın
2. **Firewall**: Python sunucusuna izin verin
3. **Network**: Aynı ağda olduğunuzdan emin olun

### WebView Hatası
- **Expo WebView**: `expo install react-native-webview`
- **Cache temizle**: `npx expo start --clear`

