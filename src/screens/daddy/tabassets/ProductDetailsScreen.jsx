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
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { addToWishlist, getItemDetails, recommendItems, removeFromWishlist } from '../../../services/services';
import { combineSlices } from '@reduxjs/toolkit';
import FocusAwareStatusBar from '../../../components/CustomStatusBar';
import { useDispatch, useSelector } from 'react-redux';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { addToCart } from '../../../redux/reducers/cartReducer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');


const ProductDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [productDetails, setProductDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const { customerId } = useSelector(state => state.Auth);
  const { status = 0, getCategories } = route.params || {};
  const [showFull, setShowFull] = useState(false);
  const walletData = useSelector((state) => state.wallet);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
    const insets = useSafeAreaInsets();


  const previewLength = 200; // chars

  const backgroundColor = '#117943';



  useEffect(() => {
    const subcategoryItems = async () => {
      const response = await recommendItems(route.params.item.sub_category_id);
      setRecommendedItems(response.data)
    }
    subcategoryItems()
  }, [route.params])

  // Fetch item details if unique_id is provided
  useEffect(() => {
    fetchItemDetails();
  }, [route.params?.unique_id]);

  const fetchItemDetails = async () => {
    try {
      const response = await getItemDetails(customerId, route.params.unique_id);
      if (response.data && response.data.length > 0) {
        const fetchedDetails = response.data;
      
        const processedDetails = fetchedDetails.map(detail => ({
          ...detail,
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
          offer: parseFloat(detail.selling_price),
          productLink: detail.product_link,
          wishlist_flag: detail.wishlist_flag,
          wishlistId: detail.wishlistId
        }));
        setProductDetails(processedDetails);
      
        setIsFavorite(processedDetails[0].wishlistId);
        setSelectedWeight(processedDetails[0].quantity_type);
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
  const toggleFavorite = async () => {
    if (isUpdatingFavorite) return; // prevent double click
    if (!productDetails || productDetails.length === 0) return;

    setIsUpdatingFavorite(true);

    const selectedIndex = productDetails.findIndex(p => p.quantity_type === selectedWeight);
    const item = productDetails[selectedIndex];
    const isFavorited = item.wishlistId;

    try {
      let updatedItem = { ...item };

      if (isFavorited) {
        const response = await removeFromWishlist({ wishlistId: item.wishlistId });
        updatedItem.wishlist_flag = 0;
        updatedItem.wishlistId = null;
      } else {
        const response = await addToWishlist({
          customer_id: customerId,
          item_id: item.id,
          unique_id: item.unique_id,
        });

        const newWishlistId = response?.data?.wishlistId;
        updatedItem.wishlist_flag = 1;
        updatedItem.wishlistId = newWishlistId;
      }

      const updatedProducts = [...productDetails];
      updatedProducts[selectedIndex] = updatedItem;

      setProductDetails(updatedProducts);
      setIsFavorite(updatedItem.wishlist_flag === 1);
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
      setIsUpdatingFavorite(false);
    }
  };



  const handleBuyOnce = async (product) => {

    try {
      const selectedQuantityType = selectedWeight || product.variants[0].quantity_type;

      const cartItem = {
        ...product,
        id: `${product.unique_id}_${product.id}`, // 🔥 use composite id,
        quantity: 1,
        variant: selectedQuantityType,
        subcategory_id: product.sub_category_id,
        category: product.category || '',
        status,
      };
   
      dispatch(addToCart(cartItem));
      navigation.navigate('ByOncescreen', {
        productDetails: product,
        // status,
        // getCategories,
        // selectedQuantity: selectedWeight,
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

  const toggleDescription = () => setShowFull(prev => !prev);

  const description = productDetails[0]?.description || 'No description available';

  const getThumbnailFromLink = (url) => {
    if (!url) return null;

    // Handle YouTube only
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([-_a-zA-Z0-9]{11})/;
    const match = url.match(youtubeRegex);

    if (match) {
      return {
        type: 'youtube',
        uri: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`,
      };
    }

    // For Instagram or unknown links, no thumbnail
    return {
      type: 'none',
      uri: null,
    };
  };


  const thumbnail = getThumbnailFromLink(productDetails[0].productLink);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#117943" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={true}
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
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={toggleFavorite}
              disabled={isUpdatingFavorite}
            >
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={wp('6%')}
                color={isUpdatingFavorite ? '#ccc' : isFavorite ? backgroundColor : '#000'}
              />
            </TouchableOpacity>


          </View>

          <View style={styles.productInfo}>
            {/* Display full item name */}
            <Text style={styles.productName}>
              {productDetails[0].name}
            </Text>
            {/* Quantity Type from Backend - wraps to next line when row is full */}
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
                    Selling Price: ₹{item.offer}
                  </Text>
                  <Text style={styles.offerPriceText}>
                    Actual Price: ₹{item.price}
                  </Text>
                </React.Fragment>
              )
            ))}
          </View>

          <TouchableOpacity style={styles.brandCard} onPress={() => navigation.navigate('GroceriesScreen', {
            subcategory_id: productDetails[0].sub_category_id,
            subcategory_name: productDetails[0]?.filter_one || "",
            category_id: productDetails[0].category_id,
            filter_one: productDetails[0]?.filter_one
          })}>
            <View style={styles.brandCardContent}>
              {/* Optional brand icon - use your own or fallback to generic */}
              <Icon2 name="local-offer" size={24} color="#FFD700" style={styles.brandIcon} />

              <Text style={styles.brandCardText}>View all {productDetails[0].filter_one} products</Text>

              <Icon2 name="chevron-right" size={26} color="#888" />
            </View>
          </TouchableOpacity>


          {/* Description Section */}
          <View style={styles.description}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {showFull || description.length <= previewLength
                ? description
                : `${description.slice(0, previewLength)}...`}
            </Text>
            {description.length > previewLength && (
              <TouchableOpacity onPress={toggleDescription}>
                <Text style={styles.readMoreText}>{showFull ? 'Read Less ▲' : 'Read More ▼'}</Text>
              </TouchableOpacity>
            )}

            {productDetails[0].productLink && (
              <TouchableOpacity
                style={styles.videoLinkCard}
                onPress={() => Linking.openURL(productDetails[0].productLink)}
                activeOpacity={0.8}
              >
                {/* Show preview image only for YouTube */}
                {productDetails[0].productLink.includes('youtube') && thumbnail?.uri && (
                  <Image
                    source={{ uri: thumbnail.uri }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.videoLinkContent}>
                  <Icon2
                    name={
                      productDetails[0].productLink.includes('youtube')
                        ? 'ondemand-video'
                        : productDetails[0].productLink.includes('instagram')
                          ? 'video-library'
                          : 'play-circle'
                    }
                    size={24}
                    color="#ff4444"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.videoLinkText}>
                    {productDetails[0].productLink.includes('youtube')
                      ? 'Watch on YouTube'
                      : productDetails[0].productLink.includes('instagram')
                        ? 'Watch on Instagram'
                        : 'View More details'}
                  </Text>
                  <Icon2 name="chevron-right" size={22} color="#888" />
                </View>
              </TouchableOpacity>
            )}


          </View>

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
                  onPress={() =>
                    navigation.navigate('ProductDetailsScreen', {
                      item: {
                        ...recItem,
                        subcategory_id: recItem.sub_category_id,
                        variant: ""
                      },
                      unique_id: recItem.unique_id,

                    })
                  }
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
        <View style={[styles.bottomBar, {bottom: insets.bottom}]}>
          <TouchableOpacity
            style={[styles.subscribeButton, { borderColor: backgroundColor }]}
            onPress={() => {
              const isAbhi24Category = false;

              const selectedItem = productDetails.find(
                item => item.quantity_type === selectedWeight
              );
              const balanceToCheck = isAbhi24Category
                ? parseFloat(walletData.abhi24_balanced_amount || '0')
                : parseFloat(walletData.user_balance_amount || '0');

              if (balanceToCheck <= 0) {
                navigation.navigate('Wlletscreen'); // 👈 adjust route name
              } else {
                navigation.navigate('EditSubscribe', {
                  productDetails: selectedItem,
                  status,
                  getCategories,
                  selectedQuantity: selectedWeight,
                });
              }
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
              handleBuyOnce(selectedItem)
            }}
          >
            <Text style={styles.buyButtonText}>ADD</Text>
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
  videoLinkCard: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ffd6d6',
  },

  videoLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoLinkText: {
    flex: 1,
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },

  brandLink: {
    color: '#007BFF', // or your theme color
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: hp('30%'),
  },
  readMoreText: {
    color: '#007bff',
    marginTop: 6,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  brandCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  brandCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    marginRight: 12,
  },
  brandCardText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
    flexWrap: 'wrap',
    marginBottom: hp('2%'),
  },
  weightButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff8f0',
    borderRadius: 10,
    marginHorizontal: 16,
    elevation: 1,
  },

  brandCard: {
    backgroundColor: '#f1f3ff',
    padding: 12,
    margin: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
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
  videoThumbnail: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#eee',
  },
  videoLinkCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 12,
    elevation: 3,
  },
  videoLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  videoLinkText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },

});

export default ProductDetailScreen;