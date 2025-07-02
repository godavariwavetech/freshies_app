import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getSubCategories, getItems } from '../../services/services';
import PromoCard from '../../components/promocards';
import Skeleton from './Skeleton';
import FocusAwareStatusBar from '../../components/CustomStatusBar';
import { useDispatch, useSelector } from 'react-redux';

// Placeholder image URI
const placeholderImage = 'https://via.placeholder.com/100';

function UserHome() {
  const navigation = useNavigation();
  const totalItems = useSelector((state) => state.cart.totalItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  // Fetch subcategories and derive categories
  useEffect(() => {
    loadSubCategories();
  }, []);

  const loadSubCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedSubCategories = await getSubCategories();
      setSubCategories(fetchedSubCategories);
      const uniqueCategories = [
        ...new Map(
          fetchedSubCategories.map((sub) => [
            sub.category_id,
            { id: sub.category_id, name: sub.category_name },
          ])
        ).values(),
      ];
      setCategories(uniqueCategories);
      setError(null);
    } catch (error) {
      setError('Failed to load categories');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subcategories',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Filter subcategories by category_id
  const getSubCategoriesByCategoryId = (categoryId) => {
    return subcategories.filter((sub) => sub.category_id === categoryId);
  };
  // Combine all products for search
  const allProducts = subcategories.map((sub) => ({
    id: sub.id.toString(),
    category_name: sub.sub_category_name,
    category_image: { uri: sub.sub_category_image || placeholderImage },
    type: sub.category_name || 'Unknown',
  }));

  const handleSearch = (text) => {
    setSearchQuery(text);
    const results = allProducts.filter((product) =>
      product.category_name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(results);
    // navigation.navigate('CategoriesScreen', {
    //   searchResults: results,
    //   searchQuery: text,
    // });
  };

  const handleSubCategories = async (subcategory) => {
    navigation.navigate('GroceriesScreen', {
      subcategory_id: parseInt(subcategory.id),
      subcategory_name: subcategory.category_name,
      category_id: subcategory.category_id,
    });
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      // Re-fetch or reload your data here
      await loadSubCategories(); // Replace with your actual fetch logic
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.gradientContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SelectServiceFromLocation')}
            style={styles.locationContainer}
          >
            <Ionicons
              name="location-outline"
              size={21}
              color="#000"
              style={styles.searchIcon}
            />
            <View>
              <Text style={styles.locationTitle}>Delivery to:</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                Select your delivery location
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            {/* Wallet Button */}
            <TouchableOpacity onPress={() => navigation.navigate('Wlletscreen')} style={styles.supportButton}>
              <Ionicons
                name="wallet-outline"
                size={21}
                color="#000"
                style={styles.searchIcon}
              />
            </TouchableOpacity>
            {/* 🛒 Cart Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ByOncescreen')}
              style={styles.supportButton}
            >
              <View style={styles.iconWrapper}>
                <Ionicons
                  name="cart-outline"
                  size={22}
                  color="#000"
                />
                {totalItems > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{totalItems}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.searchContainer}>
          <Image
            source={require('./tabassets/searchhome.png')}
            style={styles.searchIcon}
          />
          <TextInput
            placeholderTextColor="#666666"
            placeholder="Search for meat, groceries & pickles"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            editable={true}
            onFocus={() => setSearchQuery('')}
            accessibilityLabel="Search products"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 5 }}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PromoCard />
        {/* Dynamically render sections for each category */}
        {categories.length === 0 && !isLoading && !error ? (
          <Text style={styles.errorText}>No categories available</Text>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.categoriesContainer}>
              <Text style={styles.categoriesTitle}>{category.name}</Text>
              {isLoading ? (
                <Skeleton />
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : getSubCategoriesByCategoryId(category.id).length === 0 ? (
                <Text style={styles.errorText}>No subcategories available</Text>
              ) : (
                <View style={styles.categoriesGridSmall}>
                  {getSubCategoriesByCategoryId(category.id).map((subcategory) => (
                    <TouchableOpacity
                      key={subcategory.id}
                      style={styles.categoryGridItemSmall}
                      onPress={() =>
                        handleSubCategories({
                          id: subcategory.id.toString(),
                          category_id: subcategory.category_id,
                          category_name: subcategory.sub_category_name,
                          category_image: { uri: subcategory.sub_category_image || placeholderImage },
                        })
                      }
                    >
                      <View style={styles.categoryGridItemContent}>
                        <View style={styles.imageWrapper}>
                          <Image
                            source={{ uri: subcategory.sub_category_image || placeholderImage }}
                            style={styles.categoryGridImageSmall}
                          />
                        </View>

                        <View style={{ minHeight: 20, justifyContent: 'center'}}>
                          <Text style={styles.categoryGridTextSmall} numberOfLines={2} ellipsizeMode="tail">
                            {subcategory.sub_category_name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
      <Toast />
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#8655d2"
          style={styles.loadingIndicator}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  gradientContainer: {
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),

  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

  },
  locationTitle: {
    color: '#545454',
    fontSize: 14,
    fontWeight: '400',
  },
  locationAddress: {
    color: '#000',
    fontWeight: '500',
    fontSize: 14,
    width: responsiveWidth(50),
  },
  supportButton: {
    width: 44,
    height: 44,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#000',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    paddingVertical: 0,
  },
  categoriesContainer: {
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 5,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  categoriesGridSmall: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 2,
  },
  categoryGridItemSmall: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 5,
  },
  categoryGridItemContent: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: "space-between",
  },

  imageWrapper: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#8655d2',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 5,
    overflow: 'hidden', // Better image clip
    alignItems: "center",
    justifyContent: "center",
  },
  categoryGridImageSmall: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // OR 'contain' based on preference
  },
  categoryGridTextSmall: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 4,
    lineHeight: 16,
    maxWidth: 100, // match imageWrapper width
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    padding: 10,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartBadge: {
    position: 'absolute',
    top: -7,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },


});

export default UserHome;