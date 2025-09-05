import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraDataScreen({navigation}) {
  const [normalCameraData, setNormalCameraData] = useState([]);
  const [thermalCameraData, setThermalCameraData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  // Manuel görüntü alma - sadece kayıt sırasında
  const captureImage = () => {
    if (isRecording) {
      const timestamp = new Date().toLocaleTimeString();
      
      // Normal kamera görüntüsü
      const normalData = {
        id: `normal_${Date.now()}`,
        timestamp: timestamp,
          imageUri: `https://picsum.photos/400/300?random=${Date.now()}`,
        type: 'normal',
          status: 'active',
        };
      
      // Termal kamera görüntüsü
      const thermalData = {
        id: `thermal_${Date.now()}`,
        timestamp: timestamp,
        imageUri: `https://picsum.photos/400/300?random=${Date.now() + 1}`,
        type: 'thermal',
        status: 'active',
      };
      
      setNormalCameraData((prev) => [normalData, ...prev.slice(0, 9)]);
      setThermalCameraData((prev) => [thermalData, ...prev.slice(0, 9)]);
    }
  };

  const connectToRobot = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      Alert.alert('Bağlantı', 'Robot kameralarına bağlanıldı');
    }
  };

  const startRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingStartTime(new Date());
      Alert.alert('Kayıt Başlatıldı', 'Normal ve termal kameralar kayıt yapmaya başladı');
    } else {
      setIsRecording(false);
      setRecordingStartTime(null);
      Alert.alert('Kayıt Durduruldu', 'Kayıt başarıyla durduruldu');
    }
  };

  const openFullScreen = (imageUri, imageType) => {
    setFullScreenImage({ uri: imageUri, type: imageType });
    setShowFullScreen(true);
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
    setFullScreenImage(null);
  };

  const getCameraStatus = () => {
    const totalImages = normalCameraData.length + thermalCameraData.length;
    return {
      total: totalImages,
      recording: isRecording ? 2 : 0, // Normal ve termal kamera
      lastUpdate: normalCameraData[0]?.timestamp || thermalCameraData[0]?.timestamp || 'N/A',
    };
  };

  const status = getCameraStatus();

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Kamera Verileri</Text>
          <TouchableOpacity
            style={[styles.connectButton, isConnected && styles.connectedButton]}
            onPress={connectToRobot}>
            <Text style={styles.connectButtonText}>
              {isConnected ? 'Bağlı' : 'Bağlan'}
            </Text>
          </TouchableOpacity>
        </View>

        {isConnected ? (
          <>
            {/* Kamera Kontrolleri */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPress={startRecording}>
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Kaydı Durdur' : 'Kayıt Başlat'}
                </Text>
              </TouchableOpacity>
              
              {isRecording && (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={captureImage}>
                  <Text style={styles.captureButtonText}>Görüntü Al</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Kamera Durumu */}
            <View style={styles.statusContainer}>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Toplam Görüntü</Text>
                <Text style={styles.statusValue}>{status.total}</Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Kayıt Yapan Kamera</Text>
                <Text style={styles.statusValue}>{status.recording}</Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Son Güncelleme</Text>
                <Text style={styles.statusValue}>{status.lastUpdate}</Text>
              </View>
            </View>

            {/* Normal Kamera Görüntüsü */}
            <View style={styles.liveViewContainer}>
              <Text style={styles.liveViewTitle}>Normal Kamera</Text>
              <TouchableOpacity 
                style={styles.liveViewFrame}
                onPress={() => normalCameraData.length > 0 && openFullScreen(normalCameraData[0].imageUri, 'normal')}
                activeOpacity={0.8}>
                {normalCameraData.length > 0 ? (
                  <Image
                    source={{ uri: normalCameraData[0].imageUri }}
                    style={styles.liveImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>Görüntü alınmadı</Text>
                  </View>
                )}
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>KAYIT</Text>
                  </View>
                )}
                <View style={styles.fullScreenHint}>
                  <Ionicons name="expand" size={20} color="#fff" />
                  <Text style={styles.fullScreenHintText}>Tam ekran için dokunun</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Termal Kamera Görüntüsü */}
            <View style={styles.liveViewContainer}>
              <Text style={styles.liveViewTitle}>Termal Kamera</Text>
              <TouchableOpacity 
                style={styles.liveViewFrame}
                onPress={() => thermalCameraData.length > 0 && openFullScreen(thermalCameraData[0].imageUri, 'thermal')}
                activeOpacity={0.8}>
                {thermalCameraData.length > 0 ? (
                  <Image
                    source={{ uri: thermalCameraData[0].imageUri }}
                    style={styles.liveImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>Görüntü alınmadı</Text>
                  </View>
                )}
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>KAYIT</Text>
                  </View>
                )}
                <View style={styles.fullScreenHint}>
                  <Ionicons name="expand" size={20} color="#fff" />
                  <Text style={styles.fullScreenHintText}>Tam ekran için dokunun</Text>
              </View>
              </TouchableOpacity>
            </View>

            {/* Görüntü Geçmişi */}
            <View style={styles.historyContainer}>
              <TouchableOpacity
                style={styles.historyTitleContainer}
                onPress={() => navigation.navigate('Gallery')}
                activeOpacity={0.7}>
                <Text style={styles.historyTitle}>Son Görüntüler</Text>
                <Ionicons name="chevron-forward" size={20} color="#2196F3" />
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[...normalCameraData, ...thermalCameraData]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 10)
                  .map((data) => (
                    <TouchableOpacity 
                      key={data.id} 
                      style={styles.historyImageContainer}
                      onPress={() => openFullScreen(data.imageUri, data.type)}
                      activeOpacity={0.8}>
                    <Image
                      source={{ uri: data.imageUri }}
                      style={styles.historyImage}
                      resizeMode="cover"
                    />
                    <View style={styles.historyImageInfo}>
                        <Text style={styles.historyImageTime}>{data.timestamp}</Text>
                        <Text style={styles.historyImageType}>
                          {data.type === 'normal' && 'Normal'}
                          {data.type === 'thermal' && 'Termal'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.disconnectedContainer}>
            <Text style={styles.disconnectedText}>
              Robot kameralarına bağlantı kurulmadı
            </Text>
            <Text style={styles.disconnectedSubtext}>
              Kamera verilerini görüntülemek için robot ile bağlantı kurun
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Tam Ekran Görüntü Modal */}
      <Modal
        visible={showFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreen}>
        <View style={styles.fullScreenModal}>
          <TouchableOpacity 
            style={styles.fullScreenCloseButton}
            onPress={closeFullScreen}
            activeOpacity={0.8}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          {fullScreenImage && (
            <View style={styles.fullScreenImageContainer}>
              <Image
                source={{ uri: fullScreenImage.uri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
              <View style={styles.fullScreenInfo}>
                <Text style={styles.fullScreenCameraType}>
                  {fullScreenImage.type === 'normal' ? 'Normal Kamera' : 'Termal Kamera'}
                </Text>
                <Text style={styles.fullScreenTimestamp}>
                  {new Date().toLocaleTimeString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

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
  controlsContainer: {
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
  captureButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recordButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#4caf50',
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  liveViewContainer: {
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
  liveViewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  liveViewFrame: {
    position: 'relative',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  liveImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#fff',
    fontSize: 16,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f44336',
    marginRight: 5,
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyContainer: {
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
  historyTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyImageContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  historyImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  historyImageInfo: {
    marginTop: 5,
    alignItems: 'center',
  },
  historyImageTime: {
    fontSize: 10,
    color: '#666',
  },
  historyImageType: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  disconnectedSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fullScreenHint: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fullScreenHintText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  fullScreenInfo: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullScreenCameraType: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fullScreenTimestamp: {
    color: '#ccc',
    fontSize: 14,
  },
});