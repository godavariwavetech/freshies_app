import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const productCardWidth = (width - 32) / 2;

const MyFavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const loadFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        // Ensure unique favorites by removing duplicates
        const uniqueFavorites = parsedFavorites.filter(
          (item, index, self) => 
            index === self.findIndex((t) => t.id === item.id && t.category === item.category)
        );
        setFavorites(uniqueFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation, loadFavorites]);

  const removeFromFavorites = async (itemToRemove) => {
    try {
      const updatedFavorites = favorites.filter(
        item => !(item.id === itemToRemove.id && item.category === itemToRemove.category)
      );
      
      // Show toast notification when removing from favorites
      Toast.show({
        type: 'error',
        text1: 'Removed from Favorites',
        text2: `${itemToRemove.name} has been removed from your favorites`,
        visibilityTime: 3000,
        autoHide: true,
      });

      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      
      // Show error toast if something goes wrong
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove from favorites. Please try again.',
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  const filteredFavorites = favorites.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFavoriteItem = ({ item }) => {
    // Validate image source
    const imageSource = item.image && typeof item.image === 'number' 
      ? item.image 
      : (item.image && typeof item.image === 'string' 
        ? { uri: item.image } 
        : require('../daddy/tabassets/Rice.png')); // Fallback placeholder

    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => navigation.navigate('ProductDetailsScreen', { 
          item: { 
            ...item, 
            category: item.category, 
            status: item.status 
          } 
        })}
      >
        <Image 
          source={imageSource} 
          style={styles.itemImage} 
          defaultSource={require('../daddy/tabassets/Rice.png')} 
          onError={(e) => {
            console.warn('Image load error:', e.nativeEvent.error);
          }}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name || 'Unnamed Item'}</Text>
          <Text style={styles.itemPrice}>
            {item.price ? `₹${item.price.toFixed(2)}` : 'N/A'}
          </Text>
          <Text style={styles.itemCategory}>
            {item.category ? `Category: ${item.category}` : ''}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => removeFromFavorites(item)}
          style={styles.favoriteIcon}
        >
          <Icon name="heart" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      {/* Header */}
      {/* <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View> */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search favorites"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite items yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on products to add them to favorites
          </Text>
        </View>
      ) : (
        <FlatList 
          data={filteredFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => `${item.id}-${item.category}`}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
  },
  favoriteIcon: {
    padding: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  itemCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default MyFavoritesScreen; 