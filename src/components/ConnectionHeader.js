import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConnectionHeader = ({ isConnected, connectionType }) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Ionicons name="hardware-chip" size={24} color="#2196F3" />
        <Text style={styles.title}>🤖 Robot Control Center</Text>
      </View>
      
      <View style={styles.connectionStatus}>
        <View style={[styles.statusIndicator, isConnected && styles.statusIndicatorConnected]} />
        <Text style={[styles.statusText, { color: isConnected ? '#4caf50' : '#f44336' }]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <Text style={styles.connectionType}>
          ({connectionType?.toUpperCase()})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f44336',
    marginRight: 8,
  },
  statusIndicatorConnected: {
    backgroundColor: '#4caf50',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  connectionType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default ConnectionHeader;

