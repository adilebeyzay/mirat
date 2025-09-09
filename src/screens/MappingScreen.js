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
// import { WebView } from 'react-native-webview'; // Geçici olarak kaldırıldı
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
  const [jsonData, setJsonData] = useState(null);
  const [jsonFileName, setJsonFileName] = useState('');

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
  }, [isScanning]); // generateLidarData dependency'sini kaldırdık

  const connectToRobot = () => {
    try {
      setIsConnected(!isConnected);
      if (!isConnected) {
        Alert.alert('Bağlantı', 'Robot LIDAR sistemine bağlanıldı');
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      Alert.alert('Hata', 'Bağlantı kurulurken hata oluştu');
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
      
      {/* Tam ekran modunda sadece 3D görsel */}
      {fullscreen && isConnected && (
        <View style={styles.fullscreenContainer}>
          <WebView
            source={{ 
              uri: 'http://10.0.2.2:8080/lidar-3d'
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              Alert.alert('Bağlantı Hatası', '3D görsel sunucusuna bağlanılamıyor. Python sunucusunu başlatın.');
            }}
            onShouldStartLoadWithRequest={(request) => {
              // Sadece güvenli URL'lere izin ver
              return request.url.startsWith('http://10.0.2.2:8080/');
            }}
            style={styles.fullscreenWebView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="compatibility"
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
            }}
            onLoadStart={() => {
              console.log('3D görsel yükleniyor...');
            }}
            onLoadEnd={() => {
              console.log('3D görsel yüklendi!');
            }}
            renderError={(errorDomain, errorCode, errorDesc) => (
              <View style={styles.webViewError}>
                <Text style={styles.errorText}>
                  3D Görsel Yüklenemedi
                </Text>
                <Text style={styles.errorSubtext}>
                  Python sunucusu çalışıyor mu kontrol edin
                </Text>
                <Text style={styles.errorUrl}>
                  http://10.0.2.2:8080/lidar-3d
                </Text>
              </View>
            )}
          />
          
          {/* Tam ekran çıkış butonu */}
          <TouchableOpacity
            style={styles.exitFullscreenButton}
            onPress={() => setFullscreen(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Normal mod - tüm içerik */}
      <ScrollView style={[
        styles.container,
        fullscreen && { display: 'none' }
      ]}>
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

        {/* JSON Veri Bilgileri - Sadece veri varsa göster */}
        {jsonData && (
          <View style={styles.jsonInfoContainer}>
            <Text style={styles.jsonInfoTitle}>LIDAR Veri Bilgileri</Text>
            <View style={styles.jsonInfoGrid}>
              <View style={styles.jsonInfoItem}>
                <Text style={styles.jsonInfoLabel}>Tarama ID:</Text>
                <Text style={styles.jsonInfoValue}>{jsonData.scanId || 'N/A'}</Text>
              </View>
              <View style={styles.jsonInfoItem}>
                <Text style={styles.jsonInfoLabel}>LIDAR Noktaları:</Text>
                <Text style={styles.jsonInfoValue}>{jsonData.lidarPoints?.length || 0}</Text>
              </View>
              <View style={styles.jsonInfoItem}>
                <Text style={styles.jsonInfoLabel}>Ortalama Mesafe:</Text>
                <Text style={styles.jsonInfoValue}>
                  {jsonData.statistics?.averageDistance?.toFixed(1) || '0'} cm
                </Text>
              </View>
              <View style={styles.jsonInfoItem}>
                <Text style={styles.jsonInfoLabel}>Maksimum Mesafe:</Text>
                <Text style={styles.jsonInfoValue}>
                  {jsonData.statistics?.maxDistance || '0'} cm
                </Text>
              </View>
            </View>
          </View>
        )}

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
              
              {/* 3D görsel alanı */}
              <View style={styles.threeDContainer}>
                {/* Python kodundan gelecek 3D görsel */}
                {isConnected ? (
                  <View style={styles.mock3DContainer}>
                    <View style={styles.mock3DContent}>
                      <Ionicons name="cube" size={60} color="#4CAF50" />
                      <Text style={styles.mock3DTitle}>3D LIDAR Görseli</Text>
                      <Text style={styles.mock3DSubtext}>
                        Python sunucusu çalıştırıldığında gerçek 3D görsel burada görünecek
                      </Text>
                      <View style={styles.mock3DGrid}>
                        {[...Array(8)].map((_, i) => (
                          <View key={i} style={[styles.mock3DGridItem, { 
                            backgroundColor: i % 2 === 0 ? '#4CAF50' : '#8BC34A',
                            opacity: 0.3 + (i * 0.1)
                          }]} />
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.threeDView}>
                    <Text style={styles.threeDPlaceholder}>
                      3D LIDAR Görseli
                    </Text>
                    <Text style={styles.threeDSubtext}>
                      Robot bağlantısı kurulduğunda Python işleme kodundan gelecek
                    </Text>
                  </View>
                )}

                {/* Tam ekran butonu - 3D görsel alanının üst köşesinde */}
                {isConnected && (
                  <TouchableOpacity
                    style={styles.fullscreenToggleButton}
                    onPress={() => setFullscreen(!fullscreen)}>
                    <Ionicons 
                      name={fullscreen ? "contract" : "expand"} 
                      size={24} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Kontrol paneli - sadece normal modda göster */}
              {!fullscreen && (
                <View style={styles.controlPanel}>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={[styles.controlButton, styles.rotateButton]}
                      onPress={() => setRotation(rotation + 90)}>
                      <Ionicons name="refresh" size={24} color="#fff" />
                      <Text style={styles.controlButtonText}>Döndür</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Harita Verileri - sadece normal modda göster */}
            {!fullscreen && (
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
            )}
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
  jsonInfoContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jsonInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  jsonInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  jsonInfoItem: {
    width: '48%',
    marginBottom: 10,
  },
  jsonInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  jsonInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
    position: 'relative',
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
  webViewError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorUrl: {
    fontSize: 12,
    color: '#2196F3',
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
  },
  fullscreenToggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  fullscreenWebView: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
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
  mock3DContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mock3DContent: {
    alignItems: 'center',
  },
  mock3DTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    marginBottom: 5,
  },
  mock3DSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  mock3DGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 120,
  },
  mock3DGridItem: {
    width: 20,
    height: 20,
    margin: 2,
    borderRadius: 10,
  },
  fullscreenMock3D: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  fullscreenMockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 10,
  },
  fullscreenMockSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
  },
  fullscreenMockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 200,
  },
  fullscreenMockGridItem: {
    width: 30,
    height: 30,
    margin: 3,
    borderRadius: 15,
  },
});

export default MappingScreen;
