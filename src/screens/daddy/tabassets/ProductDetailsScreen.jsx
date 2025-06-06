import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { getItemDetails, recommendItems } from '../../../services/services';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {

  const [productDetails, setProductDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [recommendedItems, setRecommendedItems] = useState([]);

  // Determine product type with multiple fallback methods
  const determineProductType = () => {
    if (route.params?.productType) {
      // console.log('Product Type from explicit param:', route.params.productType);
      return route.params.productType;
    }

    const status = route.params?.status || 0;
    if (status === 1) {
      // console.log('Product Type from status:', 'meat');
      return 'meat';
    } else if (status === 2) {
      // console.log('Product Type from status:', 'pickles');
      return 'pickles';
    }

    // console.log('Product Type default:', 'groceries');
    return 'groceries';
  };

  const productType = determineProductType();
  const { status = 0, getCategories } = route.params || {};
  const backgroundColor = productType === 'meat' ? '#6A48D2' : '#6A48D2';


  useEffect(() => {
    const subcategoryItems = async () => {
      const response = await recommendItems(route.params.item.subcategory_id);
      console.log("response", response.data)
      setRecommendedItems(response.data)
    }
    subcategoryItems()
  }, [route.params])

  // Fetch item details if unique_id is provided
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        if (route.params?.unique_id) {
          const response = await getItemDetails(route.params.unique_id);
          console.log("response2",response)
          if (response.data && response.data.length > 0) {
            const fetchedDetails = response.data;
            const processedDetails = fetchedDetails.map(detail => ({
              id: detail.id,
              unique_id: detail.unique_id,
              name: detail.item_name,
              image: detail.item_image,
              description: detail.item_description,
              filter_one: detail.filter_one,
              category_id: detail.category_id,
              sub_category_id: detail.sub_category_id,
              item_ind: detail.item_ind,
              quantity_type: detail.quantity_type,
              price: parseFloat(detail.actual_price),
              offer: parseFloat(detail.selling_price)
            }));
            setProductDetails(processedDetails);
            setSelectedWeight(processedDetails[0].quantity_type);
          }
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load product details',
          position: 'top',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetails();
  }, [route.params?.unique_id]);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
          const isCurrentItemFavorite = parsedFavorites.some(
            fav => fav.id === productDetails?.id && fav.category === productDetails?.category
          );
          setIsFavorite(isCurrentItemFavorite);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    if (productDetails) {
      loadFavorites();
    }
  }, [productDetails]);

  // StatusBar effect
  useEffect(() => {
    const height = getStatusBarHeight(true);
    setStatusBarHeight(height);

    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(backgroundColor || '#000');
    }

    return () => {
      StatusBar.setBarStyle('default');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#FFFFFF');
      }
    };
  }, [backgroundColor]);

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9010BF" />
        <Text>Loading product details...</Text>
      </View>
    );
  }

  // Render error state
  if (!productDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Product details not available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Simplified meat sizes for reference
  const meatSizes = [
    { id: 'small', label: 'Small', description: '250-300g' },
    { id: 'medium', label: 'Medium', description: '400-450g' },
    { id: 'large', label: 'Large', description: '600-650g' },
  ];

  const toggleFavorite = async () => {
    if (!productDetails) return;

    try {
      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = favorites.filter(
          fav => !(fav.id === productDetails.id && fav.category === productDetails.category)
        );
        Toast.show({
          type: 'error',
          text1: 'Removed from Favorites',
          text2: `${productDetails.name} has been removed from your favorites`,
          visibilityTime: 3000,
          autoHide: true,
        });
      } else {
        updatedFavorites = [
          ...favorites,
          {
            ...productDetails,
            category: productDetails.category || 'default',
            status,
            productType,
          },
        ];
        Toast.show({
          type: 'success',
          text1: 'Added to Favorites',
          text2: `${productDetails.name} has been added to your favorites`,
          visibilityTime: 3000,
          autoHide: true,
        });
      }

      setFavorites(updatedFavorites);
      setIsFavorite(!isFavorite);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update favorites. Please try again.',
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  // Restore dummy data for recommended products
  const groceriesProductsData = {
    millets: [
      { id: '1', name: 'Foxtail Millet', brand: 'Organic Harvest', defaultWeight: '500g', price: 60, offer: 78, image: require('../../daddy/tabassets/kodo.png'), quality: 'Top Quality' },
      { id: '2', name: 'Little Millet', brand: 'Nature\'s Bounty', defaultWeight: '500g', price: 55, offer: 70, image: require('../../daddy/tabassets/littlemillet.png'), quality: 'Low Quality' },
      { id: '3', name: 'Barnyard Millet', brand: 'Green Fields', defaultWeight: '500g', price: 52, offer: 65, image: require('../../daddy/tabassets/kodo.png'), quality: 'Top Quality' },
      { id: '4', name: 'Kodo Millet', brand: 'Earth\'s Best', defaultWeight: '500g', price: 48, offer: 60, image: require('../../daddy/tabassets/littlemillet.png'), quality: 'Low Quality' },
      { id: '5', name: 'Moong Dal', brand: 'Harvest Gold', defaultWeight: '500g', price: 100 },
      { id: '6', name: 'Chana Dal', brand: 'Organic Valley', defaultWeight: '1kg', price: 75, offer: 90, image: require('../../daddy/tabassets/littlemillet.png'), quality: 'Low Quality' },
    ],
    oils: [
      { id: '1', name: 'Sunflower Oil', brand: 'Fortune', defaultWeight: '1L', price: 120, offer: 150, image: require('../../daddy/tabassets/Oil.png'), quality: 'Top Quality' },
    ],
    rice: [
      { id: '1', name: 'Basmati Rice', brand: 'Tilda', defaultWeight: '1kg', price: 150, offer: 180, image: require('../../daddy/tabassets/Rice.png'), quality: 'Top Quality' },
    ],
    seeds: [
      { id: '1', name: 'Chia Seeds', brand: 'Eden Brothers', defaultWeight: '200g', price: 150, offer: 180, image: require('../../daddy/tabassets/Seeds.png'), quality: 'Top Quality' },
    ],
  };

  const meatProductsData = {
    chicken: [
      { id: '1', name: 'Boneless Wings', defaultWeight: '450 gm', price: 466, offer: 350, image: require('../../daddy/tabassets/bonelesswings.png'), skin: 'Skinless', brand: 'Farm Fresh' },
      { id: '2', name: 'Chicken Breast', defaultWeight: '450 gm', price: 466, offer: 350, image: require('../../daddy/tabassets/keema.png'), skin: 'Skin', brand: 'Venky\'s' },
      { id: '3', name: 'Chicken Thighs', defaultWeight: '450 gm', price: 466, offer: 350, image: require('../../daddy/tabassets/bonelesswings.png'), skin: 'Skinless', brand: 'Godrej' },
      { id: '4', name: 'Mince (Keema)', defaultWeight: '450 gm', price: 466, offer: 350, image: require('../../daddy/tabassets/keema.png'), skin: 'Skinless', brand: 'Real Good' },
      { id: '5', name: 'Curry Cut', defaultWeight: '450 gm', price: 466, offer: 350, image: require('../../daddy/tabassets/bonelesswings.png'), skin: 'Skin', brand: 'Farm Fresh' },
      { id: '6', name: 'Chicken Liver', defaultWeight: '450 gm', price: 466, offer: 350, image: require('../../daddy/tabassets/keema.png'), skin: 'Skinless', brand: 'Venky\'s' },
    ],
    mutton: {
      lamb: [
        { id: '1', name: 'Lamb Shoulder', defaultWeight: '450 gm', price: 600, offer: 500, image: require('../../daddy/tabassets/bonelesswings.png'), skin: 'Skin', brand: 'Premium Cuts' },
      ],
      maraka: [
        { id: '1', name: 'Maraka Leg', defaultWeight: '450 gm', price: 650, offer: 550, image: require('../../daddy/tabassets/keema.png'), skin: 'Skinless', brand: 'Premium Cuts' },
      ],
      meka: [
        { id: '1', name: 'Meka Shoulder', defaultWeight: '450 gm', price: 610, offer: 510, image: require('../../daddy/tabassets/bonelesswings.png'), skin: 'Skin', brand: 'Premium Cuts' },
      ],
    },
    fish: [
      { id: '1', name: 'Rohu Fish', defaultWeight: '1 kg', price: 300, offer: 250, image: require('../../daddy/tabassets/bonelesswings.png'), skin: 'Skin', brand: 'Sea Fresh' },
    ],
    prawns: [
      { id: '1', name: 'Tiger Prawns', defaultWeight: '500 gm', price: 700, offer: 600, image: require('../../daddy/tabassets/bonelesswings.png'), skin: 'Skinless', brand: 'Sea King' },
    ],
  };

  const picklesProductsData = {
    veg_pickles: [
      { id: '1', name: 'Tomato Pickle', brand: 'Priya', defaultWeight: '200g', price: 80, offer: 100, image: require('../../daddy/tabassets/veg.png'), quality: 'Top Quality' },
    ],
    nonveg_pickles: [
      { id: '1', name: 'Chicken Pickle', brand: 'Priya', defaultWeight: '200g', price: 120, offer: 150, image: require('../../daddy/tabassets/veg.png'), quality: 'Top Quality' },
    ],
  };

  // Determine recommended products based on product type
  const recommendedProducts = productType === 'groceries'
    ? Object.values(groceriesProductsData).flat()
    : productType === 'meat'
      ? Object.values(meatProductsData)
        .flatMap(category => Array.isArray(category) ? category : Object.values(category).flat())
      : productType === 'pickles'
        ? Object.values(picklesProductsData).flat()
        : [];

  // Filter out the current item and shuffle
  const shuffledRecommendedProducts = recommendedProducts
    .filter(product => product.id !== productDetails?.id || product.category !== productDetails?.category)
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);  

console.log(productDetails)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: statusBarHeight },
          ]}
        >
          <View style={styles.headerImageContainer}>
            <Image
              source={{ uri: productDetails[0].image }}
              style={styles.headerImage}
              defaultSource={require('../../daddy/tabassets/prawns.png')}
              onError={(e) => {
                console.log('Image load error:', e.nativeEvent.error);
              }}
            />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.8)']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientOverlay}
            />
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={wp('6%')} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={wp('6%')}
                color={isFavorite ? backgroundColor : '#000'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.productInfo}>
            {/* Display full item name */}
            <Text style={styles.productName}>
              {productDetails[0].name}
            </Text>
            {/* Quantity Type from Backend */}
            <View style={styles.weightOptions}>
              {productDetails.map((item, index) => (
                <TouchableOpacity
                  key={`${item.id}-${item.quantity_type}`}
                  style={[
                    styles.weightButton,
                    selectedWeight === item.quantity_type && [
                      styles.weightButtonSelected,
                      { backgroundColor, borderColor: backgroundColor },
                    ],
                  ]}
                  onPress={() => {
                    setSelectedWeight(item.quantity_type);
                  }}
                >
                  <Text
                    style={[
                      styles.weightText,
                      selectedWeight === item.quantity_type && [
                        styles.weightTextSelected,
                        { color: '#fff' },
                      ],
                    ]}
                  >
                    {item.quantity_type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Information for Selected Quantity */}
          <View style={styles.priceContainer}>
            {productDetails.map((item, index) => (
              selectedWeight === item.quantity_type && (
                <React.Fragment key={`price-${item.id}`}>
                  <Text style={styles.actualPriceText}>
                    Seelling Price: ₹{item.offer}
                  </Text>
                  <Text style={styles.offerPriceText}>
                    Actual Price: ₹{item.price}
                  </Text>
                </React.Fragment>
              )
            ))}
          </View>

          {/* Additional Product Information */}
          {/* <View style={styles.additionalInfoContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Item Name:</Text>
              <Text style={styles.detailValue}>{productDetails[0].name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category ID:</Text>
              <Text style={styles.detailValue}>{productDetails[0].category_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subcategory ID:</Text>
              <Text style={styles.detailValue}>{productDetails[0].sub_category_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Item Indicator:</Text>
              <Text style={styles.detailValue}>{productDetails[0].item_ind}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Filter:</Text>
              <Text style={styles.detailValue}>{productDetails[0].filter_one || 'N/A'}</Text>
            </View>
          </View> */}

          {/* Description Section */}
          <View style={styles.description}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {productDetails[0].description || 'No description available'}
            </Text>
          </View>

          {/* Additional Details */}
          {/* <View style={styles.additionalDetailsContainer}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category ID:</Text>
              <Text style={styles.detailValue}>{productDetails[0].category_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subcategory ID:</Text>
              <Text style={styles.detailValue}>{productDetails[0].sub_category_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Filter:</Text>
              <Text style={styles.detailValue}>{productDetails[0].filter_one || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Item Indicator:</Text>
              <Text style={styles.detailValue}>{productDetails[0].item_ind}</Text>
            </View>
          </View> */}

          {/* Restore Recommended Section */}
          <View style={styles.recommendedSection}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <Text style={styles.subTitle}>Customized picks just for you</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedScrollViewContent}
            >
              {recommendedItems.map((recItem) => (
                <TouchableOpacity
                  key={`${recItem.id}-${recItem.category || 'default'}`}
                  style={styles.recommendedItemContainer}
                  onPress={() => {
                    // Determine the product type for the recommended item
                    const recProductType = productType; // Since recommended items are already filtered by productType
                    navigation.push('ProductDetailScreen', {
                      item: {
                        ...recItem,
                        category: productDetails.category, // Preserve category for consistency
                        subcategory: productDetails.subcategory || undefined,
                        status,
                        productType: recProductType,
                      },
                      status,
                      productType: recProductType,
                      getCategories,
                    });
                  }}
                >
                  <Image source={{ uri: recItem.item_image }} style={styles.recommendedItemImage} />
                  <View style={styles.recommendedItemDetails}>
                    <Text style={styles.recommendedItemName} numberOfLines={1}>
                      {recItem.item_name}
                    </Text>
                    <Text style={styles.recommendedItemWeight}>
                      {recItem.quantity_type}
                    </Text>
                    <View style={styles.recommendedItemPriceContainer}>
                      <Text style={styles.recommendedItemPrice}>
                        ₹{recItem.selling_price}
                      </Text>

                      <Text style={[styles.recommendedItemOffer, { color: backgroundColor }]}>
                        ₹{recItem.actual_price}
                      </Text>

                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Bottom Bar for Buy and Subscribe */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.subscribeButton, { borderColor: backgroundColor }]}
            onPress={() => {
              // Find the selected item details
              const selectedItem = productDetails.find(
                item => item.quantity_type === selectedWeight
              );

              navigation.navigate('SubscriptionPage', {
                productDetails: selectedItem,
                status,
                getCategories,
                selectedQuantity: selectedWeight,
              });
            }}
          >
            <Text style={[styles.subscribeButtonText, { color: backgroundColor }]}>SUBSCRIBE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor }]}
            onPress={() => {
              // Find the selected item details
              const selectedItem = productDetails.find(
                item => item.quantity_type === selectedWeight
              );

              navigation.navigate('ByOncescreen', {
                productDetails: selectedItem,
                status,
                getCategories,
                selectedQuantity: selectedWeight,
              });
            }}
          >
            <Text style={styles.buyButtonText}>BUY ONCE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: hp('10%'),
  },
  headerImageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: hp('30%'),
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: hp('30%'),
  },
  backButton: {
    position: 'absolute',
    top: hp('5%'),
    left: wp('4%'),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: wp('2%'),
    zIndex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: hp('5%'),
    right: wp('4%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: wp('2%'),
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: wp('4%'),
  },
  productName: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('2%'),
  },
  weightOptions: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
  },
  weightButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    marginRight: wp('2%'),
  },
  weightButtonSelected: {
    borderWidth: 1,
  },
  weightText: {
    fontSize: wp('4%'),
    color: '#000',
  },
  weightTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  description: {
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#000',
    marginBottom: hp('1%'),
  },
  descriptionText: {
    fontSize: wp('3.5%'),
    color: '#666',
    lineHeight: hp('3%'),
  },
  priceContainer: {
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actualPriceText: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: 'bold',
    marginBottom: hp('0.5%'),
  },
  offerPriceText: {
    fontSize: wp('3%'),
    color: '#666',
    textDecorationLine: 'line-through',
  },
  additionalInfoContainer: {
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('0.5%'),
  },
  detailLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: '400',
    maxWidth: '60%',
    textAlign: 'right',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  subscribeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  subscribeButtonText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  buyButton: {
    flex: 1,
    borderRadius: 5,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: wp('4%'),
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
  },
  errorText: {
    fontSize: wp('5%'),
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  backButtonError: {
    borderRadius: 5,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
  },
  backButtonText: {
    fontSize: wp('4%'),
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: wp('4%'),
  },
  retryButton: {
    backgroundColor: '#9010BF',
    borderRadius: 5,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
  },
  retryButtonText: {
    fontSize: wp('4%'),
    color: '#fff',
    fontWeight: 'bold',
  },
  recommendedSection: {
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  subTitle: {
    fontSize: wp('4%'),
    color: '#666',
    marginBottom: hp('1%'),
  },
  recommendedScrollViewContent: {
    padding: wp('2%'),
  },
  recommendedItemContainer: {
    width: wp('30%'),
    marginRight: wp('4%'),
  },
  recommendedItemImage: {
    width: '100%',
    height: hp('15%'),
    resizeMode: 'cover',
    borderRadius: 5,
  },
  recommendedItemDetails: {
    padding: wp('2%'),
  },
  recommendedItemName: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  recommendedItemWeight: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  recommendedItemPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedItemPrice: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#000',
  },
  recommendedItemOffer: {
    fontSize: wp('3%'),
    textDecorationLine: 'line-through',
  },
});

export default ProductDetailScreen;