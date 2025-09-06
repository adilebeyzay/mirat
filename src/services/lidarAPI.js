// API Base URL - Backend server adresi
// Emülatör için 10.0.2.2, fiziksel cihaz için bilgisayarın IP adresi
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// API çağrısı yapmak için genel fonksiyon
const apiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API çağrısı başarısız');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// LIDAR API'leri
export const lidarAPI = {
  // LIDAR verisi ekle
  addData: async (lidarData) => {
    return await apiCall('/lidar', {
      method: 'POST',
      body: JSON.stringify(lidarData),
    });
  },

  // LIDAR verilerini getir (sayfalama ile)
  getData: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/lidar?${queryString}` : '/lidar';
    return await apiCall(endpoint);
  },

  // En son LIDAR verisini getir
  getLatestData: async () => {
    return await apiCall('/lidar/latest');
  },

  // Tüm LIDAR verilerini temizle
  clearData: async () => {
    return await apiCall('/lidar', {
      method: 'DELETE',
    });
  },

  // LIDAR taramasını başlat
  startScan: async (robotPosition = { x: 0, y: 0 }) => {
    return await apiCall('/lidar/start', {
      method: 'POST',
      body: JSON.stringify({ robotPosition }),
    });
  },

  // LIDAR taramasını durdur
  stopScan: async (scanId) => {
    return await apiCall('/lidar/stop', {
      method: 'POST',
      body: JSON.stringify({ scanId }),
    });
  },
};

export default lidarAPI;
