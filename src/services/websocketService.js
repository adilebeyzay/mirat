class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.lastSensorUpdate = 0;
    this.dataCallbacks = [];
    this.connectionCallbacks = [];
  }

  // WebSocket bağlantısı kur
  connect(host = '192.168.4.1', port = 81) {
    return new Promise((resolve, reject) => {
      try {
        // Önceki bağlantıyı kapat
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
        
        const wsUrl = `ws://${host}:${port}/`;
        console.log(`WebSocket bağlantısı kuruluyor: ${wsUrl}`);
        console.log(`Hedef: ${host}:${port}`);
        
        // WebSocket oluşturma - güvenli null check
        try {
          console.log('🔄 WebSocket oluşturuluyor...');
          this.ws = new WebSocket(wsUrl);
          
          // WebSocket başarıyla oluşturuldu mu kontrol et
          if (!this.ws) {
            throw new Error('WebSocket oluşturulamadı - null döndü');
          }
          
          console.log('✅ WebSocket nesnesi oluşturuldu:', typeof this.ws);
          console.log('WebSocket URL:', wsUrl);
          console.log('WebSocket readyState:', this.ws.readyState);
          
          this.ws.onopen = () => {
            console.log('🟢 WebSocket onopen eventi tetiklendi');
            this.handleOpen(resolve);
          };
          this.ws.onmessage = (event) => {
            console.log('📨 WebSocket onmessage eventi tetiklendi');
            this.handleMessage(event);
          };
          this.ws.onclose = (event) => {
            console.log('🔴 WebSocket onclose eventi tetiklendi');
            this.handleClose(event);
          };
          this.ws.onerror = (error) => {
            console.log('❌ WebSocket onerror eventi tetiklendi');
            this.handleError(error, reject);
          };
          
        } catch (wsError) {
          console.error('WebSocket oluşturma hatası:', wsError);
          reject(new Error(`WebSocket oluşturulamadı: ${wsError.message}`));
          return;
        }
        
        // Timeout ayarla (60 saniye - Android emülatör için)
        setTimeout(() => {
          if (!this.isConnected) {
            console.error('WebSocket bağlantı timeout - 60 saniye geçti');
            reject(new Error(`WebSocket bağlantı timeout (60s)\nHedef: ${host}:${port}\n\nAndroid emülatörde WebSocket bağlantısı yavaş olabilir.\n\nÇözüm önerileri:\n• ESP32'yi yeniden başlatın\n• Farklı port deneyin (80, 8080)\n• WiFi bağlantısını kontrol edin\n• Emülatörü yeniden başlatın`));
          }
        }, 60000);

      } catch (error) {
        console.error('WebSocket oluşturma hatası:', error);
        reject(new Error(`WebSocket oluşturulamadı: ${error.message}`));
      }
    });
  }

  handleOpen(resolve) {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    console.log('✅ WebSocket bağlantısı kuruldu!');
    console.log('WebSocket durumu:', this.ws.readyState);
    
    // Mobile kimliğini gönder
    setTimeout(() => {
      this.sendMessage('MOBILE');
    }, 1000); // 1 saniye bekle
    
    // Bağlantı callback'lerini çağır
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(true);
      } catch (error) {
        console.error('Connection callback hatası:', error);
      }
    });
    
    resolve();
  }

  handleMessage(event) {
    const message = event.data.trim();
    console.log('WebSocket mesaj alındı:', message);
    
    // Farklı mesaj tiplerini işle
    if (message === 'ESP32_READY') {
      console.log('ESP32 sunucu hazır');
    } else if (message === 'MOBILE_IDENTIFIED') {
      console.log('Mobil istemci tanımlandı');
    } else if (message.startsWith('sensor_data:')) {
      this.parseSensorData(message);
    } else if (message.includes('MOTOR_CMD_OK')) {
      console.log('Motor komutu onaylandı');
    } else {
      // ESP8266'dan gelen sensör verisi olabilir
      this.parseSensorData(message);
    }
  }

  handleClose(event) {
    this.isConnected = false;
    console.log('WebSocket bağlantısı kapandı');
    console.log('Close event:', event);
    
    // Bağlantı callback'lerini çağır
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(false);
      } catch (error) {
        console.error('Connection callback hatası:', error);
      }
    });
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  handleError(error, reject) {
    console.error('WebSocket hatası:', error);
    console.error('Error details:', {
      type: error.type,
      target: error.target,
      currentTarget: error.currentTarget
    });
    reject(new Error(`WebSocket bağlantı hatası: ${error.message || 'Bilinmeyen hata'}`));
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    console.log(`Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch(error => {
          console.error('Yeniden bağlanma hatası:', error);
        });
      }
    }, this.reconnectInterval);
  }

  // Mesaj gönder
  sendMessage(message) {
    // Güvenli null check - sizin önerdiğiniz pattern
    if (this.ws && typeof this.ws.send === 'function' && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(message);
        console.log('WebSocket mesaj gönderildi:', message);
        return true;
      } catch (error) {
        console.error('WebSocket mesaj gönderme hatası:', error);
        return false;
      }
    } else {
      console.warn('WebSocket mesaj gönderilemedi:', {
        ws: this.ws,
        readyState: this.ws?.readyState,
        isConnected: this.isConnected
      });
      return false;
    }
  }

  // Motor komutu gönder
  sendMotorCommand(command) {
    const message = `motor_ct:${command}`;
    if (this.sendMessage(message)) {
      console.log(`Motor komutu gönderildi: ${command}`);
    }
  }

  // Sensör verisini parse et
  parseSensorData(message) {
    try {
      // Prefix'i kaldır
      let data = message.replace('sensor_data:', '');
      
      // Virgülle ayrılmış değerleri parse et
      const values = data.split(',').map(v => parseInt(v.trim()));
      
      if (values.length >= 10) {
        const sensorData = {
          us1: values[0],
          us2: values[1],
          gas1: values[2],
          gas2: values[3],
          imu1x: values[4],
          imu1y: values[5],
          imu1z: values[6],
          imu2x: values[7],
          imu2y: values[8],
          imu2z: values[9]
        };
        
        this.lastSensorUpdate = Date.now();
        
        // Tüm callback'lere veri gönder
        this.dataCallbacks.forEach(callback => {
          try {
            callback(sensorData);
          } catch (error) {
            console.error('Data callback hatası:', error);
          }
        });
        
        console.log('Sensör verisi güncellendi:', sensorData);
      }
    } catch (error) {
      console.error('Sensör verisi parse hatası:', error);
    }
  }

  // Veri callback'lerini kaydet
  onData(callback) {
    this.dataCallbacks.push(callback);
  }

  // Veri callback'lerini kaldır
  offData(callback) {
    this.dataCallbacks = this.dataCallbacks.filter(cb => cb !== callback);
  }

  // Bağlantı callback'lerini kaydet
  onConnection(callback) {
    this.connectionCallbacks.push(callback);
  }

  // Bağlantı callback'lerini kaldır
  offConnection(callback) {
    this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
  }

  // Bağlantıyı kapat
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      console.log('WebSocket bağlantısı kapatıldı');
    }
  }

  // Bağlantı durumunu kontrol et
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;

