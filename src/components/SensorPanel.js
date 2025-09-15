import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SensorPanel = ({ sensorData }) => {
  const getRiskColor = (risk) => {
    switch(risk) {
      case 1: return '#4caf50'; // Safe - Green
      case 2: return '#ff9800'; // Warning - Orange
      case 3: return '#f44336'; // Danger - Red
      default: return '#9e9e9e'; // Unknown - Gray
    }
  };

  const getRiskText = (risk) => {
    switch(risk) {
      case 1: return 'Safe';
      case 2: return 'Warning';
      case 3: return 'Danger';
      default: return 'Unknown';
    }
  };

  const getIMUColor = (value) => {
    const deviation = Math.abs(value - 128);
    if (deviation <= 20) return '#4caf50'; // Stable
    else if (deviation <= 50) return '#ff9800'; // Moving
    else return '#f44336'; // High Activity
  };

  const getIMUText = (value) => {
    const deviation = Math.abs(value - 128);
    if (deviation <= 20) return 'Stable';
    else if (deviation <= 50) return 'Moving';
    else return 'High Activity';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Sensor Data</Text>
      
      <View style={styles.sensorGrid}>
        {/* Ultrasonic Sensors */}
        <View style={styles.sensorGroup}>
          <Text style={styles.groupTitle}>📡 Ultrasonic Sensors</Text>
          
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>US1:</Text>
            <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(sensorData?.us1) }]}>
              <Text style={styles.riskValue}>{sensorData?.us1 || '-'}</Text>
              <Text style={styles.riskText}>{getRiskText(sensorData?.us1)}</Text>
            </View>
          </View>
          
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>US2:</Text>
            <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(sensorData?.us2) }]}>
              <Text style={styles.riskValue}>{sensorData?.us2 || '-'}</Text>
              <Text style={styles.riskText}>{getRiskText(sensorData?.us2)}</Text>
            </View>
          </View>
        </View>

        {/* Gas Sensors */}
        <View style={styles.sensorGroup}>
          <Text style={styles.groupTitle}>💨 Gas Sensors</Text>
          
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>Gas1:</Text>
            <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(sensorData?.gas1) }]}>
              <Text style={styles.riskValue}>{sensorData?.gas1 || '-'}</Text>
              <Text style={styles.riskText}>{getRiskText(sensorData?.gas1)}</Text>
            </View>
          </View>
          
          <View style={styles.sensorItem}>
            <Text style={styles.sensorLabel}>Gas2:</Text>
            <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(sensorData?.gas2) }]}>
              <Text style={styles.riskValue}>{sensorData?.gas2 || '-'}</Text>
              <Text style={styles.riskText}>{getRiskText(sensorData?.gas2)}</Text>
            </View>
          </View>
        </View>

        {/* IMU Sensors */}
        <View style={styles.sensorGroup}>
          <Text style={styles.groupTitle}>⚖️ IMU Sensors (Raw Data)</Text>
          <Text style={styles.legend}>
            Raw Values: 0-255 (128=0g, &lt;128=negative, &gt;128=positive acceleration)
          </Text>
          
          <View style={styles.imuData}>
            {/* IMU1 */}
            <View style={styles.imuSensor}>
              <Text style={styles.imuTitle}>IMU1</Text>
              <View style={styles.imuAxes}>
                <View style={styles.axisItem}>
                  <Text style={styles.axisLabel}>X:</Text>
                  <View style={[styles.riskIndicatorSmall, { backgroundColor: getIMUColor(sensorData?.imu1x) }]}>
                    <Text style={styles.axisValue}>{sensorData?.imu1x || '-'}</Text>
                  </View>
                </View>
                <View style={styles.axisItem}>
                  <Text style={styles.axisLabel}>Y:</Text>
                  <View style={[styles.riskIndicatorSmall, { backgroundColor: getIMUColor(sensorData?.imu1y) }]}>
                    <Text style={styles.axisValue}>{sensorData?.imu1y || '-'}</Text>
                  </View>
                </View>
                <View style={styles.axisItem}>
                  <Text style={styles.axisLabel}>Z:</Text>
                  <View style={[styles.riskIndicatorSmall, { backgroundColor: getIMUColor(sensorData?.imu1z) }]}>
                    <Text style={styles.axisValue}>{sensorData?.imu1z || '-'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* IMU2 */}
            <View style={styles.imuSensor}>
              <Text style={styles.imuTitle}>IMU2</Text>
              <View style={styles.imuAxes}>
                <View style={styles.axisItem}>
                  <Text style={styles.axisLabel}>X:</Text>
                  <View style={[styles.riskIndicatorSmall, { backgroundColor: getIMUColor(sensorData?.imu2x) }]}>
                    <Text style={styles.axisValue}>{sensorData?.imu2x || '-'}</Text>
                  </View>
                </View>
                <View style={styles.axisItem}>
                  <Text style={styles.axisLabel}>Y:</Text>
                  <View style={[styles.riskIndicatorSmall, { backgroundColor: getIMUColor(sensorData?.imu2y) }]}>
                    <Text style={styles.axisValue}>{sensorData?.imu2y || '-'}</Text>
                  </View>
                </View>
                <View style={styles.axisItem}>
                  <Text style={styles.axisLabel}>Z:</Text>
                  <View style={[styles.riskIndicatorSmall, { backgroundColor: getIMUColor(sensorData?.imu2z) }]}>
                    <Text style={styles.axisValue}>{sensorData?.imu2z || '-'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sensorGrid: {
    gap: 20,
  },
  sensorGroup: {
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 80,
    justifyContent: 'center',
  },
  riskIndicatorSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  riskValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 4,
  },
  riskText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  axisValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  legend: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  imuData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imuSensor: {
    flex: 1,
    marginHorizontal: 5,
  },
  imuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  imuAxes: {
    gap: 6,
  },
  axisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  axisLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default SensorPanel;

