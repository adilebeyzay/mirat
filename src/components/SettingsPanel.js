import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const SettingsPanel = ({ 
  onConnect, 
  onDisconnect, 
  isConnected
}) => {
  const [serverIP, setServerIP] = useState('192.168.4.1');
  const [websocketPort, setWebsocketPort] = useState('81');

  const handleConnect = () => {
    onConnect(serverIP, websocketPort);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>
      

      {/* Server IP */}
      <View style={styles.settingItem}>
        <Text style={styles.label}>Server IP:</Text>
        <TextInput
          style={styles.input}
          value={serverIP}
          onChangeText={setServerIP}
          placeholder="ESP32 IP Address"
          keyboardType="numeric"
          editable={!isConnected}
        />
      </View>

      {/* Port Settings */}
      <View style={styles.settingItem}>
        <Text style={styles.label}>WebSocket Port:</Text>
        <TextInput
          style={styles.input}
          value={websocketPort}
          onChangeText={setWebsocketPort}
          placeholder="Port"
          keyboardType="numeric"
          editable={!isConnected}
        />
      </View>

      {/* Connection Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.connectButton, isConnected && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={isConnected}>
          <Text style={styles.buttonText}>🔗 Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.disconnectButton, !isConnected && styles.buttonDisabled]}
          onPress={onDisconnect}
          disabled={!isConnected}>
          <Text style={styles.buttonText}>❌ Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4caf50' : '#f44336' }]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <Text style={styles.connectionInfo}>
          {isConnected ? `${serverIP}:${websocketPort}` : ''}
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
  },
  settingItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  connectionTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  connectionTypeBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  connectionTypeBtnActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  connectionTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  connectionTypeTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  connectButton: {
    backgroundColor: '#4caf50',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 15,
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
    marginRight: 8,
  },
  connectionInfo: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
});

export default SettingsPanel;
