import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Accelerometer} from 'expo-sensors';
import Slider from '@react-native-community/slider';
import websocketService from '../services/websocketService';

const {width: screenWidth} = Dimensions.get('window');

const MovementControlScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isControlling, setIsControlling] = useState(false);
  const [speed, setSpeed] = useState(25); // Hız değeri (0-50 km/h)
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  // İvmeölçer verilerini dinle
  useEffect(() => {
    if (isConnected) {
      Accelerometer.setUpdateInterval(100);
      const newSubscription = Accelerometer.addListener(accelerometerData => {
        setAccelerometerData(accelerometerData);
      });
      setSubscription(newSubscription);
    } else {
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isConnected]);

  const connectToRobot = async () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      Alert.alert('Başarılı', 'Robot hareket kontrol sistemine bağlanıldı');
    } else {
      Alert.alert('Bilgi', 'Robot hareket kontrol bağlantısı kesildi');
    }
  };

  const startControl = () => {
    setIsControlling(!isControlling);
    Alert.alert(
      'Kontrol',
      isControlling ? 'Robot kontrolü durduruldu' : 'Robot kontrolü başlatıldı'
    );
  };

  const sendMovementCommand = (direction) => {
    if (!isControlling) {
      Alert.alert('Uyarı', 'Önce robot kontrolünü başlatın');
      return;
    }
    
    // WebSocket üzerinden motor komutu gönder (bağlantı kontrolü yok)
    const command = direction === 'İleri' ? 'forward' :
                   direction === 'Geri' ? 'backward' :
                   direction === 'Sol' ? 'left' :
                   direction === 'Sağ' ? 'right' : 'stop';
    
    // WebSocket bağlantısı varsa komut gönder, yoksa sadece alert göster
    if (websocketService.getConnectionStatus()) {
      websocketService.sendMotorCommand(command);
    }
    Alert.alert('Hareket Komutu', `${direction} yönüne hareket başlatıldı - Hız: ${speed} km/h`);
  };

  const handleSpeedChange = (value) => {
    // 5'in katlarına yuvarla
    const roundedValue = Math.round(value / 5) * 5;
    setSpeed(roundedValue);
  };

  const getAccelerometerStatus = () => {
    const {x, y, z} = accelerometerData;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    if (magnitude > 1.5) {
      return {status: 'high', color: '#f44336', text: 'Yüksek'};
    } else if (magnitude > 1.0) {
      return {status: 'medium', color: '#ff9800', text: 'Orta'};
    } else {
      return {status: 'low', color: '#4caf50', text: 'Düşük'};
    }
  };

  const accelerometerStatus = getAccelerometerStatus();

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Hareket Kontrol</Text>
          <TouchableOpacity
            style={[styles.connectButton, isConnected && styles.connectedButton]}
            onPress={connectToRobot}>
            <Text style={styles.connectButtonText}>
              {isConnected ? 'Bağlı' : 'Bağlan'}
            </Text>
          </TouchableOpacity>
        </View>

        {isConnected && (
          <>
            {/* İvmeölçer Verileri */}
            <View style={styles.accelerometerContainer}>
              <Text style={styles.sectionTitle}>İvmeölçer Verileri</Text>
              <View style={styles.accelerometerGrid}>
                <View style={styles.accelerometerCard}>
                  <Text style={styles.accelerometerLabel}>X Ekseni</Text>
                  <Text style={styles.accelerometerValue}>
                    {accelerometerData.x.toFixed(3)}
                  </Text>
                </View>
                <View style={styles.accelerometerCard}>
                  <Text style={styles.accelerometerLabel}>Y Ekseni</Text>
                  <Text style={styles.accelerometerValue}>
                    {accelerometerData.y.toFixed(3)}
                  </Text>
                </View>
                <View style={styles.accelerometerCard}>
                  <Text style={styles.accelerometerLabel}>Z Ekseni</Text>
                  <Text style={styles.accelerometerValue}>
                    {accelerometerData.z.toFixed(3)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Hareket Durumu</Text>
                <View style={[styles.statusIndicator, {backgroundColor: accelerometerStatus.color}]}>
                  <Text style={styles.statusText}>{accelerometerStatus.text}</Text>
                </View>
              </View>
            </View>

            {/* Robot Kontrol Arayüzü */}
            <View style={styles.controlContainer}>
              <Text style={styles.sectionTitle}>Robot Kontrol</Text>
              
              <TouchableOpacity
                style={[styles.controlToggleButton, isControlling && styles.controllingButton]}
                onPress={startControl}>
                <Text style={styles.controlToggleText}>
                  {isControlling ? 'Kontrolü Durdur' : 'Kontrolü Başlat'}
                </Text>
              </TouchableOpacity>

              {isControlling && (
                <>
                <View style={styles.directionControls}>
                  {/* Üst Yön Butonu */}
                  <View style={styles.directionRow}>
                    <TouchableOpacity
                      style={[styles.directionButton, styles.forwardButton]}
                      onPress={() => sendMovementCommand('İleri')}>
                      <Text style={styles.directionButtonText}>↑</Text>
                      <Text style={styles.directionButtonLabel}>İleri</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Orta Yön Butonları */}
                  <View style={styles.directionRow}>
                    <TouchableOpacity
                      style={[styles.directionButton, styles.leftButton]}
                      onPress={() => sendMovementCommand('Sol')}>
                      <Text style={styles.directionButtonText}>←</Text>
                      <Text style={styles.directionButtonLabel}>Sol</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.centerButton}>
                      <Text style={styles.centerButtonText}>STOP</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.directionButton, styles.rightButton]}
                      onPress={() => sendMovementCommand('Sağ')}>
                      <Text style={styles.directionButtonText}>→</Text>
                      <Text style={styles.directionButtonLabel}>Sağ</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Alt Yön Butonu */}
                  <View style={styles.directionRow}>
                    <TouchableOpacity
                      style={[styles.directionButton, styles.backwardButton]}
                      onPress={() => sendMovementCommand('Geri')}>
                      <Text style={styles.directionButtonText}>↓</Text>
                      <Text style={styles.directionButtonLabel}>Geri</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Hız Kontrolü */}
                <View style={styles.speedContainer}>
                  <Text style={styles.speedTitle}>Hız Kontrolü</Text>
                  <View style={styles.speedSliderContainer}>
                    <Text style={styles.speedLabel}>0</Text>
                    <Slider
                      style={styles.speedSlider}
                      minimumValue={0}
                      maximumValue={50}
                      value={speed}
                      onValueChange={handleSpeedChange}
                      step={5}
                      minimumTrackTintColor="#2196F3"
                      maximumTrackTintColor="#e0e0e0"
                      thumbStyle={styles.sliderThumb}
                    />
                    <Text style={styles.speedLabel}>50</Text>
                  </View>
                  <View style={styles.speedValueContainer}>
                    <Text style={styles.speedValue}>{speed} km/h</Text>
                  </View>
                </View>
                </>
              )}
            </View>

            {/* Hareket Geçmişi */}
            <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>Son Hareketler</Text>
              <View style={styles.historyList}>
                <View style={styles.historyItem}>
                  <Text style={styles.historyTime}>14:32:15</Text>
                  <Text style={styles.historyAction}>İleri hareket</Text>
                </View>
                <View style={styles.historyItem}>
                  <Text style={styles.historyTime}>14:31:45</Text>
                  <Text style={styles.historyAction}>Sol dönüş</Text>
                </View>
                <View style={styles.historyItem}>
                  <Text style={styles.historyTime}>14:31:20</Text>
                  <Text style={styles.historyAction}>Geri hareket</Text>
                </View>
                <View style={styles.historyItem}>
                  <Text style={styles.historyTime}>14:30:55</Text>
                  <Text style={styles.historyAction}>Sağ dönüş</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {!isConnected && (
          <View style={styles.disconnectedContainer}>
            <Text style={styles.disconnectedText}>
              Robot hareket sistemine bağlantı kurulmadı
            </Text>
            <Text style={styles.disconnectedSubtext}>
              Hareket kontrolü için robot ile bağlantı kurun
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
  accelerometerContainer: {
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
  accelerometerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  accelerometerCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  accelerometerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  accelerometerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlContainer: {
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
  controlToggleButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  controllingButton: {
    backgroundColor: '#f44336',
  },
  controlToggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  directionControls: {
    alignItems: 'center',
  },
  directionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  directionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  forwardButton: {
    backgroundColor: '#4caf50',
  },
  backwardButton: {
    backgroundColor: '#ff9800',
  },
  leftButton: {
    backgroundColor: '#2196F3',
  },
  rightButton: {
    backgroundColor: '#9c27b0',
  },
  directionButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  directionButtonLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  centerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  centerButtonText: {
    fontSize: 12,
    color: '#fff',
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
  historyList: {
    marginTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
    width: 80,
  },
  historyAction: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 10,
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
  speedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  speedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  speedSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  speedLabel: {
    fontSize: 12,
    color: '#666',
    width: 35,
    textAlign: 'center',
  },
  speedSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderThumb: {
    backgroundColor: '#2196F3',
    width: 20,
    height: 20,
  },
  speedValueContainer: {
    alignItems: 'center',
  },
  speedValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default MovementControlScreen;
