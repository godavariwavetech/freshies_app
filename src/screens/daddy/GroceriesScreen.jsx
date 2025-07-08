import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { getItems, getSubCategoriesById, removeFromWishlist, addToWishlist, getSubCategories } from '../../services/services';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart, updateQuantity, removeFromCart } from '../../redux/reducers/cartReducer';
import { RootState } from '../../redux/store'; // adjust path
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { compose } from '@reduxjs/toolkit';

const { width, height } = Dimensions.get('window');
const productCardWidth = (width * 0.8 - 32) / 2;
const productAreaWidth = width * 0.55;
const filterSortButtonWidth = (productAreaWidth - 32);

// Define weight options
const weightOptions = [
  { label: '250g', value: '250g', priceMultiplier: 0.5 },
  { label: '500g', value: '500g', priceMultiplier: 1 },
  { label: '1kg', value: '1kg', priceMultiplier: 2 },
];

export default function GroceriesScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { status = 0, subcategory_id, category_id, subcategory_name, filter_one } = route.params || {};
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(subcategory_id);
  const [subtotalcategories, setSubtotalcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterOne, setFilterOne] = useState(null);
  const [sort, setSort] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const cartItems = useSelector((state) => state.cart.items);
  const [selectedFilterOneValues, setSelectedFilterOneValues] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [activeFilterSection, setActiveFilterSection] = useState('Filter One');
  const [tempSelectedFilterOneValues, setTempSelectedFilterOneValues] = useState([]);
  const [tempSelectedPriceRanges, setTempSelectedPriceRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productWeights, setProductWeights] = useState({});
  const { location: storedLocation, locationName, locationId, address, customerId, mobileNumber, shopAddress } = useSelector(state => state.Auth);
  const totalItems = useSelector((state) => state.cart.totalItems);
  const walletData = useSelector((state) => state.wallet);
  const [sidebarSubcategories, setSideBarSubCategories] = useState([]);
  const [sideBardCategories, setSideBarCategories] = useState([]);
  const flatListRef = useRef(null);
  const [typeFilterModalVisible, setTypeFilterModalVisible] = useState(false);
  const [priceFilterModalVisible, setPriceFilterModalVisible] = useState(false);
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState(null);



  const priceRangeOptions = [
    { label: '₹0 - ₹100', min: 0, max: 100 },
    { label: '₹101 - ₹250', min: 101, max: 250 },
    { label: '₹251 - ₹500', min: 251, max: 500 },
    { label: '₹501 - ₹1000', min: 501, max: 1000 },
    { label: 'Above ₹1000', min: 1001, max: Infinity },
  ];


  // Fetch subcategories and derive categories
  useEffect(() => {
    loadSubCategories();
  }, []);

  const loadSubCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedSubCategories = await getSubCategories();
      setSideBarSubCategories(fetchedSubCategories);
      console.log('fetchedSubCategories', fetchedSubCategories);
      const uniqueCategories = [
        ...new Map(
          fetchedSubCategories.map((sub) => [
            sub.category_id,
            { id: sub.category_id, name: sub.category_name },
          ])
        ).values(),
      ];
      setSideBarCategories(uniqueCategories);
      setError(null);
    } catch (error) {
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subtotalcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subCats = await getSubCategoriesById({
          sub_category_id: route.params?.subcategory_id,
        });
        setSelectedSubcategoryId(subCats[0]?.id);
        console.log("subcategories", subCats)
        setSubtotalcategories(subCats);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load subtotalcategories',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      }
    };

    if (route.params?.category_id) {
      fetchSubcategories();
    }
  }, [route.params?.subcategory_id, route.params?.category_id]);


  const fetchItems = async () => {
    if (!selectedSubcategoryId || !category_id) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await getItems(selectedSubcategoryId, customerId, filter_one);
      const items = response.data || [];
      // Group items strictly by unique_id and sub_category_id
      const groupedItems = items.reduce((acc, item) => {
        // Only process items matching the selected subcategory
        if (item.subtotal_category_id === selectedSubcategoryId) {
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
        id: item.id, // Use unique_id as the main identifier
        category_id: item.category_id,
        sub_category_id: item.sub_category_id,
        subtotal_category_id: item.subtotal_category_id,
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
        subscription: item.subscription,
        wishlist_flag: item.wishlist_flag,
        wishlistId: item.wishlistId,
        value: item.value
      }));
      console.log("groupedItems", mappedProducts)
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
  // Fetch items
  useEffect(() => {
    fetchItems();
  }, [selectedSubcategoryId, route.params?.category_id]);


  const toggleFavorite = async (item) => {
    if (updatingFavoriteId === item.id) return; // prevent re-click

    setUpdatingFavoriteId(item.id);
    const isFavorited = item.wishlistId;

    try {
      if (isFavorited) {
        const response = await removeFromWishlist({ wishlistId: item.wishlistId });
          console.log("removal resposne", response)
        const updatedProducts = products.map((product) =>
          product.id === item.id
            ? { ...product, wishlist_flag: 0, wishlistId: null }
            : product
        );
        setProducts(updatedProducts);
      } else {
        const response = await addToWishlist({
          customer_id: customerId,
          item_id: item.id,
          unique_id: item.unique_id,
        });

        const newWishlistId = response?.data?.data?.insertId;

        const updatedProducts = products.map((product) =>
          product.id === item.id
            ? { ...product, wishlist_flag: 1, wishlistId: newWishlistId }
            : product
        );
        setProducts(updatedProducts);
      }
    } catch (error) {
      console.error('Wishlist API error:', error?.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update favorites',
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    } finally {
      setUpdatingFavoriteId(null);
    }
  };


  const isFavorite = (item) => item?.wishlist_flag === 1;


  const handleBuyOnce = async (product) => {
    // console.log("firstproduct:", product)
    try {
      // Get selected quantity type from productWeights or fallback to first
      const selectedQuantityType = productWeights[product.id] || product.variants[0].quantity_type;

      // Find the selected variant
      const selectedVariant = product.variants.find(
        (v) => v.quantity_type === selectedQuantityType
      ) || product.variants[0]; // fallback for safety

      const adjustedPrice = parseFloat(selectedVariant.selling_price) || 0;

      const cartItem = {
        ...product,
        id: `${product.unique_id}_${selectedVariant.id}`, // 🔥 use composite id,
        price: adjustedPrice,
        quantity: 1,
        variant: selectedVariant,
        subcategory_id: selectedSubcategoryId,
        category: product.category || '',
        status,
      };
      // console.log("thirdproduct:", cartItem)
      dispatch(addToCart(cartItem));
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
  // Redux-friendly version (in your component file)

  const dispatchIncrement = (compositeId, quantityType) => {
    const existingItem = cartItems.find(
      (item) => item.id === compositeId && item.variant?.quantity_type === quantityType
    );

    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + 1, 10);
      dispatch(updateQuantity({ id: compositeId, quantityType, quantity: newQuantity }));
    } else {
      console.warn("No matching item found for increment!");
    }
  };

  const dispatchDecrement = (compositeId, quantityType) => {
    const existingItem = cartItems.find(
      (item) => item.id === compositeId && item.variant?.quantity_type === quantityType
    );

    if (existingItem) {
      const newQuantity = Math.max(existingItem.quantity - 1, 0);
      if (newQuantity === 0) {
        dispatch(removeFromCart({ id: compositeId, quantityType }));
      } else {
        dispatch(updateQuantity({ id: compositeId, quantityType, quantity: newQuantity }));
      }
    } else {
      console.warn("No matching item found for decrement!");
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
            parseFloat(a.variants[0].selling_price) - parseFloat(b.variants[0].selling_price)
        );
      } else if (sort === 'Price (High to Low)') {
        filtered.sort(
          (a, b) =>
            parseFloat(b.variants[0].selling_price) - parseFloat(a.variants[0].selling_price)
        );
      }
    }
    return filtered;
  };

  const renderSidebarItem = ({ item }) => {
    if (item.type === 'label') {
      return (
        <View style={styles.sidebarLabelBanner}>
          <Text style={styles.sidebarLabelBannerText}>{item.title}</Text>
        </View>
      );
    }
    const isSelected =
      (item.type === 'subtotal' && selectedSubcategoryId === item.id)

    const handlePress = () => {
      if (item.type === 'subtotal') {
        setSelectedSubcategoryId(item.id);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); // 👈 scroll to top
      } else if (item.type === 'subcategory') {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); // 👈 scroll to top
        navigation.navigate('GroceriesScreen', {
          subcategory_id: parseInt(item.id),
          subcategory_name: item.sub_category_name,
          category_id: item.category_id,
        });
      }
    };
    const imageUrl = item.subtotal_category_image || item.sub_category_image;
    const label = item.subtotal_category_name || item.sub_category_name;
    return (
      <TouchableOpacity onPress={handlePress}>
        <View style={[
          styles.categoryItem,
          isSelected && styles.selectedCategoryItem
        ]}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.categoryIcon, isSelected && styles.selectedCategoryIcon]}
          />
          <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]} numberOfLines={2}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  const renderProduct = ({ item }) => {
    const selectedQuantityType = productWeights[item.id] || item.variants[0].quantity_type;
    const selectedVariant = item.variants.find(v => v.quantity_type === selectedQuantityType) || item.variants[0];
    const compositeId = `${item.unique_id}_${selectedVariant.id}`; // ✅ use same format as addToCart

    const cartItem = cartItems.find(cart => cart.id === compositeId);
    const adjustedPrice = parseFloat(selectedVariant.actual_price) || 0;
    const adjustedOffer = parseFloat(selectedVariant.selling_price) || 0;
    // Create variant options 
    const variantOptions = item.variants.map(v => ({
      label: `${v.quantity_type}`, // Use quantity_type for dropdown
      value: v.quantity_type
    }));

    return (
      <View style={[styles.productCard, { width: productCardWidth }]}>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item)}
          disabled={updatingFavoriteId === item.id}
          accessibilityLabel={isFavorite(item) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <View style={styles.favoriteIconWrapper}>
            <Icon
              name={isFavorite(item) ? 'favorite' : 'favorite-border'}
              size={20}
              color={updatingFavoriteId === item.id ? "#ccc" : "#9010BF"}
            />
          </View>
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
        <View style={styles.companyRow}>
          <Icon name="verified" size={14} color="#7D29E8" style={styles.companyIcon} />
          <Text style={styles.companyName}>{item.filter_one}</Text>
        </View>
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
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>₹{adjustedOffer.toFixed(2)}</Text>
          <Text style={styles.productOffer}>₹{adjustedPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.buttonRow}>
          {item.subscription === "1" && (
            <TouchableOpacity
              style={[styles.subscribeBtn, { backgroundColor: '#FBEAEA', borderColor: '#9010BF' }]}
              onPress={() => {
                const isAbhi24Category = item.id === category_id; // replace with actual category ID or condition

                const balanceToCheck = isAbhi24Category
                  ? parseFloat(walletData.abhi24_balanced_amount || '0')
                  : parseFloat(walletData.user_balance_amount || '0');

                if (balanceToCheck <= 0) {
                  navigation.navigate('Wlletscreen'); // 👈 adjust route name
                } else {
                  navigation.navigate('EditSubscribe', {
                    productDetails: {
                      ...item,
                      subcategory_id: selectedSubcategoryId,
                      status,
                      variant: selectedVariant,
                    },
                  });
                }
              }}
            >
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>

          )}

          {cartItem ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => dispatchDecrement(compositeId, selectedVariant.quantity_type)}
              >
                <Icon name="remove" size={18} color="#000" />
              </TouchableOpacity>

              <Text style={styles.quantity}>{cartItem.quantity}</Text>

              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => dispatchIncrement(compositeId, selectedVariant.quantity_type)}
              >
                <Icon name="add" size={17} color="#000" />
              </TouchableOpacity>
            </View>

          ) : (
            <TouchableOpacity
              style={[styles.buyBtn, { backgroundColor: '#8655d2' }]}
              onPress={() => handleBuyOnce(item)}
            >
              <Text style={styles.buyText}>Buy Once</Text>
            </TouchableOpacity>
          )}
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

  const selectedSubcategoryName = subtotalcategories[0]?.sub_category_name?.trim();

  const selectedType = sidebarSubcategories.find(
    cat => cat.sub_category_name?.trim() === selectedSubcategoryName
  )?.sub_category_type ?? "1"; // default to "1" (meat) if not found

  const type1Subcategories = sidebarSubcategories.filter(cat => cat.sub_category_type === "1");
  const type2Subcategories = sidebarSubcategories.filter(cat => cat.sub_category_type === "2");

  const preferredGroup = selectedType === "1" ? type1Subcategories : type2Subcategories;
  const secondaryGroup = selectedType === "1" ? type2Subcategories : type1Subcategories;

  const sortedRemainingSubcategories = [
    ...preferredGroup.sort((a, b) => a.sub_category_order - b.sub_category_order),
    ...secondaryGroup.sort((a, b) => a.sub_category_order - b.sub_category_order),
  ];

  const mergedSidebarItems = [
    ...subtotalcategories.map(item => ({
      ...item,
      type: 'subtotal',
    })),
    { type: 'label', title: 'Explore More' },
    ...sortedRemainingSubcategories.map(item => ({
      ...item,
      type: 'subcategory',
    })),
  ];




  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {subcategory_name}
        </Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.supportButton, { marginRight: 1 }]} onPress={() => navigation.navigate('MyFavoritesScreen')}>
            <Icon name="favorite-border" size={24} color="#000" />
          </TouchableOpacity>
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
          <TouchableOpacity style={[styles.supportButton, { marginRight: 1 }]} onPress={() => navigation.navigate('Wlletscreen')}>
            <Ionicons name="wallet-outline" size={21} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.sideMenu}>
          <FlatList
            ref={flatListRef}
            data={mergedSidebarItems}
            renderItem={renderSidebarItem}
            keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
            showsVerticalScrollIndicator={false}
            style={styles.categoryList}
          />

        </View>
        <View style={styles.productArea}>
          <View style={styles.filterRow}>
            <View style={styles.filterButtonsContainer}>
              {/* Type Filter Button */}
              <TouchableOpacity
                style={[styles.filterBtn, selectedFilterOneValues.length > 0 && styles.filterBtnExpanded]}
                onPress={() => setTypeFilterModalVisible(true)}
              >
                <Icon name="filter-list" size={16} color="#333" style={styles.filterIcon} />
                <Text style={styles.filterText}>
                  Brand{selectedFilterOneValues.length > 0 ? ` (${selectedFilterOneValues.length})` : ''}
                </Text>
                {selectedFilterOneValues.length > 0 && (
                  <TouchableOpacity
                    style={styles.deleteIconContainer}
                    onPress={() => setSelectedFilterOneValues([])}
                  >
                    <Icon name="close" size={16} color="#666" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Price Filter Button */}
              <TouchableOpacity
                style={[styles.filterBtn, selectedPriceRanges.length > 0 && styles.filterBtnExpanded]}
                onPress={() => setPriceFilterModalVisible(true)}
              >
                <Icon name="currency-rupee" size={14} color="#333" style={styles.filterIcon} />
                <Text style={styles.filterText}>
                  Price{selectedPriceRanges.length > 0 ? ` (${selectedPriceRanges.length})` : ''}
                </Text>
                {selectedPriceRanges.length > 0 && (
                  <TouchableOpacity
                    style={styles.deleteIconContainer}
                    onPress={() => setSelectedPriceRanges([])}
                  >
                    <Icon name="close" size={16} color="#666" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Sort Filter Button */}
              <TouchableOpacity
                style={[styles.filterBtn, sort && styles.filterBtnExpanded]}
                onPress={() => setSortModalVisible(true)}
              >
                <Icon name="sort" size={16} color="#333" style={styles.filterIcon} />
                <Text style={styles.filterText}>
                  Sort{sort ? ` (${sort})` : ''}
                </Text>
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
          {isLoading ? (
            <SkeletonPlaceholder borderRadius={8}>
              <View style={styles.skeletonWrapper}>
                {/* 2 cards in a row */}
                {[1, 2].map((_, index) => (
                  <View key={index} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonText} />
                    <View style={styles.skeletonTextSmall} />
                    <View style={styles.skeletonTextSmall} />
                    <View style={styles.skeletonButtonsRow}>
                      <View style={styles.skeletonButton} />
                      <View style={styles.skeletonButton} />
                    </View>
                  </View>
                ))}
              </View>
            </SkeletonPlaceholder>
          ) : (
            <FlatList
              data={filteredProducts()}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={[
                styles.productList,
                { paddingBottom: cartItems.length > 0 ? 80 : 16 },
              ]}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.columnWrapper}
              ListEmptyComponent={renderEmptyState}
            />
          )}

        </View>
      </View>

      {cartItems.length > 0 && (
        <View style={[styles.checkoutToast, { backgroundColor: '#8655d2' }]}>
          <View style={styles.checkoutToastContent}>
            <View style={styles.checkoutToastLeft}>
              <Text style={styles.checkoutToastTitle}>
                {cartItems.length} {cartItems.length > 1 ? 'items' : 'item'} added
              </Text>
              <Text style={styles.checkoutToastSubtitle}>
                ₹{cartItems
                  .reduce((total, item) => total + (item.totalPrice || item.price) * (item.quantity || 1), 0)
                  .toFixed(2)}{' '}
                • {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)} SubItems
              </Text>
            </View>
            <View style={styles.checkoutToastRight}>
              <TouchableOpacity
                style={styles.checkoutToastRemove}
                onPress={() => {
                  dispatch(clearCart());
                  Toast.show({
                    type: 'success',
                    text1: 'Cart Cleared',
                    position: 'top',
                    topOffset: 50,
                  });
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
        isVisible={typeFilterModalVisible}
        onBackdropPress={() => setTypeFilterModalVisible(false)}
        style={styles.bottomModal}
      >
        <View style={styles.bottomModalContent}>
          <Text style={styles.modalTitle}>Select Type</Text>
          <ScrollView>
            {getFilterOneOptions().map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.filterCheckboxContainer}
                onPress={() => {
                  setSelectedFilterOneValues((prev) =>
                    prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
                  );
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedFilterOneValues.includes(value) && styles.checkboxSelected,
                  ]}
                >
                  {selectedFilterOneValues.includes(value) && (
                    <Icon name="check" size={14} color="white" />
                  )}
                </View>
                <Text style={styles.filterOptionText}>{value}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              setTypeFilterModalVisible(false);
            }}
          >
            <Text style={styles.modalOptionText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>


      <Modal
        isVisible={priceFilterModalVisible}
        onBackdropPress={() => setPriceFilterModalVisible(false)}
        style={styles.bottomModal}
      >
        <View style={styles.bottomModalContent}>
          <Text style={styles.modalTitle}>Select Price Range</Text>
          <ScrollView>
            {priceRangeOptions.map((range) => (
              <TouchableOpacity
                key={range.label}
                style={styles.filterCheckboxContainer}
                onPress={() => {
                  setSelectedPriceRanges((prev) =>
                    prev.includes(range.label) ? prev.filter((r) => r !== range.label) : [...prev, range.label]
                  );
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedPriceRanges.includes(range.label) && styles.checkboxSelected,
                  ]}
                >
                  {selectedPriceRanges.includes(range.label) && (
                    <Icon name="check" size={14} color="white" />
                  )}
                </View>
                <Text style={styles.filterOptionText}>{range.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => {
              setPriceFilterModalVisible(false);
            }}
          >
            <Text style={styles.modalOptionText}>Done</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  headerIcons: { flexDirection: 'row', justifyContent: 'space-between', gap: 1, alignItems: "center" },
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
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',

  },
  categoryList: { flex: 1 },
  categoryListContent: { paddingVertical: 1 },
  categoryItem: {
    backgroundColor: 'white',
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectedCategoryItem: {
    borderLeftWidth: 5,
    borderLeftColor: '#8655d2',
    backgroundColor: '#f3e8ff', // light lavender background
    borderRadius: 5,
    shadowColor: '#8655d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // for Android
    flexDirection: 'column',
    alignItems: 'center',
  },

  categoryIcon: { width: "100%", height: 50, marginBottom: 5, borderRadius: 2, resizeMode: 'contain' },
  selectedCategoryIcon: { width: "100%", height: 50, marginBottom: 5, resizeMode: 'contain' },
  categoryText: {
    color: '#000',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: '100%',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
    color: '#8655d2',
  },
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
    width: "auto",
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    borderColor: '#7D29E8',           // Primary color
    backgroundColor: '#EFE4FF',
  },
  filterBtnExpandedText: {
    color: '#7D29E8', // Match highlight
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

    justifyContent: 'space-between',
  },
  productImage: {
    width: productCardWidth,
    height: (productCardWidth - 5) * 0.8,
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  companyName: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  companyIcon: {
    marginRight: 5,
    marginTop: 1,
  },

  companyName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },

  productPrice: {
    color: '#E53935', // 🔴 Red offer price
    fontWeight: '700',
    fontSize: 14,
    marginRight: 8,
  },

  productOffer: {
    color: '#9E9E9E', // Muted gray for MRP
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    gap: 4,
    padding: 4
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
    marginBottom: 5
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
    height: 30,
  },
  quantityBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sidebarSectionTitle: {
    fontWeight: 'bold',
    fontSize: 7,
    marginVertical: 8,
    paddingHorizontal: 12,
    color: '#7B4BB7',
    backgroundColor: "yellow",
    textAlign: "center"
  },

  quantity: {
    fontSize: 15,
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  favoriteIcon: {
    position: 'absolute',
    right: 3,
    top: 3,
    zIndex: 1,
  },
  favoriteIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  supportButton: {
    width: 44,
    height: 44,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeletonCard: {
    width: '47%',
    marginBottom: 20,
  },
  skeletonImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  skeletonText: {
    marginTop: 8,
    width: '80%',
    height: 16,
  },
  skeletonTextSmall: {
    marginTop: 6,
    width: '60%',
    height: 12,
  },
  skeletonButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  skeletonButton: {
    width: '48%',
    height: 32,
    borderRadius: 4,
  },
  sidebarLabelBanner: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 4,
  },

  sidebarLabelBannerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    textTransform: 'uppercase',
  },


});





















// const renderSubcategory = ({ item }) => {
//   const isSelected = selectedSubcategoryId === item.id;

//   const content = (
//     <>
//       <Image
//         source={{ uri: item.subtotal_category_image || 'https://via.placeholder.com/30' }}
//         style={[styles.categoryIcon, isSelected && styles.selectedCategoryIcon]}
//       />
//       <Text
//         style={[styles.categoryText, isSelected && styles.selectedCategoryText]}
//         numberOfLines={2}
//       >
//         {item.subtotal_category_name}
//       </Text>
//     </>
//   );

//   if (isSelected) {
//     return (
//       <TouchableOpacity onPress={() => setSelectedSubcategoryId(item.id)}>
//         <LinearGradient
//           colors={['#ffffff', '#f2e9fc']} // Very light violet gradient
//           style={[styles.categoryItem, styles.selectedCategoryItem]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 0, y: 1 }}
//         >
//           {content}
//         </LinearGradient>
//       </TouchableOpacity>
//     );
//   } else {
//     return (
//       <TouchableOpacity
//         style={styles.categoryItem}
//         onPress={() => setSelectedSubcategoryId(item.id)}
//       >
//         {content}
//       </TouchableOpacity>
//     );
//   }
// };