import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {StatusBar} from 'expo-status-bar';
import {useFocusEffect} from '@react-navigation/native';

const {width: screenWidth} = Dimensions.get('window');

const SensorDataScreen = () => {
  const [sensorData, setSensorData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [co2Level, setCo2Level] = useState(0);
  const [flammableGasLevel, setFlammableGasLevel] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  const [ultrasonicData, setUltrasonicData] = useState({
    left: 0,
    right: 0,
  });

  // Sayfa odak durumunu takip et
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  // Mock data - gerçek uygulamada robot API'sinden gelecek
  useEffect(() => {
    if (!isConnected || !isScreenFocused) return; // Bağlı değilse veya sayfa odakta değilse veri üretme

    const generateMockData = () => {
      const newCo2Level = Math.random() * 100;
      const newFlammableGasLevel = Math.random() * 100;
      
      // Gaz seviyesi uyarıları - sadece sayfa odakta iken
      if (isScreenFocused) {
        // Karbondioksit uyarıları
        if (newCo2Level >= 70 && co2Level < 70) {
          // Kritik seviyeye çıktı (direkt veya 20'den sonra)
          Alert.alert('Kritik Uyarı', 'Karbondioksit seviyesi kritik düzeyde!');
        } else if (newCo2Level >= 20 && co2Level < 20) {
          // Sadece 20'ye çıktı (70'e çıkmadı)
          Alert.alert('Uyarı', 'Karbondioksit seviyesi artıyor!');
        }
        
        // Yanıcı gaz uyarıları
        if (newFlammableGasLevel >= 70 && flammableGasLevel < 70) {
          // Kritik seviyeye çıktı (direkt veya 20'den sonra)
          Alert.alert('Kritik Uyarı', 'Yanıcı gaz seviyesi kritik düzeyde!');
        } else if (newFlammableGasLevel >= 20 && flammableGasLevel < 20) {
          // Sadece 20'ye çıktı (70'e çıkmadı)
          Alert.alert('Uyarı', 'Yanıcı gaz seviyesi artıyor!');
        }
      }

      setCo2Level(newCo2Level);
      setFlammableGasLevel(newFlammableGasLevel);

      const newData = {
        co2Level: newCo2Level,
        flammableGasLevel: newFlammableGasLevel,
        ultrasonicData: {
          left: Math.random() * 200 + 10, // 10-210 cm
          right: Math.random() * 200 + 10,
        },
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setUltrasonicData(newData.ultrasonicData);
      setSensorData(prev => [...prev.slice(-19), newData]);
    };

    const interval = setInterval(generateMockData, 10000);
    return () => clearInterval(interval);
  }, [isConnected, isScreenFocused, co2Level, flammableGasLevel]);

  const chartData = {
    labels: sensorData.slice(-6).map(data => data.timestamp.split(':').slice(1).join(':')),
    datasets: [
      {
        data: sensorData.slice(-6).map(data => data.co2Level),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: sensorData.slice(-6).map(data => data.flammableGasLevel),
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const connectToRobot = () => {
    setIsConnected(!isConnected);
  };

  const getLatestData = () => {
    return sensorData[sensorData.length - 1] || {
      co2Level: 0,
      flammableGasLevel: 0,
      ultrasonicData: { left: 0, right: 0 },
      timestamp: 'N/A',
    };
  };

  const getGasLevelStatus = (level) => {
    if (level < 20) {
      return { status: 'Düşük', color: '#4caf50' };
    } else if (level <= 70) {
      return { status: 'Orta', color: '#ff9800' };
    } else {
      return { status: 'Yüksek', color: '#f44336' };
    }
  };

  const getUltrasonicColor = (distance) => {
    if (distance < 50) return '#f44336'; // Kırmızı - Çok yakın
    if (distance < 100) return '#ff9800'; // Turuncu - Yakın
    if (distance < 150) return '#ffeb3b'; // Sarı - Orta
    return '#4caf50'; // Yeşil - Uzak
  };

  const latestData = getLatestData();
  const co2Status = getGasLevelStatus(co2Level);
  const flammableGasStatus = getGasLevelStatus(flammableGasLevel);

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sensör Verileri</Text>
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
            {/* Gaz Sensörleri */}
            <View style={styles.gasSensorsContainer}>
              <Text style={styles.sectionTitle}>Gaz Sensörleri</Text>
              
              {/* Karbondioksit Sensörü */}
              <View style={styles.gasSensorCard}>
                <Text style={styles.gasSensorLabel}>1. Gaz Sensörü: Karbondioksit Düzeyi</Text>
                <View style={styles.gasLevelContainer}>
                  <Text style={styles.gasLevelValue}>{co2Level.toFixed(1)}%</Text>
                  <Text style={[styles.gasLevelStatus, { color: co2Status.color }]}>
                    {co2Status.status}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${co2Level}%`, 
                        backgroundColor: co2Status.color 
                      }
                    ]} 
                  />
                </View>
              </View>

              {/* Yanıcı Gaz Sensörü */}
              <View style={styles.gasSensorCard}>
                <Text style={styles.gasSensorLabel}>2. Gaz Sensörü: Yanıcı Gaz Düzeyi</Text>
                <View style={styles.gasLevelContainer}>
                  <Text style={styles.gasLevelValue}>{flammableGasLevel.toFixed(1)}%</Text>
                  <Text style={[styles.gasLevelStatus, { color: flammableGasStatus.color }]}>
                    {flammableGasStatus.status}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${flammableGasLevel}%`, 
                        backgroundColor: flammableGasStatus.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Ultrasonik Sensör */}
            <View style={styles.ultrasonicContainer}>
              <Text style={styles.sectionTitle}>Ultrasonik Sensör - Mesafe Algılama</Text>
              <View style={styles.ultrasonicGrid}>
                <View style={styles.ultrasonicCard}>
                  <Text style={styles.ultrasonicLabel}>Sol</Text>
                  <View style={styles.ultrasonicVisual}>
                    <View style={styles.ultrasonicRings}>
                      {/* 5. Yay (En dış) */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring5,
                        { borderColor: ultrasonicData.left > 160 ? '#4caf50' : '#e0e0e0' }
                      ]} />
                      {/* 4. Yay */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring4,
                        { borderColor: ultrasonicData.left > 120 && ultrasonicData.left <= 160 ? '#8bc34a' : '#e0e0e0' }
                      ]} />
                      {/* 3. Yay */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring3,
                        { borderColor: ultrasonicData.left > 80 && ultrasonicData.left <= 120 ? '#ffeb3b' : '#e0e0e0' }
                      ]} />
                      {/* 2. Yay */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring2,
                        { borderColor: ultrasonicData.left > 40 && ultrasonicData.left <= 80 ? '#ff9800' : '#e0e0e0' }
                      ]} />
                      {/* 1. Yay (En iç) */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring1,
                        { borderColor: ultrasonicData.left <= 40 ? '#f44336' : '#e0e0e0' }
                      ]} />
                      {/* Merkez nokta */}
                      <View style={styles.ultrasonicCenter} />
                    </View>
                  </View>
                  <Text style={styles.ultrasonicDistance}>
                    {ultrasonicData.left.toFixed(1)} cm
                  </Text>
                </View>

                <View style={styles.ultrasonicCard}>
                  <Text style={styles.ultrasonicLabel}>Sağ</Text>
                  <View style={styles.ultrasonicVisual}>
                    <View style={styles.ultrasonicRings}>
                      {/* 5. Yay (En dış) */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring5,
                        { borderColor: ultrasonicData.right > 160 ? '#4caf50' : '#e0e0e0' }
                      ]} />
                      {/* 4. Yay */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring4,
                        { borderColor: ultrasonicData.right > 120 && ultrasonicData.right <= 160 ? '#8bc34a' : '#e0e0e0' }
                      ]} />
                      {/* 3. Yay */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring3,
                        { borderColor: ultrasonicData.right > 80 && ultrasonicData.right <= 120 ? '#ffeb3b' : '#e0e0e0' }
                      ]} />
                      {/* 2. Yay */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring2,
                        { borderColor: ultrasonicData.right > 40 && ultrasonicData.right <= 80 ? '#ff9800' : '#e0e0e0' }
                      ]} />
                      {/* 1. Yay (En iç) */}
                      <View style={[
                        styles.ultrasonicRing,
                        styles.ring1,
                        { borderColor: ultrasonicData.right <= 40 ? '#f44336' : '#e0e0e0' }
                      ]} />
                      {/* Merkez nokta */}
                      <View style={styles.ultrasonicCenter} />
                    </View>
                  </View>
                  <Text style={styles.ultrasonicDistance}>
                    {ultrasonicData.right.toFixed(1)} cm
                  </Text>
                </View>
              </View>
              
              {/* Renk Açıklaması */}
              <View style={styles.colorLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#f44336' }]} />
                  <Text style={styles.legendText}>Çok Yakın (&lt;40cm)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#ff9800' }]} />
                  <Text style={styles.legendText}>Yakın (40-80cm)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#ffeb3b' }]} />
                  <Text style={styles.legendText}>Orta (80-120cm)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#8bc34a' }]} />
                  <Text style={styles.legendText}>Uzak (120-160cm)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#4caf50' }]} />
                  <Text style={styles.legendText}>Çok Uzak (&gt;160cm)</Text>
                </View>
              </View>
            </View>

            {/* Grafik */}
            {sensorData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Gaz Seviyeleri Trendi</Text>
                <LineChart
                  data={chartData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
            )}

            {/* Veri Geçmişi */}
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Son Veriler</Text>
              {sensorData.slice(-5).reverse().map((data, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyTime}>{data.timestamp}</Text>
                  <View style={styles.historyData}>
                    <Text style={styles.historyText}>
                      CO₂: {data.co2Level.toFixed(1)}% | 
                      Yanıcı: {data.flammableGasLevel.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {!isConnected && (
          <View style={styles.disconnectedContainer}>
            <Text style={styles.disconnectedText}>
              Robot bağlantısı kurulmadı
            </Text>
            <Text style={styles.disconnectedSubtext}>
              Sensör verilerini görüntülemek için robot ile bağlantı kurun
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
  gasSensorsContainer: {
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
  gasSensorCard: {
    marginBottom: 20,
  },
  gasSensorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  gasLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gasLevelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  gasLevelStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  ultrasonicContainer: {
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
  ultrasonicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ultrasonicCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  ultrasonicLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  ultrasonicVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ultrasonicRings: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 100,
    height: 80,
  },
  ultrasonicRing: {
    position: 'absolute',
    borderWidth: 6,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  ring1: {
    width: 20,
    height: 10,
    bottom: 0,
  },
  ring2: {
    width: 35,
    height: 17,
    bottom: 0,
  },
  ring3: {
    width: 50,
    height: 25,
    bottom: 0,
  },
  ring4: {
    width: 65,
    height: 32,
    bottom: 0,
  },
  ring5: {
    width: 80,
    height: 40,
    bottom: 0,
  },
  ultrasonicCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
    position: 'absolute',
    bottom: -3,
  },
  ultrasonicDistance: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  colorLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '48%',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
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
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
    width: 60,
  },
  historyData: {
    flex: 1,
    marginLeft: 10,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
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
});

export default SensorDataScreen;