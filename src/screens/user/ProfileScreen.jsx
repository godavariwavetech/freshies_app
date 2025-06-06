import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          // Limit to first 3 favorites for preview
          setFavorites(parsedFavorites.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  const renderFavoritePreview = () => {
    return favorites.map((item) => (
      <TouchableOpacity 
        key={item.id} 
        style={styles.favoriteItemContainer}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        <Image source={{ uri: item.image }} style={styles.favoriteItemImage} />
        <Text style={styles.favoriteItemName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={require('../../assets/profile-placeholder.png')} 
            style={styles.profileImage} 
          />
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
        </View>

        {/* Favorites Preview */}
        <View style={styles.favoritesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <TouchableOpacity 
              style={styles.seeAllButton} 
              onPress={() => navigation.navigate('MyFavoritesScreen')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.favoritesPreview}>
            {favorites.length > 0 ? (
              renderFavoritePreview()
            ) : (
              <Text style={styles.noFavoritesText}>No favorites yet</Text>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('MyFavoritesScreen')}
          >
            <View style={styles.menuItemContent}>
              <Icon name="heart" size={24} color="#FF6B6B" />
              <Text style={styles.menuItemText}>My Favorites</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          {/* Other existing menu items */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <View style={styles.menuItemContent}>
              <Icon name="list" size={24} color="#4A90E2" />
              <Text style={styles.menuItemText}>Order History</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuItemContent}>
              <Icon name="settings" size={24} color="#8E44AD" />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  favoritesSection: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllButton: {},
  seeAllText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  favoritesPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  favoriteItemContainer: {
    alignItems: 'center',
    width: '30%',
  },
  favoriteItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 5,
  },
  favoriteItemName: {
    fontSize: 12,
    textAlign: 'center',
  },
  noFavoritesText: {
    color: '#888',
    textAlign: 'center',
    width: '100%',
  },
  menuSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default ProfileScreen; 