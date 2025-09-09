#!/usr/bin/env python3
"""
Python 3D LIDAR Görsel Sunucusu
Bu kod mobil uygulamada WebView ile görüntülenecek 3D LIDAR verilerini sunar.
"""

from flask import Flask, render_template_string, jsonify
import json
import random
import time
import math
from threading import Thread

app = Flask(__name__)

# 3D LIDAR verilerini simüle et
def generate_lidar_data():
    """3D LIDAR verilerini simüle eder"""
    points = []
    
    # 360 derece etrafında noktalar oluştur
    for angle in range(0, 360, 5):  # 5 derece aralıklarla
        distance = random.uniform(50, 200)  # 50-200 cm mesafe
        height = random.uniform(-10, 10)    # Yükseklik varyasyonu
        
        # 3D koordinatlara dönüştür
        x = distance * math.cos(math.radians(angle))
        y = distance * math.sin(math.radians(angle))
        z = height
        
        # Renk mesafeye göre belirle
        if distance < 100:
            color = [1, 0, 0]  # Kırmızı - yakın
        elif distance < 150:
            color = [1, 1, 0]  # Sarı - orta
        else:
            color = [0, 1, 0]  # Yeşil - uzak
            
        points.append({
            'x': x,
            'y': y,
            'z': z,
            'color': color,
            'distance': distance
        })
    
    return points

# HTML template (Three.js ile 3D görselleştirme)
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>3D LIDAR Görselleştirme</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: #000;
            overflow: hidden;
        }
        #container { 
            width: 100vw; 
            height: 100vh; 
        }
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 100;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <div id="info">
        <h3>3D LIDAR Görselleştirme</h3>
        <p>Nokta Sayısı: <span id="pointCount">0</span></p>
        <p>Mesafe: <span id="distance">0</span> cm</p>
    </div>

    <script>
        // Three.js sahne oluştur
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);
        document.getElementById('container').appendChild(renderer.domElement);

        // Işık ekle
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        scene.add(directionalLight);

        // LIDAR noktaları için grup
        const lidarGroup = new THREE.Group();
        scene.add(lidarGroup);

        // Kamera pozisyonu
        camera.position.set(0, 0, 300);
        camera.lookAt(0, 0, 0);

        // LIDAR verilerini güncelle
        function updateLidarData() {
            fetch('/api/lidar-data')
                .then(response => response.json())
                .then(data => {
                    // Eski noktaları temizle
                    lidarGroup.clear();
                    
                    // Yeni noktaları ekle
                    data.points.forEach(point => {
                        const geometry = new THREE.SphereGeometry(2, 8, 6);
                        const material = new THREE.MeshBasicMaterial({ 
                            color: new THREE.Color(point.color[0], point.color[1], point.color[2])
                        });
                        const sphere = new THREE.Mesh(geometry, material);
                        
                        sphere.position.set(point.x, point.y, point.z);
                        lidarGroup.add(sphere);
                    });
                    
                    // Bilgi güncelle
                    document.getElementById('pointCount').textContent = data.points.length;
                    document.getElementById('distance').textContent = 
                        data.points.length > 0 ? data.points[0].distance.toFixed(1) : '0';
                })
                .catch(error => {
                    console.error('LIDAR verisi alınamadı:', error);
                });
        }

        // Animasyon döngüsü
        function animate() {
            requestAnimationFrame(animate);
            
            // LIDAR grubunu döndür
            lidarGroup.rotation.y += 0.005;
            
            renderer.render(scene, camera);
        }

        // Pencere boyutu değişikliği
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Başlat
        updateLidarData();
        setInterval(updateLidarData, 1000); // Her saniye güncelle
        animate();
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Ana sayfa - 3D görselleştirme"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/lidar-data')
def get_lidar_data():
    """LIDAR verilerini JSON olarak döndür"""
    import math
    points = generate_lidar_data()
    return jsonify({
        'points': points,
        'timestamp': time.time(),
        'count': len(points)
    })

@app.route('/health')
def health():
    """Sunucu sağlık kontrolü"""
    return jsonify({'status': 'ok', 'message': '3D LIDAR sunucusu çalışıyor'})

if __name__ == '__main__':
    print("🚀 3D LIDAR Görsel Sunucusu başlatılıyor...")
    print("📱 Mobil uygulama için: http://10.0.2.2:8080")
    print("🌐 Tarayıcı için: http://localhost:8080")
    print("💡 Çıkmak için Ctrl+C")
    
    app.run(host='0.0.0.0', port=8080, debug=True)

