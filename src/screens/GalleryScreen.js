import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Ionicons} from '@expo/vector-icons';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const GalleryScreen = ({navigation}) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, normal, thermal

  // Mock data - gerçek uygulamada AsyncStorage veya API'den gelecek
  useEffect(() => {
    const mockImages = [
      {
        id: '1',
        uri: 'https://picsum.photos/400/300?random=1',
        type: 'normal',
        timestamp: '2024-01-15 14:30:25',
        date: '2024-01-15',
        time: '14:30:25',
      },
      {
        id: '2',
        uri: 'https://picsum.photos/400/300?random=2',
        type: 'thermal',
        timestamp: '2024-01-15 14:30:25',
        date: '2024-01-15',
        time: '14:30:25',
      },
      {
        id: '3',
        uri: 'https://picsum.photos/400/300?random=3',
        type: 'normal',
        timestamp: '2024-01-15 14:28:15',
        date: '2024-01-15',
        time: '14:28:15',
      },
      {
        id: '4',
        uri: 'https://picsum.photos/400/300?random=4',
        type: 'thermal',
        timestamp: '2024-01-15 14:28:15',
        date: '2024-01-15',
        time: '14:28:15',
      },
      {
        id: '5',
        uri: 'https://picsum.photos/400/300?random=5',
        type: 'normal',
        timestamp: '2024-01-14 16:45:30',
        date: '2024-01-14',
        time: '16:45:30',
      },
      {
        id: '6',
        uri: 'https://picsum.photos/400/300?random=6',
        type: 'thermal',
        timestamp: '2024-01-14 16:45:30',
        date: '2024-01-14',
        time: '16:45:30',
      },
    ];
    setImages(mockImages);
  }, []);

  const filteredImages = images.filter(image => {
    if (filterType === 'all') return true;
    return image.type === filterType;
  });

  const groupedImages = filteredImages.reduce((groups, image) => {
    const date = image.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedImages).sort((a, b) => new Date(b) - new Date(a));

  const openFullScreen = (image) => {
    setSelectedImage(image);
    setShowFullScreen(true);
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
    setSelectedImage(null);
  };

  const renderImageItem = ({item}) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => openFullScreen(item)}
      activeOpacity={0.8}>
      <Image source={{uri: item.uri}} style={styles.thumbnail} resizeMode="cover" />
      <View style={styles.imageOverlay}>
        <View style={[styles.typeBadge, {backgroundColor: item.type === 'normal' ? '#2196F3' : '#ff9800'}]}>
          <Text style={styles.typeText}>
            {item.type === 'normal' ? 'Normal' : 'Termal'}
          </Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateSection = (date) => (
    <View key={date} style={styles.dateSection}>
      <Text style={styles.dateHeader}>{date}</Text>
      <FlatList
        data={groupedImages[date].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.imagesGrid}
      />
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Galeri</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Filtre Butonları */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
            onPress={() => setFilterType('all')}>
            <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>
              Tümü
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'normal' && styles.activeFilter]}
            onPress={() => setFilterType('normal')}>
            <Text style={[styles.filterText, filterType === 'normal' && styles.activeFilterText]}>
              Normal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'thermal' && styles.activeFilter]}
            onPress={() => setFilterType('thermal')}>
            <Text style={[styles.filterText, filterType === 'thermal' && styles.activeFilterText]}>
              Termal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Görüntü Listesi */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {sortedDates.map(renderDateSection)}
          
          {filteredImages.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Henüz görüntü bulunmuyor</Text>
            </View>
          )}
        </ScrollView>

        {/* Tam Ekran Modal */}
        <Modal
          visible={showFullScreen}
          transparent={true}
          animationType="fade"
          onRequestClose={closeFullScreen}>
          <View style={styles.fullScreenModal}>
            <TouchableOpacity
              style={styles.fullScreenCloseButton}
              onPress={closeFullScreen}
              activeOpacity={0.8}>
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            
            {selectedImage && (
              <View style={styles.fullScreenImageContainer}>
                <Image
                  source={{uri: selectedImage.uri}}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
                <View style={styles.fullScreenInfo}>
                  <Text style={styles.fullScreenCameraType}>
                    {selectedImage.type === 'normal' ? 'Normal Kamera' : 'Termal Kamera'}
                  </Text>
                  <Text style={styles.fullScreenTimestamp}>
                    {selectedImage.timestamp}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Modal>
      </View>
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
    backgroundColor: '#2196F3',
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 34,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  imagesGrid: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  imageItem: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 10,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  fullScreenInfo: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullScreenCameraType: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fullScreenTimestamp: {
    color: '#ccc',
    fontSize: 14,
  },
});

export default GalleryScreen;
