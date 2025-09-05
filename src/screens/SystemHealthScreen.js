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
import {ProgressChart} from 'react-native-chart-kit';
import {StatusBar} from 'expo-status-bar';

const {width: screenWidth} = Dimensions.get('window');

const SystemHealthScreen = () => {
  const [systemHealth, setSystemHealth] = useState({
    batteryLevel: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkStatus: 'disconnected',
    temperature: 0,
    uptime: '0:00:00',
    lastMaintenance: 'N/A',
    errorCount: 0,
    warningCount: 0,
    currentDraw: 0, // Akım (mA)
    powerConsumption: 0, // Güç (W)
    batteryVoltage: 0, // Batarya gerilimi (V)
  });
  const [isConnected, setIsConnected] = useState(false);

  // Mock data - gerçek uygulamada robot API'sinden gelecek
  useEffect(() => {
    if (isConnected) {
      const updateSystemHealth = () => {
        setSystemHealth(prev => ({
          batteryLevel: Math.random() * 100,
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          diskUsage: Math.random() * 100,
          networkStatus: 'connected',
          temperature: Math.random() * 40 + 30,
          uptime: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          lastMaintenance: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          errorCount: Math.floor(Math.random() * 5),
          warningCount: Math.floor(Math.random() * 10),
          currentDraw: Math.random() * 2000 + 500, // 500-2500 mA
          powerConsumption: Math.random() * 50 + 10, // 10-60 W
          batteryVoltage: Math.random() * 2 + 11, // 11-13 V
        }));
      };

      updateSystemHealth();
      const interval = setInterval(updateSystemHealth, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const connectToRobot = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      Alert.alert('Bağlantı', 'Robot sistemine bağlanıldı');
    }
  };

  const getHealthStatus = () => {
    const {batteryLevel, cpuUsage, memoryUsage, temperature, errorCount} = systemHealth;
    
    if (batteryLevel < 20 || cpuUsage > 90 || memoryUsage > 90 || temperature > 70 || errorCount > 3) {
      return {status: 'critical', color: '#f44336', text: 'Kritik'};
    } else if (batteryLevel < 50 || cpuUsage > 70 || memoryUsage > 70 || temperature > 60 || errorCount > 1) {
      return {status: 'warning', color: '#ff9800', text: 'Uyarı'};
    } else {
      return {status: 'healthy', color: '#4caf50', text: 'Sağlıklı'};
    }
  };

  const healthStatus = getHealthStatus();

  const chartData = {
    data: [
      systemHealth.cpuUsage / 100,
      systemHealth.memoryUsage / 100,
      systemHealth.diskUsage / 100,
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const performMaintenance = () => {
    Alert.alert(
      'Bakım',
      'Sistem bakımı başlatılsın mı?',
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Başlat',
          onPress: () => {
            Alert.alert('Bakım', 'Sistem bakımı başlatıldı');
          },
        },
      ]
    );
  };

  const restartSystem = () => {
    Alert.alert(
      'Yeniden Başlat',
      'Sistem yeniden başlatılsın mı?',
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Yeniden Başlat',
          onPress: () => {
            Alert.alert('Yeniden Başlat', 'Sistem yeniden başlatılıyor...');
          },
        },
      ]
    );
  };

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sistem Sağlığı</Text>
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
            {/* Sistem Durumu */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusCard, {borderLeftColor: healthStatus.color}]}>
                <Text style={styles.statusLabel}>Genel Durum</Text>
                <Text style={[styles.statusValue, {color: healthStatus.color}]}>
                  {healthStatus.text}
                </Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Çalışma Süresi</Text>
                <Text style={styles.statusValue}>{systemHealth.uptime}</Text>
              </View>
            </View>

            {/* Temel Metrikler */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Batarya</Text>
                <Text style={styles.metricValue}>{systemHealth.batteryLevel.toFixed(0)}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      {width: `${systemHealth.batteryLevel}%`, backgroundColor: systemHealth.batteryLevel < 20 ? '#f44336' : systemHealth.batteryLevel < 50 ? '#ff9800' : '#4caf50'}
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>CPU Kullanımı</Text>
                <Text style={styles.metricValue}>{systemHealth.cpuUsage.toFixed(0)}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      {width: `${systemHealth.cpuUsage}%`, backgroundColor: systemHealth.cpuUsage > 90 ? '#f44336' : systemHealth.cpuUsage > 70 ? '#ff9800' : '#4caf50'}
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Bellek Kullanımı</Text>
                <Text style={styles.metricValue}>{systemHealth.memoryUsage.toFixed(0)}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      {width: `${systemHealth.memoryUsage}%`, backgroundColor: systemHealth.memoryUsage > 90 ? '#f44336' : systemHealth.memoryUsage > 70 ? '#ff9800' : '#4caf50'}
                    ]} 
                  />
                </View>
              </View>
                          <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Disk Kullanımı</Text>
              <Text style={styles.metricValue}>{systemHealth.diskUsage.toFixed(0)}%</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    {width: `${systemHealth.diskUsage}%`, backgroundColor: systemHealth.diskUsage > 90 ? '#f44336' : systemHealth.diskUsage > 70 ? '#ff9800' : '#4caf50'}
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Güç ve Elektriksel Veriler */}
          <View style={styles.powerContainer}>
            <Text style={styles.sectionTitle}>Güç ve Elektriksel Veriler</Text>
            <View style={styles.powerGrid}>
              <View style={styles.powerCard}>
                <Text style={styles.powerLabel}>Akım Çekimi</Text>
                <Text style={styles.powerValue}>{systemHealth.currentDraw.toFixed(0)} mA</Text>
                <View style={styles.powerIndicator}>
                  <View style={[
                    styles.powerBar, 
                    {width: `${Math.min((systemHealth.currentDraw / 2500) * 100, 100)}%`, backgroundColor: systemHealth.currentDraw > 2000 ? '#f44336' : systemHealth.currentDraw > 1500 ? '#ff9800' : '#4caf50'}
                  ]} />
                </View>
              </View>
              <View style={styles.powerCard}>
                <Text style={styles.powerLabel}>Güç Tüketimi</Text>
                <Text style={styles.powerValue}>{systemHealth.powerConsumption.toFixed(1)} W</Text>
                <View style={styles.powerIndicator}>
                  <View style={[
                    styles.powerBar, 
                    {width: `${Math.min((systemHealth.powerConsumption / 60) * 100, 100)}%`, backgroundColor: systemHealth.powerConsumption > 45 ? '#f44336' : systemHealth.powerConsumption > 30 ? '#ff9800' : '#4caf50'}
                  ]} />
                </View>
              </View>
              <View style={styles.powerCard}>
                <Text style={styles.powerLabel}>Batarya Gerilimi</Text>
                <Text style={styles.powerValue}>{systemHealth.batteryVoltage.toFixed(2)} V</Text>
                <View style={styles.powerIndicator}>
                  <View style={[
                    styles.powerBar, 
                    {width: `${Math.min(((systemHealth.batteryVoltage - 11) / 2) * 100, 100)}%`, backgroundColor: systemHealth.batteryVoltage < 11.5 ? '#f44336' : systemHealth.batteryVoltage < 12 ? '#ff9800' : '#4caf50'}
                  ]} />
                </View>
              </View>
            </View>
          </View>

            {/* Grafik */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Sistem Kullanımı</Text>
              <ProgressChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={chartConfig}
                hideLegend={false}
              />
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#2196F3'}]} />
                  <Text style={styles.legendText}>CPU</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#4caf50'}]} />
                  <Text style={styles.legendText}>Bellek</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#ff9800'}]} />
                  <Text style={styles.legendText}>Disk</Text>
                </View>
              </View>
            </View>

            {/* Sistem Bilgileri */}
            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Sıcaklık</Text>
                <Text style={styles.infoValue}>{systemHealth.temperature.toFixed(1)}°C</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Ağ Durumu</Text>
                <Text style={[styles.infoValue, {color: systemHealth.networkStatus === 'connected' ? '#4caf50' : '#f44336'}]}>
                  {systemHealth.networkStatus === 'connected' ? 'Bağlı' : 'Bağlı Değil'}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Hata Sayısı</Text>
                <Text style={[styles.infoValue, {color: systemHealth.errorCount > 0 ? '#f44336' : '#4caf50'}]}>
                  {systemHealth.errorCount}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Uyarı Sayısı</Text>
                <Text style={[styles.infoValue, {color: systemHealth.warningCount > 0 ? '#ff9800' : '#4caf50'}]}>
                  {systemHealth.warningCount}
                </Text>
              </View>
            </View>

            {/* Son Bakım */}
            <View style={styles.maintenanceContainer}>
              <Text style={styles.maintenanceTitle}>Son Bakım</Text>
              <Text style={styles.maintenanceDate}>{systemHealth.lastMaintenance}</Text>
            </View>

            {/* Kontrol Butonları */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={performMaintenance}>
                <Text style={styles.controlButtonText}>Bakım Başlat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.controlButton, styles.restartButton]} onPress={restartSystem}>
                <Text style={styles.controlButtonText}>Yeniden Başlat</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {!isConnected && (
          <View style={styles.disconnectedContainer}>
            <Text style={styles.disconnectedText}>
              Robot sistemine bağlantı kurulmadı
            </Text>
            <Text style={styles.disconnectedSubtext}>
              Sistem sağlığı verilerini görüntülemek için robot ile bağlantı kurun
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
  statusContainer: {
    flexDirection: 'row',
    padding: 20,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    borderLeftWidth: 4,
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
  },
  metricsContainer: {
    padding: 20,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
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
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 15,
    marginBottom: 10,
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
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  maintenanceContainer: {
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
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  maintenanceDate: {
    fontSize: 14,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: '#f44336',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  powerContainer: {
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
  powerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  powerCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  powerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  powerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  powerIndicator: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  powerBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default SystemHealthScreen;