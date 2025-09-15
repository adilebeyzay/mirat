import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MotorControlPanel = ({ onMotorCommand, isControlling }) => {
  const handlePress = (command) => {
    if (isControlling) {
      onMotorCommand(command);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Motor Control</Text>
      
      <View style={styles.controlGrid}>
        {/* Forward Button */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.forwardBtn]}
            onPress={() => handlePress('forward')}
            disabled={!isControlling}>
            <Ionicons name="chevron-up" size={24} color="#fff" />
            <Text style={styles.btnText}>Forward</Text>
          </TouchableOpacity>
        </View>

        {/* Middle Row: Left, Stop, Right */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.leftBtn]}
            onPress={() => handlePress('left')}
            disabled={!isControlling}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
            <Text style={styles.btnText}>Left</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.stopBtn]}
            onPress={() => handlePress('stop')}
            disabled={!isControlling}>
            <Ionicons name="stop" size={24} color="#fff" />
            <Text style={styles.btnText}>Stop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.rightBtn]}
            onPress={() => handlePress('right')}
            disabled={!isControlling}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
            <Text style={styles.btnText}>Right</Text>
          </TouchableOpacity>
        </View>

        {/* Backward Button */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.backwardBtn]}
            onPress={() => handlePress('backward')}
            disabled={!isControlling}>
            <Ionicons name="chevron-down" size={24} color="#fff" />
            <Text style={styles.btnText}>Backward</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Control Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: isControlling ? '#4caf50' : '#f44336' }]} />
        <Text style={styles.statusText}>
          {isControlling ? 'Control Active' : 'Control Inactive'}
        </Text>
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
    textAlign: 'center',
  },
  controlGrid: {
    alignItems: 'center',
    marginBottom: 15,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 3,
  },
  forwardBtn: {
    backgroundColor: '#4caf50',
  },
  backwardBtn: {
    backgroundColor: '#f44336',
  },
  leftBtn: {
    backgroundColor: '#ff9800',
  },
  rightBtn: {
    backgroundColor: '#2196F3',
  },
  stopBtn: {
    backgroundColor: '#9e9e9e',
    minWidth: 80,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default MotorControlPanel;

