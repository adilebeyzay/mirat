import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// import { WebView } from 'react-native-webview'; // Geçici olarak kapatıldı
import { lidarAPI } from '../services/lidarAPI';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MappingScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lidarData, setLidarData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [mapScale, setMapScale] = useState(1);
  const [currentScanId, setCurrentScanId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Mock LIDAR verisi üretme
  const generateLidarData = useCallback(() => {
    const newData = [];
    for (let i = 0; i < 360; i += 5) {
      const distance = Math.random() * 500 + 50; // 50-550 cm
      const x = Math.cos(i * Math.PI / 180) * distance;
      const y = Math.sin(i * Math.PI / 180) * distance;
      
      newData.push({
        id: i,
        angle: i,
        distance: distance,
        x: x,
        y: y,
        timestamp: Date.now(),
      });
    }
    
    // Harita verilerini de güncelle
    const mapPoints = [];
    newData.forEach(point => {
      if (point.distance < 500) { // Sadece yakın noktaları haritaya ekle
        mapPoints.push({
          x: point.x,
          y: point.y,
          distance: point.distance,
        });
      }
    });
    
    setLidarData(newData);
    setMapData(mapPoints);
  }, []);


  useEffect(() => {
    if (isConnected) {
      fetchLidarData();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        generateLidarData();
      }, 2000); // Her 2 saniyede bir veri üret
      
      return () => clearInterval(interval);
    }
  }, [isScanning, generateLidarData]);

  const connectToRobot = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      Alert.alert('Bağlantı', 'Robot LIDAR sistemine bağlanıldı');
    }
  };

  const startScanning = async () => {
    if (!isConnected) {
      Alert.alert('Uyarı', 'Önce robot ile bağlantı kurun');
      return;
    }
    
    if (!isScanning) {
      try {
        setIsLoading(true);
        // Mock tarama başlatma
        setCurrentScanId('mock-scan-' + Date.now());
        setIsScanning(true);
        setScanProgress(0);
        Alert.alert('Başarılı', 'LIDAR taraması başlatıldı');
        
        // Tarama simülasyonu
        const interval = setInterval(async () => {
          setScanProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsScanning(false);
              return 100;
            }
            return prev + 2;
          });
        }, 100);
      } catch (error) {
        Alert.alert('Hata', 'Tarama başlatılamadı: ' + error.message);
        // Hata durumunda mock data kullan
        setIsScanning(true);
        setScanProgress(0);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Taramayı durdur
      try {
        // Mock tarama durdurma
        setIsScanning(false);
        Alert.alert('Bilgi', 'LIDAR taraması durduruldu');
      } catch (error) {
        console.error('Stop scan error:', error);
        setIsScanning(false);
      }
    }
  };


  // LIDAR verilerini API'ye gönder (Mock)
  const sendLidarData = async () => {
    try {
      // Mock veri gönderme
      console.log('LIDAR data sent successfully (mock)');
    } catch (error) {
      console.error('Send LIDAR data error:', error);
    }
  };

  // API'den LIDAR verilerini çek
  const fetchLidarData = async () => {
    try {
      // Backend çalışmadığı için mock data kullan
      generateLidarData();
    } catch (error) {
      console.error('Fetch LIDAR data error:', error);
      // Hata durumunda mock data kullan
      generateLidarData();
    }
  };

  const clearMap = async () => {
    try {
      // Mock temizlik işlemi
      setMapData([]);
      setLidarData([]);
      setScanProgress(0);
      setCurrentScanId(null);
      Alert.alert('Harita Temizlendi', 'Tüm harita verileri silindi');
    } catch (error) {
      // Hata durumunda local temizlik
      setMapData([]);
      setLidarData([]);
      setScanProgress(0);
      setCurrentScanId(null);
      Alert.alert('Harita Temizlendi', 'Tüm harita verileri silindi');
    }
  };

  const getDistanceColor = (distance) => {
    if (distance < 100) return '#f44336'; // Kırmızı - Çok yakın
    if (distance < 200) return '#ff9800'; // Turuncu - Yakın
    if (distance < 300) return '#ffeb3b'; // Sarı - Orta
    if (distance < 400) return '#8bc34a'; // Açık yeşil - Uzak
    return '#4caf50'; // Yeşil - Çok uzak
  };

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>LIDAR Haritalama</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.connectButton, isConnected && styles.connectedButton]}
              onPress={connectToRobot}>
              <Text style={styles.connectButtonText}>
                {isConnected ? 'Bağlı' : 'Bağlan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isConnected && (
          <>
            {/* Kontrol Paneli */}
            <View style={styles.controlPanel}>
              <Text style={styles.sectionTitle}>Kontrol Paneli</Text>
              
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={[styles.controlButton, isScanning && styles.activeButton]}
                  onPress={startScanning}>
                  <Ionicons 
                    name={isScanning ? "stop-circle" : "play-circle"} 
                    size={24} 
                    color="#fff" 
                  />
                  <Text style={styles.controlButtonText}>
                    {isScanning ? 'Durdur' : 'Tara'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.clearButton]}
                  onPress={clearMap}>
                  <Ionicons name="trash" size={24} color="#fff" />
                  <Text style={styles.controlButtonText}>Temizle</Text>
                </TouchableOpacity>
              </View>

              {/* Tarama İlerlemesi */}
              {isScanning && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Tarama İlerlemesi: {scanProgress}%</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${scanProgress}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>

            {/* LIDAR Veri Görselleştirmesi */}
            <View style={styles.lidarContainer}>
              <Text style={styles.sectionTitle}>3D LIDAR Görselleştirmesi</Text>
              
              {/* Tam ekran 3D görsel alanı */}
              <View style={[
                styles.threeDContainer,
                fullscreen && {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: screenHeight,
                  width: screenWidth,
                  zIndex: 1000,
                  borderRadius: 0,
                  marginBottom: 0,
                }
              ]}>
                {/* Python kodundan gelecek 3D görsel */}
                <View style={styles.threeDView}>
                  <Text style={styles.threeDPlaceholder}>
                    3D LIDAR Görseli
                  </Text>
                  <Text style={styles.threeDSubtext}>
                    {isConnected 
                      ? 'Python işleme kodundan gelecek 3D görsel' 
                      : 'Robot bağlantısı kurulduğunda Python işleme kodundan gelecek'
                    }
                  </Text>
                  {isConnected && (
                    <TouchableOpacity
                      style={styles.openBrowserButton}
                      onPress={() => {
                        // Python 3D görselini tarayıcıda aç
                        Alert.alert(
                          '3D Görsel',
                          'Python kodunuzun 3D görselini tarayıcıda açmak için: http://10.0.2.2:8080/lidar-3d',
                          [{ text: 'Tamam' }]
                        );
                      }}>
                      <Text style={styles.openBrowserText}>
                        Tarayıcıda Aç
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Kontrol paneli */}
              {!fullscreen && (
                <View style={styles.controlPanel}>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={[styles.controlButton, styles.fullscreenButton]}
                      onPress={() => setFullscreen(!fullscreen)}>
                      <Ionicons name={fullscreen ? "contract" : "expand"} size={24} color="#fff" />
                      <Text style={styles.controlButtonText}>
                        {fullscreen ? 'Küçült' : 'Tam Ekran'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.controlButton, styles.rotateButton]}
                      onPress={() => setRotation(rotation + 90)}>
                      <Ionicons name="refresh" size={24} color="#fff" />
                      <Text style={styles.controlButtonText}>Döndür</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {/* Tam ekran modunda çıkış butonu */}
              {fullscreen && (
                <TouchableOpacity
                  style={styles.exitFullscreenButton}
                  onPress={() => setFullscreen(false)}>
                  <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Harita Verileri */}
            <View style={styles.mapDataContainer}>
              <Text style={styles.sectionTitle}>Harita Verileri</Text>
              
              <View style={styles.mapStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{lidarData.length}</Text>
                  <Text style={styles.statLabel}>LIDAR Noktası</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{mapData.length}</Text>
                  <Text style={styles.statLabel}>Harita Noktası</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {lidarData.length > 0 ? 
                      (lidarData.reduce((sum, point) => sum + point.distance, 0) / lidarData.length).toFixed(1) 
                      : '0'
                    }cm
                  </Text>
                  <Text style={styles.statLabel}>Ortalama Mesafe</Text>
                </View>
              </View>

              {/* Son LIDAR Verileri */}
              <View style={styles.recentDataContainer}>
                <Text style={styles.recentDataTitle}>Son LIDAR Verileri</Text>
                {lidarData.slice(-10).reverse().map((point, index) => (
                  <View key={index} style={styles.dataItem}>
                    <Text style={styles.dataAngle}>{point.angle}°</Text>
                    <Text style={styles.dataDistance}>{point.distance.toFixed(1)}cm</Text>
                    <View 
                      style={[
                        styles.dataColor, 
                        { backgroundColor: getDistanceColor(point.distance) }
                      ]} 
                    />
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {!isConnected && (
          <View style={styles.disconnectedContainer}>
            <Ionicons name="map-outline" size={80} color="#ccc" />
            <Text style={styles.disconnectedText}>
              Robot bağlantısı kurulmadı
            </Text>
            <Text style={styles.disconnectedSubtext}>
              LIDAR haritalama verilerini görüntülemek için robot ile bağlantı kurun
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  connectButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  connectedButton: {
    backgroundColor: '#4caf50',
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  controlPanel: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#f44336',
  },
  clearButton: {
    backgroundColor: '#ff9800',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  lidarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // 3D Görselleştirme Stilleri
  threeDContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 15,
    overflow: 'hidden',
  },
  threeDView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    margin: 10,
  },
  threeDPlaceholder: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  threeDSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  controlPanel: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  fullscreenButton: {
    backgroundColor: '#4caf50',
    flex: 1,
    marginRight: 10,
  },
  rotateButton: {
    backgroundColor: '#ff9800',
    flex: 1,
    marginLeft: 10,
  },
  exitFullscreenButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  openBrowserButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  openBrowserText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapDataContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recentDataContainer: {
    marginTop: 15,
  },
  recentDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataAngle: {
    fontSize: 14,
    color: '#333',
    width: 50,
  },
  dataDistance: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  dataColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  disconnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  disconnectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  disconnectedSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default MappingScreen;
