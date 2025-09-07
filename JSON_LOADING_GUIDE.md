# JSON Veri Görüntüleme Rehberi

## 📁 JSON Veri Formatı

### Gerekli Alanlar:
```json
{
  "scanId": "scan_001",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "robotPosition": {
    "x": 0,
    "y": 0,
    "z": 0,
    "rotation": 0
  },
  "lidarPoints": [
    {
      "angle": 0,
      "distance": 150,
      "x": 150,
      "y": 0,
      "z": 0
    }
  ],
  "mapData": {
    "width": 500,
    "height": 500,
    "resolution": 0.05,
    "obstacles": [
      {
        "x": 200,
        "y": 100,
        "type": "wall",
        "width": 50,
        "height": 10
      }
    ]
  },
  "statistics": {
    "totalPoints": 72,
    "averageDistance": 125.5,
    "maxDistance": 200,
    "minDistance": 40
  }
}
```

## 🔧 Kullanım

### 1. JSON Veri Görüntüleme:
- JSON verileri otomatik olarak yüklenir
- **LIDAR Veri Bilgileri** kartında özet bilgiler
- **3D LIDAR Görselleştirmesi** alanında görsel
- **Harita Verileri** bölümünde detaylar

### 2. Veri Analizi:
- **Tarama ID** ve **LIDAR nokta sayısı**
- **Ortalama** ve **maksimum mesafe**
- **3D görselleştirme** ile detaylı analiz

## 📊 Desteklenen Veri Türleri

### LIDAR Noktaları:
- **angle**: Açı (0-360 derece)
- **distance**: Mesafe (cm)
- **x, y, z**: 3D koordinatlar

### Harita Verileri:
- **obstacles**: Engeller (duvar, engel)
- **freeSpace**: Boş alanlar
- **resolution**: Çözünürlük

### İstatistikler:
- **totalPoints**: Toplam nokta sayısı
- **averageDistance**: Ortalama mesafe
- **maxDistance**: Maksimum mesafe
- **minDistance**: Minimum mesafe

## 🎯 Özellikler

### Otomatik Dönüştürme:
- JSON verileri LIDAR formatına dönüştürülür
- 3D görselleştirme için hazırlanır
- İstatistikler hesaplanır

### Görselleştirme:
- **Renkli mesafe gösterimi**
- **3D nokta haritası**
- **Engel tespiti**
- **Tam ekran modu**

### Veri Analizi:
- **Gerçek zamanlı istatistikler**
- **Mesafe analizi**
- **Engel haritalama**
- **Veri kalitesi kontrolü**

## 📱 Mobil Uygulama Entegrasyonu

### Veri Görüntüleme:
```javascript
// JSON verilerini görüntüleme
const displayJsonData = (jsonData) => {
  setJsonData(jsonData);
  convertToLidarData(jsonData);
};
```

### Veri Dönüştürme:
```javascript
// JSON'dan LIDAR verilerine dönüştürme
const convertedData = jsonData.lidarPoints.map(point => ({
  angle: point.angle,
  distance: point.distance,
  x: point.x,
  y: point.y,
  z: point.z
}));
```

## 🔄 Güncelleme Sıklığı

- **JSON veri görüntüleme**: Otomatik
- **Veri güncelleme**: Otomatik
- **Görselleştirme**: Gerçek zamanlı
- **İstatistikler**: Anlık hesaplama

## 📋 Örnek Dosyalar

- `sample_lidar_data.json`: Örnek LIDAR verisi
- `room_scan.json`: Oda tarama verisi
- `outdoor_scan.json`: Açık alan tarama verisi
