import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const LogPanel = ({ logs }) => {
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Auto scroll to bottom when new logs are added
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  const getLogTypeStyle = (type) => {
    switch(type) {
      case 'success':
        return styles.logSuccess;
      case 'error':
        return styles.logError;
      case 'warning':
        return styles.logWarning;
      case 'info':
      default:
        return styles.logInfo;
    }
  };

  const getLogTypeIcon = (type) => {
    switch(type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 System Log</Text>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.logContainer}
        showsVerticalScrollIndicator={true}>
        {logs.length === 0 ? (
          <Text style={styles.emptyLog}>No logs yet...</Text>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={[styles.logEntry, getLogTypeStyle(log.type)]}>
              <Text style={styles.logIcon}>{getLogTypeIcon(log.type)}</Text>
              <View style={styles.logContent}>
                <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  emptyLog: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  logInfo: {
    backgroundColor: '#e3f2fd',
    borderLeftColor: '#2196F3',
  },
  logSuccess: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#4caf50',
  },
  logWarning: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#ff9800',
  },
  logError: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  logIcon: {
    fontSize: 12,
    marginRight: 8,
    marginTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logTimestamp: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
});

export default LogPanel;

