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
import { addToWishlist, getWishlist, removeFromWishlist } from '../../services/services';
const { width } = Dimensions.get('window');
const productCardWidth = (width - 32) / 2;
import { useDispatch, useSelector } from 'react-redux';
import FocusAwareStatusBar from '../../components/CustomStatusBar';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const MyFavoritesScreen = () => {
  const { customerId } = useSelector(state => state.Auth);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true)
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState(null);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getWishlist(customerId);
      if (res.status === 200 && Array.isArray(res.data)) {
        const mapped = res.data.map(item => ({
          id: item.id,
          name: item.item_name,
          image: item.item_image,
          category: item.category_id, // or pass category name if available
          status: item.active_status,
          price: parseFloat(item.selling_price),
          originalPrice: parseFloat(item.actual_price),
          quantityType: item.quantity_type,
          unique_id: item.unique_id,
          sub_category_id: item.sub_category_id
        }));
        setFavorites(mapped);
        console.log("favorites", res.data)
      } else {
        setFavorites([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load favorites from server.',
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation, loadFavorites]);

  const filteredFavorites = favorites.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const toggleFavorite = async (item) => {
    if (updatingFavoriteId === item.id) return;

    setUpdatingFavoriteId(item.id);
    try {
      const isFavorited = !!item.id; // because id = wishlistId
      console.log("isss", isFavorited)
      if (isFavorited) {
        // Remove from wishlist
        const response = await removeFromWishlist({ wishlistId: item.id });
        console.log("deleteresponse", response)
        const updated = favorites.filter(fav => fav.id !== item.id);
        setFavorites(updated);
      } else {
        // In case you want to support adding back
        const response = await addToWishlist({
          customer_id: customerId,
          item_id: item.item_id, // if you have original item_id
          unique_id: item.unique_id,
        });

        const newWishlistId = response?.data?.wishlistId;
        const updatedItem = { ...item, id: newWishlistId };
        setFavorites([...favorites, updatedItem]);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error?.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update favorites',
        visibilityTime: 3000,
      });
    } finally {
      setUpdatingFavoriteId(null);
    }
  };


  const renderFavoriteItem = ({ item }) => {
    const imageSource = item.image
      ? { uri: item.image }
      : require('../daddy/tabassets/Rice.png');

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate('ProductDetailsScreen', {
          item: {
            ...item,
            subcategory_id: item.sub_category_id,
            variant: item.quantity_type
          },
          unique_id: item.unique_id,
        })}
      >
        <Image
          source={imageSource}
          style={styles.itemImage}
          defaultSource={require('../daddy/tabassets/Rice.png')}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name || 'Unnamed Item'}</Text>
          <Text style={styles.itemPrice}>
            ₹{item.price?.toFixed(2) || 'N/A'}
          </Text>
          <Text style={styles.itemCategory}>
            {item.quantityType ? `Quantity: ${item.quantityType}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item)}
          disabled={updatingFavoriteId === item.id}
        >
          <Icon
            name="heart"
            size={24}
            color={updatingFavoriteId === item.id ? '#ccc' : '#8655d2'}
          />
        </TouchableOpacity>

      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Navigates back to the previous screen
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

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

      {loading ? (
        <SkeletonPlaceholder
          backgroundColor="#E1E9EE"
          highlightColor="#F2F8FC"
          borderRadius={8}
        >
          <View style={{ padding: 16 }}>
            {[1, 2, 3, 1, 2, 3, 1, 2, 3,].map((_, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  marginBottom: 20,
                  alignItems: 'center',
                }}
              >
                {/* Image placeholder */}
                <View style={{ width: 80, height: 80, borderRadius: 8 }} />

                {/* Text placeholders */}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <View style={{ width: '60%', height: 20, marginBottom: 6 }} />
                  <View style={{ width: '40%', height: 16 }} />
                </View>
              </View>
            ))}
          </View>
        </SkeletonPlaceholder>
      ) : filteredFavorites.length === 0 ? (
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
          refreshing={loading}
          onRefresh={loadFavorites}
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
    backgroundColor: "#8655d2"
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "white"
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
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    height: 100,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },

});

export default MyFavoritesScreen; 