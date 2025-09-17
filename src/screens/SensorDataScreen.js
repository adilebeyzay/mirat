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
import websocketService from '../services/websocketService';

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
  const [lastAlertLevels, setLastAlertLevels] = useState({
    co2: 0,
    flammable: 0,
  });
  const [esp32IP, setEsp32IP] = useState('192.168.1.142'); // ESP32 gerçek IP adresi
  const [alternativeIPs] = useState([
    '192.168.1.142', // ESP32 Station mode (hata mesajından)
    '192.168.1.100', // ESP32 Station mode (eski)
    '192.168.4.1',   // ESP32 AP mode
    '192.168.1.101', // Alternatif
    '192.168.0.100', // Alternatif
    '10.0.0.100'     // Alternatif
  ]);
  const [alternativePorts] = useState([8081, 81, 80, 8080, 3000, 5000]);
  const [websocketPort, setWebsocketPort] = useState(8081); // ESP32 WebSocket port
  const [connectionStatus, setConnectionStatus] = useState('ESP32 bağlantısı yok');
  const [lastError, setLastError] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  // Sayfa odak durumunu takip et
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );


  // WebSocket'ten gelen veriyi işle
  const handleWebSocketData = (data) => {
    try {
      console.log('WebSocket sensör verisi alındı:', data);
      
      // Risk değerlerini yüzdeye çevir (1=safe, 2=warning, 3=danger)
      const newCo2Level = data.gas1 === 1 ? 10 : data.gas1 === 2 ? 50 : data.gas1 === 3 ? 90 : 0;
      const newFlammableGasLevel = data.gas2 === 1 ? 10 : data.gas2 === 2 ? 50 : data.gas2 === 3 ? 90 : 0;
      
      // Gaz seviyesi uyarıları - sadece sayfa odakta iken ve seviye değiştiğinde
      if (isScreenFocused) {
        // Karbondioksit uyarıları - sadece seviye değiştiğinde
        if (newCo2Level >= 70 && lastAlertLevels.co2 < 70) {
          Alert.alert('Kritik Uyarı', 'Karbondioksit seviyesi kritik düzeyde!');
          setLastAlertLevels(prev => ({ ...prev, co2: newCo2Level }));
        } else if (newCo2Level >= 20 && newCo2Level < 70 && lastAlertLevels.co2 < 20) {
          Alert.alert('Uyarı', 'Karbondioksit seviyesi artıyor!');
          setLastAlertLevels(prev => ({ ...prev, co2: newCo2Level }));
        }
        
        // Yanıcı gaz uyarıları - sadece seviye değiştiğinde
        if (newFlammableGasLevel >= 70 && lastAlertLevels.flammable < 70) {
          Alert.alert('Kritik Uyarı', 'Yanıcı gaz seviyesi kritik düzeyde!');
          setLastAlertLevels(prev => ({ ...prev, flammable: newFlammableGasLevel }));
        } else if (newFlammableGasLevel >= 20 && newFlammableGasLevel < 70 && lastAlertLevels.flammable < 20) {
          Alert.alert('Uyarı', 'Yanıcı gaz seviyesi artıyor!');
          setLastAlertLevels(prev => ({ ...prev, flammable: newFlammableGasLevel }));
        }
      }

      setCo2Level(newCo2Level);
      setFlammableGasLevel(newFlammableGasLevel);

      // Ultrasonik sensör verilerini risk seviyesine göre mesafeye çevir
      const ultrasonicLeft = data.us1 === 1 ? 200 : data.us1 === 2 ? 100 : data.us1 === 3 ? 30 : 0;
      const ultrasonicRight = data.us2 === 1 ? 200 : data.us2 === 2 ? 100 : data.us2 === 3 ? 30 : 0;

      const newData = {
        co2Level: newCo2Level,
        flammableGasLevel: newFlammableGasLevel,
        ultrasonicData: {
          left: ultrasonicLeft,
          right: ultrasonicRight,
        },
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setUltrasonicData(newData.ultrasonicData);
      setSensorData(prev => [...prev.slice(-19), newData]);
      
    } catch (error) {
      console.error('WebSocket veri işleme hatası:', error);
    }
  };


  // Mock data - TCP bağlantısı olmadığında kullanılacak
    const generateMockData = () => {
    const newCo2Level = Math.random() * 100;
    const newFlammableGasLevel = Math.random() * 100;
      
    // Gaz seviyesi uyarıları - sadece sayfa odakta iken ve seviye değiştiğinde
    if (isScreenFocused) {
      // Karbondioksit uyarıları - sadece seviye değiştiğinde
      if (newCo2Level >= 70 && lastAlertLevels.co2 < 70) {
        Alert.alert('Kritik Uyarı', 'Karbondioksit seviyesi kritik düzeyde!');
        setLastAlertLevels(prev => ({ ...prev, co2: newCo2Level }));
      } else if (newCo2Level >= 20 && newCo2Level < 70 && lastAlertLevels.co2 < 20) {
        Alert.alert('Uyarı', 'Karbondioksit seviyesi artıyor!');
        setLastAlertLevels(prev => ({ ...prev, co2: newCo2Level }));
      }
      
      // Yanıcı gaz uyarıları - sadece seviye değiştiğinde
      if (newFlammableGasLevel >= 70 && lastAlertLevels.flammable < 70) {
        Alert.alert('Kritik Uyarı', 'Yanıcı gaz seviyesi kritik düzeyde!');
        setLastAlertLevels(prev => ({ ...prev, flammable: newFlammableGasLevel }));
      } else if (newFlammableGasLevel >= 20 && newFlammableGasLevel < 70 && lastAlertLevels.flammable < 20) {
        Alert.alert('Uyarı', 'Yanıcı gaz seviyesi artıyor!');
        setLastAlertLevels(prev => ({ ...prev, flammable: newFlammableGasLevel }));
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

  useEffect(() => {
    // Demo modu açık değilse otomatik mock data başlatma - KALDIRILDI
    // Artık sadece demo modu açıkken mock data başlatılacak

    if (!isConnected || !isScreenFocused) return;

    // WebSocket bağlantısı kur
    const connectToESP32 = async () => {
      try {
        await websocketService.connect(esp32IP, websocketPort);
        console.log('ESP32 WebSocket\'e bağlandı');
        
        // WebSocket veri callback'ini kaydet
        websocketService.onData(handleWebSocketData);
        
      } catch (error) {
        console.error('ESP32 WebSocket bağlantı hatası:', error);
        // Alert kaldırıldı - sessizce mock data kullan
        
        // WebSocket bağlantısı başarısız olursa mock data kullan
        generateMockData();
        const interval = setInterval(generateMockData, 10000);
        
        return () => {
          clearInterval(interval);
          websocketService.offData(handleWebSocketData);
        };
      }
    };

    connectToESP32();
    
    return () => {
      // Cleanup
      websocketService.offData(handleWebSocketData);
    };
  }, [isConnected, isScreenFocused, esp32IP, websocketPort]);

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

  // ESP32 IP ve Port tarama
  const scanForESP32 = async () => {
    setConnectionStatus('ESP32 aranıyor...');
    setLastError('');
    
    for (const ip of alternativeIPs) {
      for (const port of alternativePorts) {
        try {
          console.log(`ESP32 IP/Port tarama: ${ip}:${port}`);
          setConnectionStatus(`Taranıyor: ${ip}:${port}`);
          
          const testUrl = `http://${ip}:${port}`;
          const response = await fetch(testUrl, {
            method: 'GET',
            timeout: 10000
          });
          
          if (response.ok || response.status === 400) {
            setEsp32IP(ip);
            setWebsocketPort(port);
            setConnectionStatus(`ESP32 bulundu: ${ip}:${port}`);
            Alert.alert('ESP32 Bulundu!', 
              `ESP32 şu adreste bulundu:\nIP: ${ip}\nPort: ${port}\n\n` +
              'Şimdi "Bağlan" butonuna basarak WebSocket bağlantısı kurabilirsiniz.'
            );
            return { ip, port };
          }
        } catch (error) {
          console.log(`${ip}:${port} erişilemiyor:`, error.message);
        }
      }
    }
    
    setConnectionStatus('ESP32 bulunamadı');
    setLastError('Hiçbir IP/Port kombinasyonunda ESP32 bulunamadı');
    Alert.alert('ESP32 Bulunamadı', 
      'ESP32 hiçbir IP/Port kombinasyonunda bulunamadı.\n\n' +
      'Kontrol edilecekler:\n' +
      '• ESP32 açık mı?\n' +
      '• WiFi bağlantısı var mı?\n' +
      '• ESP32 WebSocket sunucusu çalışıyor mu?\n' +
      '• ESP32 farklı portta çalışıyor olabilir'
    );
    return null;
  };

  // ESP32 bağlantı testi
  const testESP32Connection = async () => {
    setConnectionStatus('Test ediliyor...');
    setLastError('');
    
    try {
      // ESP32'ye ping testi (HTTP 400 bile olsa erişilebilir demektir)
      const testUrl = `http://${esp32IP}:${websocketPort}`;
      console.log('ESP32 HTTP test:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 15000
      });
      
      // HTTP 400 = ESP32 erişilebilir ama HTTP isteği beklenmiyor
      if (response.status === 400) {
        setConnectionStatus('ESP32 erişilebilir (WebSocket hazır)');
        console.log('ESP32 erişilebilir - WebSocket hazır');
        return true;
      } else if (response.ok) {
        setConnectionStatus('ESP32 erişilebilir (HTTP)');
        return true;
      } else {
        setConnectionStatus(`ESP32 HTTP hatası: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('ESP32 HTTP test hatası:', error);
      setConnectionStatus('ESP32 erişilemiyor');
      setLastError(error.message);
      
      // Alert kaldırıldı - sessizce hata durumunu göster
      console.log('ESP32 erişilemiyor:', error.message);
      return false;
    }
  };

  const connectToRobot = async () => {
    if (!isConnected) {
      // Bağlan - güvenli null check
      try {
        setConnectionStatus('Bağlanıyor...');
        setLastError('');
        
        console.log(`ESP32'ye bağlanmaya çalışılıyor: ${esp32IP}:${websocketPort}`);
        console.log('websocketService:', websocketService);
        console.log('websocketService.connect:', typeof websocketService?.connect);
        
        // websocketService null check
        if (!websocketService || typeof websocketService.connect !== 'function') {
          throw new Error('WebSocket servisi hazır değil');
        }
        
        console.log(`ESP32'ye bağlanılıyor: ${esp32IP}:${websocketPort}`);
        
        // Önce ESP32'yi test et
        const isESP32Reachable = await testESP32Connection();
        if (!isESP32Reachable) {
          throw new Error(`ESP32 erişilemiyor: ${lastError}`);
        }
        
        await websocketService.connect(esp32IP, websocketPort);
        
        // Callback'leri güvenli şekilde kaydet
        if (typeof websocketService.onData === 'function') {
          websocketService.onData(handleWebSocketData);
        }
        
        if (typeof websocketService.onConnection === 'function') {
          websocketService.onConnection((connected) => {
            setIsConnected(connected);
            if (connected) {
              setLastAlertLevels({ co2: 0, flammable: 0 });
              setConnectionStatus('Bağlı');
              console.log('ESP32 WebSocket\'e bağlandı!');
            } else {
              setConnectionStatus('Bağlantı kesildi');
              console.log('ESP32 bağlantısı kesildi');
            }
          });
        }
        
      } catch (error) {
        console.error('Bağlantı hatası:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          websocketService: websocketService
        });
        
        setConnectionStatus('Bağlantı hatası');
        setLastError(error.message);
        
        // Alert kaldırıldı - sessizce hata durumunu göster
        console.log('Bağlantı hatası:', error.message);
      }
    } else {
      // Bağlantıyı kes - güvenli disconnect
      try {
        if (websocketService && typeof websocketService.disconnect === 'function') {
          websocketService.disconnect();
        }
        if (websocketService && typeof websocketService.offData === 'function') {
          websocketService.offData(handleWebSocketData);
        }
        setIsConnected(false);
        setLastAlertLevels({ co2: 0, flammable: 0 });
        setConnectionStatus('Bağlantı kesildi');
        console.log('ESP32 WebSocket bağlantısı kesildi');
      } catch (error) {
        console.error('Disconnect hatası:', error);
        setIsConnected(false);
        setConnectionStatus('Disconnect hatası');
      }
    }
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
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.scanButton]}
              onPress={scanForESP32}>
              <Text style={styles.scanButtonText}>Tara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.testButton]}
              onPress={testESP32Connection}>
              <Text style={styles.testButtonText}>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connectButton, isConnected && styles.connectedButton]}
              onPress={connectToRobot}>
              <Text style={styles.connectButtonText}>
                {isConnected ? 'Bağlı' : 'Bağlan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ESP32 Deneyap AP WebSocket Bağlantı Ayarları */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>ESP32 Deneyap AP WebSocket Bağlantı Ayarları</Text>
          <View style={styles.settingsRow}>
            <Text style={styles.settingLabel}>IP Adresi:</Text>
            <Text style={styles.settingValue}>{esp32IP}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingLabel}>WebSocket Port:</Text>
            <Text style={styles.settingValue}>{websocketPort}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingLabel}>Bağlantı Durumu:</Text>
            <Text style={[styles.settingValue, { color: isConnected ? '#4caf50' : '#f44336' }]}>
              {connectionStatus}
            </Text>
          </View>
          {lastError && (
            <View style={styles.settingsRow}>
              <Text style={styles.settingLabel}>Son Hata:</Text>
              <Text style={[styles.settingValue, { color: '#f44336', fontSize: 12 }]}>
                {lastError}
              </Text>
            </View>
          )}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Bağlantı Sorunu Çözümleri:</Text>
            <Text style={styles.helpText}>• ESP32'nin açık olduğundan emin olun</Text>
            <Text style={styles.helpText}>• Telefonunuz ESP32'nin WiFi ağına bağlı olmalı</Text>
            <Text style={styles.helpText}>• ESP32 IP adresi: 192.168.1.142 (güncel)</Text>
            <Text style={styles.helpText}>• WebSocket port: 8081 (güncel)</Text>
            <Text style={styles.helpText}>• ESP32'de WebSocket sunucusu çalışıyor olmalı</Text>
          </View>
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
              {demoMode ? 'Demo Modu - Mock Veri Kullanılıyor' : 'ESP32 Bağlantısı Yok'}
          </Text>
          <Text style={styles.disconnectedSubtext}>
              {demoMode 
                ? 'ESP32 bağlantısı olmadan uygulamayı test edebilirsiniz.\nGerçek veri için ESP32\'ye bağlanın.'
                : 'Demo modu kapalı - Mock veri üretilmiyor.\nDemo modu açarak test verisi görebilirsiniz.\nGerçek veri için ESP32\'ye bağlanın.'
              }
          </Text>
            <TouchableOpacity
              style={[styles.demoButton, demoMode && styles.demoButtonActive]}
              onPress={() => {
                if (!demoMode) {
                  // Demo modu aç
                  setDemoMode(true);
                  setConnectionStatus('Demo veri kullanılıyor');
                  setIsConnected(true);
                  generateMockData();
                  const interval = setInterval(generateMockData, 5000);
                  setTimeout(() => {
                    clearInterval(interval);
                    setDemoMode(false);
                    setIsConnected(false);
                    setConnectionStatus('Demo veri durduruldu');
                  }, 60000);
                  Alert.alert('Demo Modu Açıldı', '1 dakika boyunca mock veri üretilecek');
                } else {
                  // Demo modu kapat
                  setDemoMode(false);
                  setIsConnected(false);
                  setConnectionStatus('Demo modu kapatıldı');
                  // Alert kaldırıldı - sessizce kapat
                }
              }}>
              <Text style={[styles.demoButtonText, demoMode && styles.demoButtonTextActive]}>
                {demoMode ? 'Demo Veri Durdur' : 'Demo Veri Başlat'}
              </Text>
            </TouchableOpacity>
        </View>
      )}

      {/* Gereklilikler Bölümü */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Sistem Gereklilikleri</Text>
        
        <View style={styles.requirementItem}>
          <Text style={styles.requirementTitle}>ESP32 Mikrodenetleyici</Text>
          <Text style={styles.requirementDescription}>
            • WebSocket sunucusu çalıştırmalı{'\n'}
            • Sensör verilerini toplamalı{'\n'}
            • 192.168.1.142 IP adresinde erişilebilir olmalı{'\n'}
            • Port 8081'de WebSocket bağlantısı kabul etmeli
          </Text>
        </View>

        <View style={styles.requirementItem}>
          <Text style={styles.requirementTitle}>Sensörler</Text>
          <Text style={styles.requirementDescription}>
            • CO2 sensörü (MH-Z19B){'\n'}
            • Yanıcı gaz sensörü (MQ-2){'\n'}
            • Ultrasonik sensörler (HC-SR04){'\n'}
            • Sıcaklık ve nem sensörü (DHT22)
          </Text>
        </View>

        <View style={styles.requirementItem}>
          <Text style={styles.requirementTitle}>Ağ Bağlantısı</Text>
          <Text style={styles.requirementDescription}>
            • ESP32 ve mobil cihaz aynı ağda olmalı{'\n'}
            • WiFi bağlantısı stabil olmalı{'\n'}
            • Firewall WebSocket bağlantılarını engellememeli
          </Text>
        </View>

        <View style={styles.requirementItem}>
          <Text style={styles.requirementTitle}>Mobil Uygulama</Text>
          <Text style={styles.requirementDescription}>
            • React Native Expo framework{'\n'}
            • WebSocket bağlantı desteği{'\n'}
            • Gerçek zamanlı veri görüntüleme{'\n'}
            • Demo modu ile test imkanı
          </Text>
        </View>

        <View style={styles.requirementItem}>
          <Text style={styles.requirementTitle}>Test ve Geliştirme</Text>
          <Text style={styles.requirementDescription}>
            • Demo modu ile ESP32 olmadan test{'\n'}
            • Mock veri üretimi{'\n'}
            • IP/Port tarama özelliği{'\n'}
            • Bağlantı durumu takibi
          </Text>
        </View>
      </View>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
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
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scanButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  settingsContainer: {
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
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  connectionTypeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  connectionTypeButtonActive: {
    backgroundColor: '#2196F3',
  },
  connectionTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  connectionTypeTextActive: {
    color: '#fff',
  },
  helpContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
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
    marginBottom: 20,
  },
  demoButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  demoButtonActive: {
    backgroundColor: '#f44336',
  },
  demoButtonTextActive: {
    color: '#fff',
  },
  requirementsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
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
  requirementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  requirementItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  requirementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SensorDataScreen;