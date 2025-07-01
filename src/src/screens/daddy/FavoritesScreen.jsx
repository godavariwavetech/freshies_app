import React, { useState, useEffect } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const productCardWidth = (width - 32) / 2;

export default function FavoritesScreen({ navigation, route }) {
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [productStates, setProductStates] = useState({});

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Remove from favorites
  const removeFromFavorites = async (item) => {
    try {
      const updatedFavorites = favorites.filter(
        fav => !(fav.id === item.id && fav.category === item.category)
      );

      // Show toast notification when removing from favorites
      Toast.show({
        type: 'error',
        text1: 'Removed from Favorites',
        text2: `${item.name} has been removed from your favorites`,
        visibilityTime: 3000,
        autoHide: true,
      });

      // Update state and async storage
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

  // Handle buy once
  const handleBuyOnce = (productId) => {
    setProductStates(prev => ({
      ...prev,
      [productId]: { quantity: 1, isAdded: true },
    }));
  };

  // Handle increment
  const handleIncrement = (productId) => {
    setProductStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: prev[productId]?.quantity + 1 || 1,
      },
    }));
  };

  // Handle decrement
  const handleDecrement = (productId) => {
    setProductStates(prev => {
      const currentQuantity = prev[productId]?.quantity || 0;
      if (currentQuantity <= 1) {
        return {
          ...prev,
          [productId]: { quantity: 0, isAdded: false },
        };
      }
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: currentQuantity - 1,
        },
      };
    });
  };

  // Render product item
  const renderProduct = ({ item }) => {
    const productState = productStates[item.id] || { quantity: 0, isAdded: false };
    const { quantity, isAdded } = productState;

    return (
      <View style={[styles.productCard, { width: productCardWidth }]}>
        <TouchableOpacity 
          style={styles.favoriteIcon} 
          onPress={() => removeFromFavorites(item)}
        >
          <Icon name="favorite" size={18} color="#ff6b6b" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProductDetailsScreen', {
              item: { ...item, category: item.category, status: item.status },
            })
          }
        >
          <Image source={item.image} style={styles.productImage} />
        </TouchableOpacity>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productWeight}>{item.weight}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text style={styles.productOffer}>₹{item.offer}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
          {isAdded ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.quantityBtn} onPress={() => handleDecrement(item.id)}>
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityBtn} onPress={() => handleIncrement(item.id)}>
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.buyBtn, 
                { backgroundColor: item.status === 1 ? '#D32F2F' : '#056406' }
              ]}
              onPress={() => handleBuyOnce(item.id)}
            >
              <Text style={styles.buyText}>Buy Once</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Filtered favorites based on search
  const filteredFavorites = favorites.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
            <Icon name="shopping-cart" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your favorites"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />
      </View>

      {/* Product Grid */}
      <FlatList
        data={filteredFavorites}
        renderItem={renderProduct}
        keyExtractor={(item, index) => `${item.id}-${item.category}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="favorite-border" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Add items to favorites by tapping the heart icon
            </Text>
          </View>
        )}
      />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  // Use the same styles as in GroceriesScreen
  ...require('./GroceriesScreen').styles,
  
  // Add any additional or override styles specific to FavoritesScreen
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
}); 