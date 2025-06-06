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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getSubCategories, getItems } from '../../services/services';
import PromoCard from '../../components/promocards';
import Skeleton from './Skeleton';

// Placeholder image URI
const placeholderImage = 'https://via.placeholder.com/100';

function UserHome() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map sub_category_name to GroceriesScreen categoryKey
  const subcategoryToCategoryMap = {
    'Rice': 'rice',
    'Oils': 'oils',
    'Millets': 'millets',
    'Seeds': 'seeds',
    'Chicken': 'chicken',
    'Mutton': 'mutton',
    'Fish': 'fish',
    'Prawns': 'prawns',
    'Veg Pickles': 'veg_pickles',
    'Non-Veg Pickles': 'nonveg_pickles',
  };

  // Fetch subcategories and derive categories
  useEffect(() => {
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

    loadSubCategories();
  }, []);


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
    navigation.navigate('CategoriesScreen', {
      searchResults: results,
      searchQuery: text,
    });
  };

  const handleSubCategories = async (subcategory) => {
    if (subcategory.category_name === 'Soaps (Chemical free)' || subcategory.category_name === 'Soaps Organic') {
      Toast.show({
        type: 'info',
        text1: 'Coming Soon',
        text2: `${subcategory.category_name} section is under development`,
        duration: 3000,
        autoHide: true,
      });
      return;
    }

    try {
      // Fetch items for the subcategory
      const items = await getItems(subcategory.id, subcategory.category_id);

      // Map sub_category_name to categoryKey
      const categoryKey = subcategoryToCategoryMap[subcategory.category_name] || subcategory.category_name.toLowerCase();

      // Navigate to GroceriesScreen with items
      navigation.navigate('GroceriesScreen', {
        status: subcategory.category_id === 1 ? 1 : subcategory.category_id === 3 ? 2 : 0, // Map category_id to status
        categoryKey,
        subcategory_id: parseInt(subcategory.id),
        subcategory_name: subcategory.category_name,
        category_id: subcategory.category_id,
        items, // Pass fetched items
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load items for this category',
        duration: 3000,
        autoHide: true,
      });
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="white" barStyle="dark-content" translucent={false} />
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
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('BuyOnceScreen')} style={styles.supportButton}>
              <Image
                source={{ uri: placeholderImage }}
                style={{ width: 24, height: 24, tintColor: '#000' }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Wlletscreen')} style={styles.supportButton}>
              <Ionicons
                name="wallet-outline"
                size={21}
                color="#000"
                style={styles.searchIcon}
              />
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
                        <Image
                          source={{
                            uri: subcategory.sub_category_image || placeholderImage,
                          }}
                          style={styles.categoryGridImageSmall}
                          resizeMode="cover"
                        />
                        <Text style={styles.categoryGridTextSmall}>{subcategory.sub_category_name}</Text>
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
          color="#6A48D2"
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
    marginRight: 8,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
  },
  categoryGridItemSmall: {
    width: 'auto',
    flexBasis: '25%',
    aspectRatio: 0.9,
    paddingHorizontal: 1,
  },
  categoryGridItemContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  categoryGridImageSmall: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    marginBottom: 5,
    borderRadius: 10,
  },
  categoryGridTextSmall: {
    fontSize: 11,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 2,
    flexWrap: 'wrap',
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
});

export default UserHome;