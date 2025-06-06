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

const OrderDetailsScreen = ({ navigation, route }) => {
  // Get order details from route params
  const { orderDetails, status } = route.params || {};
  const backgroundColor = status === 1 ? '#D32F2F' : '#6A48D2';
  const [storedOrders, setStoredOrders] = useState([]);
  const [viewSavedOrders, setViewSavedOrders] = useState(false);

  // Load stored orders when component mounts
  useEffect(() => {
    loadStoredOrders();

    // Save order details to storage if provided
    if (orderDetails) {
      saveOrderToStorage();
    }
  }, [orderDetails]);

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
  const saveOrderToStorage = async () => {
    try {
      // Validate order details
      if (!orderDetails || !validateOrderDetails(orderDetails)) {
        throw new Error('Invalid order details');
      }

      // Check if order already exists
      const existingOrderIndex = storedOrders.findIndex(
        order => order.orderId === orderDetails?.orderId
      );

      let updatedOrders;
      if (existingOrderIndex > -1) {
        // Update existing order
        updatedOrders = [...storedOrders];
        updatedOrders[existingOrderIndex] = orderDetails;
      } else {
        // Add new order
        updatedOrders = [...storedOrders, orderDetails];
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem('trackOrders', JSON.stringify(updatedOrders));

      // Update local state
      setStoredOrders(updatedOrders);

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Order Saved',
        text2: 'Order details have been saved successfully',
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error saving order:', error);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: error.message || 'Unable to save order details',
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

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
    return orderDetails?.items?.map((item, index) => (
      <View key={index} style={styles.productCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productWeight}>{item.defaultWeight || item.weight}</Text>
          <Text style={styles.productDetails}>Abhi24</Text>
          <Text style={styles.seller}>Seller: {item.seller || 'Local Seller'}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            <Text style={styles.originalPrice}>₹{(item.offer || item.originalPrice).toFixed(2)}</Text>
          </View>
        </View>
        <Image
          source={item.image || require('../../daddy/tabassets/keema.png')}
          style={styles.productImage}
        />
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.navigate('BottomNavigation')}
        />
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={saveOrderToStorage}>
            <Ionicons name="save" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewSavedOrders(true)}>
            <Ionicons name="list" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.orderId}>Order ID - {orderDetails?.orderId || 'N/A'}</Text>

        {/* Dynamically render product items */}
        {renderProductItems()}

        {/* Order Status */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>

          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={18} color="#6A48D2" />
            <Text style={styles.statusText}>Order Confirmed, Oct 06</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={18} color="#6A48D2" />
            <Text style={styles.statusText}>Shipped</Text>
          </View>
          <Text style={styles.subStatus}>Your item has arrived at Facility, Mon 14th Oct</Text>

          <View style={styles.statusItem}>
            <Ionicons name="ellipse-outline" size={18} color="#6A48D2" />
            <Text style={styles.statusText}>Out For Delivery</Text>
          </View>

          <View style={styles.statusItem}>
            <Ionicons name="ellipse-outline" size={18} color="#6A48D2" />
            <Text style={styles.statusText}>
              Delivery, Sat Oct 19 (08:00 AM – 07:55 PM)
            </Text>
          </View>
        </View> */}



        {/* Shipping Details */}
        <View style={styles.section}>
          <Text style={styles.shippingTitle}>Shipping Details</Text>
          <Text style={styles.shippingText}>James</Text>
          <Text style={styles.shippingText}>+91987654321</Text>
          <Text style={styles.shippingText}>gmail@example.com</Text>
          <Text style={styles.shippingText}>
            Magadi Main Rd, next to Prasanna Theatre, Cholarupalya,{"\n"}
            Bengaluru, Karnataka 560023
          </Text>
        </View>

        {/* Pricing Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Details</Text>
          <View style={styles.priceRowBetween}>
            <Text>Total MRP</Text>
            <Text>₹{orderDetails?.totalPrice?.toFixed(2) || 'N/A'}</Text>
          </View>
          {orderDetails?.coupon && (
            <View style={styles.priceRowBetween}>
              <Text>Coupon Discount</Text>
              <Text style={{ color: 'green' }}>
                {orderDetails.coupon.type === 'percentage'
                  ? `${orderDetails.coupon.discount}%`
                  : `₹${orderDetails.coupon.discount}`}
              </Text>
            </View>
          )}
          <View style={styles.priceRowBetween}>
            <Text>Platform Fee</Text>
            <Text>10</Text>
          </View>
          <View style={styles.priceRowBetween}>
            <Text>Shipping Fee</Text>
            <Text style={{ color: 'green' }}>FREE</Text>
          </View>
          <View style={[styles.priceRowBetween, { marginTop: responsiveHeight(1) }]}>
            <Text style={{ fontWeight: 'bold' }}>Total Amount</Text>
            <Text style={{ fontWeight: 'bold' }}>1839</Text>
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
          <TouchableOpacity style={styles.footerBtnFilled}>
            <Text style={styles.footerBtnTextFilled}>Chat with Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    backgroundColor: '#6A48D2',
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
    color: '#6A48D2',
    marginBottom: responsiveHeight(2),
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
    color: '#6A48D2',
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
    color: '#6A48D2',
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
    borderColor: '#6A48D2',
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  footerBtnTextOutline: {
    color: '#6A48D2',
    fontWeight: 'bold',
  },
  footerBtnFilled: {
    flex: 1,
    padding: responsiveHeight(1.2),
    backgroundColor: '#6A48D2',
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
});
