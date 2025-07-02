import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderItemsByOrderId } from '../../../services/services';
import CustomAlert from '../../../components/CustomAlert';
import CustomModal from '../../../components/CustomModal';
import FocusAwareStatusBar from '../../../components/CustomStatusBar';
import Clipboard from '@react-native-clipboard/clipboard';


const OrderDetailsScreen = ({ navigation, route }) => {
  // Get order details from route params
  const dispatch = useDispatch();
  const { orderDetails, status } = route.params || {};


  const backgroundColor = '#8655d2';
  const [storedOrders, setStoredOrders] = useState([]);
  const [viewSavedOrders, setViewSavedOrders] = useState(false);
  const { location: storedLocation, locationName, locationId, address, customerId, mobileNumber, shopAddress } = useSelector(state => state.Auth);
  const [loadingItems, setLoadingItems] = useState(true);
  const [isCancelAlertVisible, setCancelAlertVisible] = useState(false);


  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!orderDetails?.orderId) return;

      setLoadingItems(true);
      try {
        const items = await getOrderItemsByOrderId(orderDetails.orderId);
        setStoredOrders(items);
        orderDetails.items = items;

      } catch (error) {
        console.error('Failed to fetch order items:', error);
      } finally {
        setLoadingItems(false); // Done loading
        await AsyncStorage.removeItem('cartItems');
      }
    };

    fetchOrderItems();
  }, [orderDetails?.orderId]);


  // Load stored orders
  const loadStoredOrders = async () => {
    try {
      const ordersJson = await AsyncStorage.getItem('trackOrders');
      const orders = ordersJson ? JSON.parse(ordersJson) : [];
      setStoredOrders(orders);
    } catch (error) {
      console.error('Error loading stored orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Load Failed',
        text2: 'Unable to load saved orders',
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  // Validate order details before saving
  const validateOrderDetails = (details) => {
    const requiredFields = ['orderId', 'items', 'totalPrice'];
    for (let field of requiredFields) {
      if (!details[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
  };

  // Save order to local storage
  // const saveOrderToStorage = async () => {
  //   try {
  //     // Validate order details
  //     if (!orderDetails || !validateOrderDetails(orderDetails)) {
  //       throw new Error('Invalid order details');
  //     }

  //     // Check if order already exists
  //     const existingOrderIndex = storedOrders.findIndex(
  //       order => order.orderId === orderDetails?.orderId
  //     );

  //     let updatedOrders;
  //     if (existingOrderIndex > -1) {
  //       // Update existing order
  //       updatedOrders = [...storedOrders];
  //       updatedOrders[existingOrderIndex] = orderDetails;
  //     } else {
  //       // Add new order
  //       updatedOrders = [...storedOrders, orderDetails];
  //     }

  //     // Save to AsyncStorage
  //     await AsyncStorage.setItem('trackOrders', JSON.stringify(updatedOrders));

  //     // Update local state
  //     setStoredOrders(updatedOrders);

  //     // Show success toast
  //     Toast.show({
  //       type: 'success',
  //       text1: 'Order Saved',
  //       text2: 'Order details have been saved successfully',
  //       visibilityTime: 3000,
  //       autoHide: true,
  //     });
  //   } catch (error) {
  //     console.error('Error saving order:', error);

  //     // Show error toast
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Save Failed',
  //       text2: error.message || 'Unable to save order details',
  //       visibilityTime: 3000,
  //       autoHide: true,
  //     });
  //   }
  // };

  // Remove order from local storage
  const removeOrderFromStorage = async (orderIdToRemove) => {
    try {
      const updatedOrders = storedOrders.filter(
        order => order.orderId !== (orderIdToRemove || orderDetails?.orderId)
      );

      // Save updated orders
      await AsyncStorage.setItem('trackOrders', JSON.stringify(updatedOrders));

      // Update local state
      setStoredOrders(updatedOrders);

      // Show success toast
      Toast.show({
        type: 'info',
        text1: 'Order Removed',
        text2: 'Order details have been removed',
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error removing order:', error);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Remove Failed',
        text2: 'Unable to remove order details',
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  // Render saved orders list
  const renderSavedOrdersList = () => {
    const renderOrderItem = ({ item }) => (
      <TouchableOpacity
        style={styles.savedOrderItem}
        onPress={() => {
          navigation.navigate('TrackOrder', {
            orderDetails: item,
            status: item.status || status
          });
          setViewSavedOrders(false);
        }}
      >
        <View style={styles.savedOrderHeader}>
          <Text style={styles.savedOrderId}>Order ID: {item.orderId}</Text>
          <TouchableOpacity onPress={() => removeOrderFromStorage(item.orderId)}>
            <Ionicons name="trash" size={20} color="red" />
          </TouchableOpacity>
        </View>
        <Text style={styles.savedOrderDate}>
          Total: ₹{item.totalPrice?.toFixed(2) || 'N/A'}
        </Text>
        <Text style={styles.savedOrderItems}>
          {item.items?.length || 0} Items
        </Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.savedOrdersContainer}>
        <View style={styles.savedOrdersHeader}>
          <Text style={styles.savedOrdersTitle}>Saved Orders</Text>
          <TouchableOpacity onPress={() => setViewSavedOrders(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        {storedOrders.length === 0 ? (
          <Text style={styles.noOrdersText}>No saved orders</Text>
        ) : (
          <FlatList
            data={storedOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.orderId}
            contentContainerStyle={styles.savedOrdersList}
          />
        )}
      </View>
    );
  };

  // Render product items
  const renderProductItems = () => {
    if (loadingItems) {
      return renderSkeletonItems(); // Show loading skeleton
    }

    if (!orderDetails?.items?.length) {
      return (
        <Text style={{ textAlign: 'center', marginVertical: 20 }}>
          No items found in this order.
        </Text>
      );
    }

    return orderDetails?.items.map((item, index) => (
      <View key={index} style={styles.productCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item?.item_name}</Text>
          <Text style={styles.productWeight}>{item?.quantity_type || ''}</Text>
          <Text style={styles.productDetails} numberOfLines={2}>
            {item?.item_description || 'Abhi24'}
          </Text>
          <Text style={styles.seller}>Seller: Local Seller</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{(parseFloat(item.item_price) * parseInt(item.sub_item_count)).toFixed(2)}</Text>
            <Text style={styles.originalPrice}>
              ₹{(parseFloat(item.actualitem_price) * parseInt(item.sub_item_count)).toFixed(2)}
            </Text>
          </View>
        </View>

        <Image
          source={
            item.item_image
              ? { uri: item.item_image }
              : require('../../daddy/tabassets/keema.png')
          }
          style={styles.productImage}
        />
      </View>
    ));
  };

  const renderSkeletonItems = () => {
    const skeletonArray = Array.from({ length: 3 });

    return skeletonArray.map((_, index) => (
      <View key={index} style={[styles.productCard, { opacity: 0.5 }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.skeletonBox} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
        </View>
        <View style={styles.skeletonImage} />
      </View>
    ));
  };

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case 0:
        return 'Placed';
      case 1:
        return 'Packed';
      case 2:
        return 'Shipped';
      case 3:
        return 'Accepted';
      case 4:
        return 'Delivered';
      case 5:
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };



  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.navigate('BottomNavigation')}
        />
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: responsiveHeight(2), }}>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(orderDetails.order_id || '');
            }}
            style={{ flex: 1 }}
          >
            <Text style={[styles.orderId]} numberOfLines={1}>
              Order ID - {orderDetails.order_id || 'N/A'}
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.shippingValue,
              {
                color:
                  status === 0
                    ? 'green'
                    : status === 3
                      ? '#FFA500'
                      : '#FF3B30',
              },
            ]}
            numberOfLines={1}
          >
            {getOrderStatusLabel(status)}
          </Text>
        </View>


        {/* Dynamically render product items */}
        {renderProductItems()}

        {/* Order Status */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>

          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={18} color="#8655d2" />
            <Text style={styles.statusText}>Order Confirmed, Oct 06</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={18} color="#8655d2" />
            <Text style={styles.statusText}>Shipped</Text>
          </View>
          <Text style={styles.subStatus}>Your item has arrived at Facility, Mon 14th Oct</Text>

          <View style={styles.statusItem}>
            <Ionicons name="ellipse-outline" size={18} color="#8655d2" />
            <Text style={styles.statusText}>Out For Delivery</Text>
          </View>

          <View style={styles.statusItem}>
            <Ionicons name="ellipse-outline" size={18} color="#8655d2" />
            <Text style={styles.statusText}>
              Delivery, Sat Oct 19 (08:00 AM – 07:55 PM)
            </Text>
          </View>
        </View> */}


        <View style={styles.section}>
          <Text style={styles.shippingTitle}>Shipping Details</Text>

          {/* ✅ Add Order Status here */}
          <View style={styles.shippingRow}>
            <Text style={styles.shippingLabel}>Order Status:</Text>
            <Text
              style={[
                styles.shippingValue,
                {
                  color:
                    status === 0
                      ? 'green'
                      : status === 3
                        ? '#FFA500'
                        : '#FF3B30',
                },
              ]}
            >
              {getOrderStatusLabel(status)}

            </Text>

          </View>

          {/* <View style={styles.shippingRow}>
            <Text style={styles.shippingLabel}>Customer ID:</Text>
            <Text style={styles.shippingValue}>{customerId}</Text>
          </View> */}

          <View style={styles.shippingRow}>
            <Text style={styles.shippingLabel}>Mobile:</Text>
            <Text style={styles.shippingValue}>+91 {mobileNumber}</Text>
          </View>

          {shopAddress?.location_name && (
            <View style={styles.shippingRow}>
              <Text style={styles.shippingLabel}>Location:</Text>
              <Text style={styles.shippingValue}>{shopAddress.location_name}</Text>
            </View>
          )}

          <View style={styles.shippingRow}>
            <Text style={styles.shippingLabel}>Address:</Text>
            <Text style={styles.shippingValue}>{address}</Text>
          </View>
        </View>



        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Details</Text>

          {/* Show Total MRP from items if present, else use total_amount */}
          <View style={styles.priceRowBetween}>
            <Text style={styles.priceLabel}>Total MRP</Text>
            <Text style={styles.priceValue}>
              ₹{orderDetails?.items?.length
                ? orderDetails.items.reduce((acc, item) => acc + parseFloat(item.item_price || 0) * parseInt(item.sub_item_count || 1), 0).toFixed(2)
                : orderDetails?.totalAmount || 'N/A'}
            </Text>
          </View>

          {parseFloat(orderDetails?.couponAmount) > 0 && (
            <View style={styles.priceRowBetween}>
              <Text style={styles.priceLabel}>Coupon Discount</Text>
              <Text style={[styles.priceValue, { color: 'green' }]}>
                ₹{parseFloat(orderDetails.couponAmount).toFixed(2)}
              </Text>
            </View>
          )}


          {/* Platform Fee (if applicable) */}
          {orderDetails?.handling_charges && (
            <View style={styles.priceRowBetween}>
              <Text style={styles.priceLabel}>Platform Fee</Text>
              <Text style={styles.priceValue}>₹{orderDetails.handling_charges}</Text>
            </View>
          )}

          {/* Delivery Charges */}
          <View style={styles.priceRowBetween}>
            <Text style={styles.priceLabel}>Delivery Charges</Text>
            <Text style={styles.priceValue}>₹{orderDetails.deliveryCharges || 0}</Text>
          </View>

          {/* GST or Restaurant Charges */}
          {orderDetails.delivery_charges_gst && (
            <View style={styles.priceRowBetween}>
              <Text style={styles.priceLabel}>GST & Restaurant Charges</Text>
              <Text style={styles.priceValue}>₹{orderDetails.delivery_charges_gst}</Text>
            </View>
          )}

          {/* Shipping Fee (optional static) */}
          {/* <View style={styles.priceRowBetween}>
            <Text style={styles.priceLabel}>Shipping Fee</Text>
            <Text style={[styles.priceValue, { color: 'green' }]}>FREE</Text>
          </View> */}

          {/* Total */}
          <View style={[styles.priceRowBetween, { marginTop: responsiveHeight(1) }]}>
            <Text style={[styles.priceLabel, { fontWeight: 'bold' }]}>Total Amount</Text>
            <Text style={[styles.priceValue, { fontWeight: 'bold' }]}>
              ₹{orderDetails?.grandTotal || orderDetails?.totalPrice || 'N/A'}
            </Text>
          </View>
        </View>


        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerBtnOutline}
            onPress={() => navigation.navigate('ViewTrack', { orderDetails, status })}
          >
            <Text style={styles.footerBtnTextOutline}>View Track</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.footerBtnFilled}
            onPress={() => setCancelAlertVisible(true)}
          >
            <Text style={styles.footerBtnTextFilled}>Cancel Order</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>

      <CustomModal
        visible={isCancelAlertVisible}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        confirmText="Yes, Cancel"
        cancelText="No"
        showCancel={true}
        onConfirm={() => {
          setCancelAlertVisible(false);
          // TODO: Add your cancel order logic here

        }}
        onCancel={() => setCancelAlertVisible(false)}
      />

      {/* Saved Orders Modal/Overlay */}
      {viewSavedOrders && renderSavedOrdersList()}

      <Toast />
    </View>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: responsiveHeight(8),
    backgroundColor: '#8655d2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    // marginTop:20
  },
  headerTitle: {
    color: '#fff',
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    marginLeft: responsiveWidth(3),
  },
  scrollContainer: {
    padding: responsiveWidth(4),
    paddingBottom: responsiveHeight(5),
  },
  orderId: {
    color: '#8655d2',
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: responsiveWidth(3),
    borderRadius: 8,
    elevation: 2,
    marginBottom: responsiveHeight(3),
  },
  productName: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2.2),
  },
  productWeight: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(0.5),
  },
  productDetails: {
    fontSize: responsiveFontSize(1.7),
    color: '#666',
  },
  seller: {
    fontSize: responsiveFontSize(1.6),
    color: '#999',
    marginBottom: responsiveHeight(1),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    color: '#8655d2',
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    marginRight: responsiveWidth(2),
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  productImage: {
    width: responsiveWidth(20),
    height: responsiveWidth(20),
    borderRadius: 10,
    marginLeft: responsiveWidth(2),
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: responsiveHeight(2),
    marginTop: responsiveHeight(2),
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  statusText: {
    marginLeft: responsiveWidth(2),
    fontSize: responsiveFontSize(1.9),
  },
  subStatus: {
    fontSize: responsiveFontSize(1.6),
    color: '#888',
    marginLeft: responsiveWidth(6),
    marginBottom: responsiveHeight(1),
  },
  shippingTitle: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2),
    marginBottom: responsiveHeight(1),
    color: '#8655d2',
  },
  shippingText: {
    fontSize: responsiveFontSize(1.8),
    color: '#444',
    marginBottom: responsiveHeight(0.5),
  },
  priceRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsiveHeight(3),
  },
  footerBtnOutline: {
    flex: 1,
    marginRight: 10,
    padding: responsiveHeight(1.2),
    borderColor: '#8655d2',
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  footerBtnTextOutline: {
    color: '#8655d2',
    fontWeight: 'bold',
  },
  footerBtnFilled: {
    flex: 1,
    padding: responsiveHeight(1.2),
    backgroundColor: '#8655d2',
    borderRadius: 6,
    alignItems: 'center',
  },
  footerBtnTextFilled: {
    color: 'white',
    fontWeight: 'bold',
  },
  //
  tracker: {
    marginTop: responsiveHeight(1),
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(2),
  },

  iconColumn: {
    width: responsiveWidth(8),
    alignItems: 'center',
    position: 'relative',
  },

  verticalLine: {
    width: 2,
    height: responsiveHeight(5),
    backgroundColor: '#6A48D2',
    position: 'absolute',
    top: 22, // below icon
  },
  headerActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 15,
    paddingRight: responsiveWidth(4),
  },
  savedOrdersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  savedOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  savedOrdersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  savedOrdersList: {
    padding: 15,
  },
  savedOrderItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  savedOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  savedOrderId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  savedOrderDate: {
    color: '#666',
    marginBottom: 5,
  },
  savedOrderItems: {
    color: '#333',
  },
  noOrdersText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },


  shippingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },

  shippingRow: {
    flexDirection: 'row',
    marginBottom: 6,
    // flexWrap: 'wrap',
  },

  shippingLabel: {
    fontWeight: '600',
    color: '#555',
    width: 100,
    minWidth: 50,
  },

  shippingValue: {
    color: '#333',
    flexShrink: 1,
  },
  priceRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  priceLabel: {
    fontSize: 14,
    color: '#444',
  },

  priceValue: {
    fontSize: 14,
    color: '#000',
  },
  skeletonBox: {
    width: '60%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLine: {
    width: '80%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonImage: {
    width: 70,
    height: 70,
    backgroundColor: '#ccc',
    borderRadius: 8,
    marginLeft: 10,
  }

});
