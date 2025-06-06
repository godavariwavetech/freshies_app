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
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getItems, getSubCategories } from '../../services/services';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
const { width, height } = Dimensions.get('window');
const productCardWidth = (width * 0.8 - 32) / 2;
const productAreaWidth = width * 0.55;
const filterSortButtonWidth = (productAreaWidth - 32) / 2;

// Define weight options
const weightOptions = [
  { label: '250g', value: '250g', priceMultiplier: 0.5 },
  { label: '500g', value: '500g', priceMultiplier: 1 },
  { label: '1kg', value: '1kg', priceMultiplier: 2 },
];

export default function GroceriesScreen({ navigation, route }) {
  const { status = 0, categoryKey, subcategory_id, category_id, subcategory_name } = route.params || {};
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(subcategory_id);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterOne, setFilterOne] = useState(null);
  const [sort, setSort] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedFilterOneValues, setSelectedFilterOneValues] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [activeFilterSection, setActiveFilterSection] = useState('Filter One');
  const [tempSelectedFilterOneValues, setTempSelectedFilterOneValues] = useState([]);
  const [tempSelectedPriceRanges, setTempSelectedPriceRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productWeights, setProductWeights] = useState({});

  const priceRangeOptions = [
    { label: '₹0 - ₹100', min: 0, max: 100 },
    { label: '₹101 - ₹250', min: 101, max: 250 },
    { label: '₹251 - ₹500', min: 251, max: 500 },
    { label: '₹501 - ₹1000', min: 501, max: 1000 },
    { label: 'Above ₹1000', min: 1001, max: Infinity },
  ];

  // Fetch subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subCats = await getSubCategories();
        console.log(subCats, "+++++++++++++++++subCats")
        const filteredSubcategories = subCats.filter((sub) => sub.category_id === category_id);
        setSubcategories(filteredSubcategories);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load subcategories',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      }
    };
    if (category_id) {
      fetchSubcategories();
    }
  }, [category_id]);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedSubcategoryId || !category_id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await getItems(selectedSubcategoryId, category_id);
        console.log("hero", response)
        const items = response.data || [];

        // Group items strictly by unique_id and sub_category_id
        const groupedItems = items.reduce((acc, item) => {
          // Only process items matching the selected subcategory
          if (item.sub_category_id === selectedSubcategoryId) {
            // Find existing group or create new one
            let existingGroup = acc.find(group => group.unique_id == item.unique_id);

            if (!existingGroup) {
              // Create new group with the first item
              existingGroup = {
                ...item,
                variants: [{
                  id: item.id,
                  actual_price: item.actual_price,
                  selling_price: item.selling_price,
                  filter_one: item.filter_one || 'Default',
                  quantity_type: item.quantity_type,
                  item_ind: item.item_ind
                }]
              };
              acc.push(existingGroup);
            } else {
              // Add variant to existing group if not already present
              const existingVariant = existingGroup.variants.find(v => v.quantity_type === item.quantity_type);
              if (!existingVariant) {
                existingGroup.variants.push({
                  id: item.id,
                  actual_price: item.actual_price,
                  selling_price: item.selling_price,
                  filter_one: item.filter_one || 'Default',
                  quantity_type: item.quantity_type,
                  item_ind: item.item_ind
                });
              }
            }
          }
          return acc;
        }, []);

        // Map grouped items to product structure
        const mappedProducts = groupedItems.map(item => ({
          id: item.unique_id, // Use unique_id as the main identifier
          unique_id: item.unique_id,
          name: item.item_name,
          brand: 'N/A',
          defaultWeight: item.variants[0].quantity_type,
          price: parseFloat(item.actual_price) || 0,
          offer: parseFloat(item.selling_price) || 0,
          image: item.item_image,
          filter_one: item.filter_one,
          description: item.item_description,
          item_ind: item.variants[0].item_ind, // Add item_ind to the product
          variants: item.variants, // Include all variants
          subscription: item.subscription
        }));

        setProducts(mappedProducts);
      } catch (error) {
        setError('Failed to load items');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load items for this subcategory',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [selectedSubcategoryId, category_id]);

  // Load favorites and cart
  const loadInitialData = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      const storedCartItems = await AsyncStorage.getItem('cartItems');
      if (storedCartItems) setCartItems(JSON.parse(storedCartItems));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load saved data',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(results);
    navigation.navigate('CategoriesScreen', {
      searchResults: results,
      searchQuery: text,
    });
  };

  const toggleFavorite = async (item) => {
    try {
      const itemKey = `${item.id}-${selectedSubcategoryId}`;
      let updatedFavorites;
      if (favorites.some((fav) => fav.key === itemKey)) {
        updatedFavorites = favorites.filter((fav) => fav.key !== itemKey);
        Toast.show({
          type: 'error',
          text1: 'Removed from Favorites',
          text2: `${item.name} removed from favorites`,
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      } else {
        updatedFavorites = [
          ...favorites,
          { ...item, subcategory_id: selectedSubcategoryId, status, key: itemKey },
        ];
        Toast.show({
          type: 'success',
          text1: 'Added to Favorites',
          text2: `${item.name} added to favorites`,
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      }
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update favorites',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    }
  };

  const isFavorite = (item) => {
    const itemKey = `${item.id}-${selectedSubcategoryId}`;
    return favorites.some((fav) => fav.key === itemKey);
  };

  const getAdjustedPrice = (product, weight) => {
    const weightOption = weightOptions.find((opt) => opt.value === weight);
    return product.price * (weightOption?.priceMultiplier || 1);
  };

  const handleBuyOnce = async (product) => {
    try {
      // If multiple variants exist and item_ind is 0, use first variant
      // If item_ind is 1 or only one variant, use that variant
      const selectedVariant = product.variants.length > 1 && product.item_ind === 0
        ? product.variants[0]
        : product.variants[0];

      const adjustedPrice = parseFloat(selectedVariant.actual_price) || 0;
      const adjustedOffer = parseFloat(selectedVariant.selling_price) || 0;

      const existingCartItems = await AsyncStorage.getItem('cartItems');
      const cart = existingCartItems ? JSON.parse(existingCartItems) : [];

      // Modify cart item finding logic to handle item_ind
      const existingItemIndex = cart.findIndex(
        (item) =>
          item.id === product.unique_id &&
          item.subcategory_id === selectedSubcategoryId &&
          // If multiple variants and item_ind is 0, match by quantity_type
          (product.variants.length > 1 && product.item_ind === 0
            ? item.variant.quantity_type === selectedVariant.quantity_type
            : true)
      );

      let updatedCart;
      if (existingItemIndex > -1) {
        updatedCart = cart.map((item, index) =>
          index === existingItemIndex
            ? {
              ...item,
              quantity: (item.quantity || 1) + 1,
              totalPrice: adjustedPrice * ((item.quantity || 1) + 1),
              variant: selectedVariant
            }
            : item
        );
      } else {
        updatedCart = [
          ...cart,
          {
            ...product,
            id: product.unique_id,
            quantity: 1,
            totalPrice: adjustedPrice,
            price: adjustedPrice,
            variant: selectedVariant,
            subcategory_id: selectedSubcategoryId,
            status,
          },
        ];
      }
      await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} ${product.variants.length > 1 && product.item_ind === 0 ? `(${selectedVariant.quantity_type})` : ''}added to cart`,
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add to cart',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    }
  };

  const handleIncrement = async (productId, quantityType) => {
    try {
      const existingCartItems = await AsyncStorage.getItem('cartItems');
      const cart = existingCartItems ? JSON.parse(existingCartItems) : [];
      const product = filteredProducts().find((p) => p.id === productId);

      // Modify finding logic to handle item_ind
      const existingItemIndex = cart.findIndex(
        (item) =>
          item.id === productId &&
          item.subcategory_id === selectedSubcategoryId &&
          // If multiple variants and item_ind is 0, match by quantity_type
          (product.variants.length > 1 && product.item_ind === 0
            ? item.variant.quantity_type === quantityType
            : true)
      );

      if (existingItemIndex > -1) {
        const selectedVariant = product.variants.length > 1 && product.item_ind === 0
          ? product.variants.find(v => v.quantity_type === quantityType)
          : product.variants[0];

        const adjustedPrice = parseFloat(selectedVariant.actual_price) || 0;

        const newQuantity = (cart[existingItemIndex].quantity || 1) + 1;
        cart[existingItemIndex] = {
          ...cart[existingItemIndex],
          quantity: newQuantity,
          totalPrice: adjustedPrice * newQuantity,
          price: adjustedPrice,
          variant: selectedVariant
        };
        await AsyncStorage.setItem('cartItems', JSON.stringify(cart));
        setCartItems([...cart]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update cart',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    }
  };

  const handleDecrement = async (productId, quantityType) => {
    try {
      const existingCartItems = await AsyncStorage.getItem('cartItems');
      const cart = existingCartItems ? JSON.parse(existingCartItems) : [];
      const product = filteredProducts().find((p) => p.id === productId);

      // Modify finding logic to handle item_ind
      const existingItemIndex = cart.findIndex(
        (item) =>
          item.id === productId &&
          item.subcategory_id === selectedSubcategoryId &&
          // If multiple variants and item_ind is 0, match by quantity_type
          (product.variants.length > 1 && product.item_ind === 0
            ? item.variant.quantity_type === quantityType
            : true)
      );

      if (existingItemIndex > -1) {
        const selectedVariant = product.variants.length > 1 && product.item_ind === 0
          ? product.variants.find(v => v.quantity_type === quantityType)
          : product.variants[0];

        const adjustedPrice = parseFloat(selectedVariant.actual_price) || 0;

        const newQuantity = Math.max((cart[existingItemIndex].quantity || 1) - 1, 0);
        if (newQuantity === 0) {
          cart.splice(existingItemIndex, 1);
        } else {
          cart[existingItemIndex] = {
            ...cart[existingItemIndex],
            quantity: newQuantity,
            totalPrice: adjustedPrice * newQuantity,
            price: adjustedPrice,
            variant: selectedVariant
          };
        }
        await AsyncStorage.setItem('cartItems', JSON.stringify(cart));
        setCartItems([...cart]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update cart',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    }
  };

  const navigateToBuyOnceScreen = () => {
    if (cartItems.length > 0) {
      navigation.navigate('ByOncescreen', { cartItems, status });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Cart is Empty',
        text2: 'Please add items to your cart',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    }
  };

  const getFilterOneOptions = () => {
    return [...new Set(products.map((product) => product.filter_one).filter(Boolean))];
  };

  const filteredProducts = () => {
    let filtered = products;
    if (selectedFilterOneValues.length > 0) {
      filtered = filtered.filter((product) => selectedFilterOneValues.includes(product.filter_one));
    }
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter((product) =>
        selectedPriceRanges.some((rangeLabel) => {
          const range = priceRangeOptions.find((r) => r.label === rangeLabel);
          const adjustedPrice = parseFloat(product.variants[0].actual_price) || 0;
          return adjustedPrice >= range.min && adjustedPrice <= range.max;
        })
      );
    }
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterOne) {
      filtered = filtered.filter((product) => product.filter_one === filterOne);
    }
    if (sort) {
      filtered = [...filtered];
      if (sort === 'A to Z') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'Z to A') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sort === 'Price (Low to High)') {
        filtered.sort(
          (a, b) =>
            parseFloat(a.variants[0].actual_price) - parseFloat(b.variants[0].actual_price)
        );
      } else if (sort === 'Price (High to Low)') {
        filtered.sort(
          (a, b) =>
            parseFloat(b.variants[0].actual_price) - parseFloat(a.variants[0].actual_price)
        );
      }
    }
    return filtered;
  };

  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedSubcategoryId === item.id && styles.selectedCategoryItem]}
      onPress={() => setSelectedSubcategoryId(item.id)}
    >
      <Image
        source={{ uri: item.sub_category_image || 'https://via.placeholder.com/30' }}
        style={[styles.categoryIcon, selectedSubcategoryId === item.id && styles.selectedCategoryIcon]}
        resizeMode="contain"
      />
      <Text
        style={[styles.categoryText, selectedSubcategoryId === item.id && styles.selectedCategoryText]}
        numberOfLines={2}
      >
        {item.sub_category_name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => {
    console.log(item);
    const cartItem = cartItems.find(
      (cartItem) =>
        cartItem.id === item.unique_id &&
        cartItem.subcategory_id === selectedSubcategoryId
    );

    // Use first variant as default or find selected variant
    const selectedQuantityType = productWeights[item.id] || item.variants[0].quantity_type;
    const selectedVariant = item.variants.find(v => v.quantity_type === selectedQuantityType) || item.variants[0];

    const adjustedPrice = parseFloat(selectedVariant.actual_price) || 0;
    const adjustedOffer = parseFloat(selectedVariant.selling_price) || 0;

    // Create variant options 
    const variantOptions = item.variants.map(v => ({
      label: `${v.quantity_type}`, // Use quantity_type for dropdown
      value: v.quantity_type
    }));

    return (
      <View style={[styles.productCard, { width: productCardWidth, minHeight: 270 }]}>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item)}
          accessibilityLabel={isFavorite(item) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Icon name={isFavorite(item) ? 'favorite' : 'favorite-border'} size={18} color="#9010BF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProductDetailsScreen', {
              item: {
                ...item,
                subcategory_id: selectedSubcategoryId,
                status,
                variant: selectedVariant
              },
              unique_id: item.unique_id,
              status,
              productType: status === 1 ? 'meat' : status === 2 ? 'pickles' : 'groceries',
            })
          }
        >
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/100' }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <Text style={styles.productName}>{item.name}</Text>
        {/* Conditionally render dropdown or text based on item_ind */}
        {item.variants.length > 1 && item.item_ind === 0 ? (
          <Dropdown
            style={styles.weightDropdown}
            placeholderStyle={styles.weightPlaceholder}
            selectedTextStyle={styles.weightSelectedText}
            iconStyle={styles.weightIcon}
            data={variantOptions}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select quantity"
            value={selectedQuantityType}
            onChange={(selected) => {
              setProductWeights((prev) => ({ ...prev, [item.id]: selected.value }));
            }}
          />
        ) : (
          <Text style={styles.quantityText}>{selectedVariant.quantity_type}</Text>
        )}

        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>₹{adjustedPrice.toFixed(2)}</Text>
          <Text style={styles.productOffer}>₹{adjustedOffer.toFixed(2)}</Text>
        </View>
        <View style={styles.buttonRow}>

          {item.subscription === 1 && (
            <TouchableOpacity
              style={[styles.subscribeBtn, { backgroundColor: '#FBEAEA', borderColor: '#9010BF' }]}
              onPress={() =>
                navigation.navigate('SubscriptionPage', {
                  productDetails: {
                    ...item,
                    subcategory_id: selectedSubcategoryId,
                    status,
                    variant: selectedVariant
                  },
                })
              }
            >
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>

          )}

          {cartItem ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => handleDecrement(item.id, selectedQuantityType)}
              >
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{cartItem.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => handleIncrement(item.id, selectedQuantityType)}
              >
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.buyBtn, { backgroundColor: '#9010BF' }]}
              onPress={() => handleBuyOnce(item)}
            >
              <Text style={styles.buyText}>Buy Once</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderFilterOption = () => {
    const filterSections = [
      {
        key: 'Filter One',
        options: getFilterOneOptions(),
        selectedState: tempSelectedFilterOneValues,
        setSelectedState: setTempSelectedFilterOneValues,
      },
      {
        key: 'Price Range',
        options: priceRangeOptions.map((range) => range.label),
        selectedState: tempSelectedPriceRanges,
        setSelectedState: setTempSelectedPriceRanges,
      },
    ];

    return (
      <View style={styles.filterModalContainer}>
        <View style={styles.filterLeftPanel}>
          {filterSections.map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[styles.filterLeftItem, activeFilterSection === section.key && styles.filterLeftItemActive]}
              onPress={() => setActiveFilterSection(section.key)}
            >
              <Text
                style={[styles.filterLeftText, activeFilterSection === section.key && styles.filterLeftTextActive]}
              >
                {section.key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRightPanel}>
          <ScrollView contentContainerStyle={styles.filterRightScrollContent} showsVerticalScrollIndicator={false}>
            {activeFilterSection === 'Filter One' && (
              <View style={styles.filterRightSection}>
                <Text style={styles.filterSectionTitle}>Select Type</Text>
                {getFilterOneOptions().map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.filterCheckboxContainer}
                    onPress={() => {
                      setTempSelectedFilterOneValues((prev) =>
                        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
                      );
                    }}
                  >
                    <View
                      style={[styles.checkbox, tempSelectedFilterOneValues.includes(value) && styles.checkboxSelected]}
                    >
                      {tempSelectedFilterOneValues.includes(value) && (
                        <Icon name="check" size={14} color="white" style={styles.checkIcon} />
                      )}
                    </View>
                    <Text style={styles.filterOptionText}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {activeFilterSection === 'Price Range' && (
              <View style={styles.filterRightSection}>
                <Text style={styles.filterSectionTitle}>Select Price Range</Text>
                {priceRangeOptions.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    style={styles.filterCheckboxContainer}
                    onPress={() => {
                      setTempSelectedPriceRanges((prev) =>
                        prev.includes(range.label) ? prev.filter((r) => r !== range.label) : [...prev, range.label]
                      );
                    }}
                  >
                    <View
                      style={[styles.checkbox, tempSelectedPriceRanges.includes(range.label) && styles.checkboxSelected]}
                    >
                      {tempSelectedPriceRanges.includes(range.label) && (
                        <Icon name="check" size={14} color="white" style={styles.checkIcon} />
                      )}
                    </View>
                    <Text style={styles.filterOptionText}>{range.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.filterActionContainer}>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setTempSelectedFilterOneValues([]);
                setTempSelectedPriceRanges([]);
              }}
            >
              <Icon name="clear" size={20} color="#666" style={styles.clearFilterIcon} />
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFilterButton}
              onPress={() => {
                setSelectedFilterOneValues(tempSelectedFilterOneValues);
                setSelectedPriceRanges(tempSelectedPriceRanges);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.applyFilterText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (filterModalVisible) {
      setTempSelectedFilterOneValues(selectedFilterOneValues);
      setTempSelectedPriceRanges(selectedPriceRanges);
    }
  }, [filterModalVisible]);

  const renderEmptyState = () => {
    const isFiltered = selectedFilterOneValues.length > 0 || selectedPriceRanges.length > 0 || searchQuery.trim() !== '';
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateTitle}>{isFiltered ? 'No Products Found' : 'No Items Available'}</Text>
        <Text style={styles.emptyStateSubtitle}>
          {isFiltered ? 'Try adjusting your filters.' : 'Check back later for new items.'}
        </Text>
        {isFiltered && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              setSelectedFilterOneValues([]);
              setSelectedPriceRanges([]);
              setSearchQuery('');
            }}
          >
            <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSortOption = (option) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => {
        setSort(option);
        setSortModalVisible(false);
      }}
    >
      <Text style={styles.modalOptionText}>{option}</Text>
    </TouchableOpacity>
  );

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#9010BF" />
  //       <Text style={styles.loadingText}>Loading...</Text>
  //     </View>
  //   );
  // }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyStateTitle}>{error}</Text>
        <TouchableOpacity
          style={styles.clearFilter}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            setSelectedSubcategoryId(selectedSubcategoryId);
          }}
        >
          <Text style={styles.clearFilterButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {status === 0 ? 'Groceries' : status === 1 ? 'Fresh Meat' : 'Pickles'}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('MyFavoritesScreen')}>
            <Icon name="favorite-border" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
            <Icon name="shopping-cart" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WalletScreen')}>
            <Ionicons name="wallet-outline" size={21} color="#000" style={styles.searchIcon} />
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

      <View style={styles.mainContent}>
        <View style={styles.sideMenu}>
          <FlatList
            data={subcategories}
            renderItem={renderSubcategory}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.categoryList}
            contentContainerStyle={styles.categoryListContent}
          />
        </View>
        <View style={styles.productArea}>
          <View style={styles.filterRow}>
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity
                style={[styles.filterBtn, filterOne && styles.filterBtnExpanded]}
                onPress={() => setFilterModalVisible(true)}
              >
                <Icon name="filter-list" size={16} color="#333" style={styles.filterIcon} />
                <Text style={styles.filterText}>Filter {filterOne ? `(${filterOne})` : ''}</Text>
                {filterOne && (
                  <TouchableOpacity
                    style={styles.deleteIconContainer}
                    onPress={() => setFilterOne(null)}
                  >
                    <Icon name="close" size={16} color="#666" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBtn, sort && styles.filterBtnExpanded]}
                onPress={() => setSortModalVisible(true)}
              >
                <Text style={styles.filterText}>Sort By {sort ? `(${sort})` : ''} </Text>
                <Icon name="arrow-drop-down" size={16} color="#333" style={styles.sortIcon} />
                {sort && (
                  <TouchableOpacity
                    style={styles.deleteIconContainer}
                    onPress={() => setSort(null)}
                  >
                    <Icon name="close" size={16} color="#666" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={filteredProducts()}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={[styles.productList, { paddingBottom: cartItems.length > 0 ? 80 : 16 }]}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={renderEmptyState}
          />
        </View>
      </View>

      {cartItems.length > 0 && (
        <View style={[styles.checkoutToast, { backgroundColor: '#9010BF' }]}>
          <View style={styles.checkoutToastContent}>
            <View style={styles.checkoutToastLeft}>
              <Text style={styles.checkoutToastTitle}>
                {cartItems.length} {cartItems.length > 1 ? 'items' : 'item'} added
              </Text>
              <Text style={styles.checkoutToastSubtitle}>
                ₹{cartItems
                  .reduce((total, item) => total + (item.totalPrice || item.price) * (item.quantity || 1), 0)
                  .toFixed(2)}{' '}
                • {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)} items
              </Text>
            </View>
            <View style={styles.checkoutToastRight}>
              <TouchableOpacity
                style={styles.checkoutToastRemove}
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('cartItems');
                    setCartItems([]);
                    Toast.show({
                      type: 'success',
                      text1: 'Cart Cleared',
                      position: 'top',
                      topOffset: 50,
                    });
                  } catch (error) {
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'Failed to clear cart',
                      position: 'top',
                      topOffset: 50,
                    });
                  }
                }}
              >
                <Text style={styles.checkoutToastRemoveText}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkoutToastCheckout, { backgroundColor: 'white' }]}
                onPress={navigateToBuyOnceScreen}
              >
                <Text style={[styles.checkoutToastCheckoutText, { color: '#9010BF' }]}>CHECKOUT</Text>
                <Icon name="arrow-right" size={20} color="#9010BF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        style={styles.bottomModal}
        backdropOpacity={0.5}
        swipeDirection={['down']}
        onSwipeComplete={() => setFilterModalVisible(false)}
      >
        <View style={styles.bottomModalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filter Options</Text>
          {renderFilterOption()}
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              setFilterOne(null);
              setFilterModalVisible(false);
            }}
          >
            <Text style={styles.modalOptionText}>Clear Filter</Text>
          </TouchableOpacity>
        </View>

      </Modal>
      <Modal
        isVisible={sortModalVisible}
        onBackdropPress={() => setSortModalVisible(false)}
        style={styles.bottomModal}
        backdropOpacity={0.5}
        swipeDirection={['down']}
        onSwipeComplete={() => setSortModalVisible(false)}
      >
        <View style={styles.bottomModalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Sort By</Text>
          {renderSortOption('A to Z')}
          {renderSortOption('Z to A')}
          {renderSortOption('Price (Low to High)')}
          {renderSortOption('Price (High to Low)')}
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              setSort(null);
              setSortModalVisible(false);
            }}
          >
            <Text style={styles.modalOptionText}>Clear Sort</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Toast position="top" topOffset={Platform.OS === 'ios' ? 50 : 30} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', flex: 1, textAlign: 'center' },
  headerIcons: { flexDirection: 'row', width: 80, justifyContent: 'space-between' ,gap: 10},
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
  mainContent: { flex: 1, flexDirection: 'row' },
  sideMenu: {
    width: width * 0.2,
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  categoryList: { flex: 1 },
  categoryListContent: { paddingVertical: 10 },
  categoryItem: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  selectedCategoryItem: {
    backgroundColor: '#9010BF',
    borderLeftWidth: 3,
    borderLeftColor: '#9010BF',
  },
  categoryIcon: { width: 30, height: 30, marginBottom: 8 },
  selectedCategoryIcon: { width: 30, height: 30, marginBottom: 8 },
  categoryText: {
    color: '#000',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: '100%',
  },
  selectedCategoryText: { color: '#fff', fontWeight: 'bold' },
  productArea: { width: productAreaWidth, flex: 1 },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#9010BF',
    borderRadius: 5,
  },
  filterBtnExpanded: {
    width: filterSortButtonWidth,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  filterIcon: { marginRight: 4 },
  sortIcon: { marginLeft: 2 },
  filterText: { color: '#9010BF', fontWeight: '500', fontSize: 12, flexShrink: 1 },
  deleteIconContainer: { paddingLeft: 4, paddingRight: 2, justifyContent: 'center', alignItems: 'center' },
  productList: { paddingHorizontal: 8 },
  columnWrapper: { justifyContent: 'flex-start', marginBottom: 8 },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
    width: productCardWidth,
    marginRight: 8,
    minHeight: 270,
    justifyContent: 'space-between',
  },
  productImage: {
    width: productCardWidth,
    height: (productCardWidth - 12) * 0.7,
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius:0,
    marginBottom: 2,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  weightDropdown: {
    width: '80%',
    height: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  weightPlaceholder: {
    fontSize: 12,
    color: '#666',
  },
  weightSelectedText: {
    fontSize: 12,
    color: '#333',
  },
  weightIcon: {
    width: 16,
    height: 16,
  },
  weightIconLeft: {
    marginRight: 5,
  },
  description: {
    color: '#666',
    fontSize: 7,
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    width: '100%',
  },
  productPrice: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 11,
    marginRight: 10,
  },
  productOffer: {
    color: '#888',
    fontSize: 7,
    textDecorationLine: 'line-through',
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    gap: 4,
    padding: 5
  },
  subscribeBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9010BF',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 4,
    flex: 1,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeText: {
    color: '#9010BF',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  buyBtn: {
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 6,
    flex: 1,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flex: 1,
    height: 24,
  },
  quantityBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantity: {
    fontSize: 10,
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  favoriteIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomModalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  checkoutToast: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    zIndex: 1000,
    elevation: 10,
  },
  checkoutToastContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutToastLeft: {},
  checkoutToastTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkoutToastSubtitle: {
    color: '#fff',
    fontSize: 12,
  },
  checkoutToastRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutToastRemove: {
    marginRight: 10,
  },
  checkoutToastRemoveText: {
    color: '#fff',
    fontSize: 14,
  },
  checkoutToastCheckout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  checkoutToastCheckoutText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterModalContainer: {
    flexDirection: 'row',
    height: height * 0.6,
    backgroundColor: 'white',
    borderTopLeftRadius: 15, // Fixed typo
    borderTopRightRadius: 15,
  },
  filterLeftPanel: {
    width: '30%',
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  filterLeftItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  filterLeftText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterRightPanel: {
    width: '70%',
    backgroundColor: 'white',
    padding: 10,
  },
  filterLeftItemActive: {
    backgroundColor: '#9010BF1A',
    borderLeftWidth: 4,
    borderLeftColor: '#9010BF',
  },
  filterLeftTextActive: {
    color: '#9010BF',
    fontWeight: 'bold',
  },
  filterRightOptions: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  filterRightSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filterCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 10, // Removed quotes
    borderBottomWidth: 1, // Removed quotes
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 20, // Removed quotes
    height: 20, // Removed quotes
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#9010BF',
    borderColor: '#9010BF',
  },
  checkIcon: {
    fontSize: 14,
    color: 'white',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearFilterText: {
    color: '#333',
    fontSize: 14,
  },
  filterActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyFilterButton: {
    backgroundColor: '#9010BF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  applyFilterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  clearFilterButtonText: {
    color: '#9010BF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});