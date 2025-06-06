import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { applicationCharges as fetchApplicationCharges, placeOrder, updateOrderStatus } from '../../../services/services';
import RazorpayCheckout from "react-native-razorpay"
import { setDeliveryInstructions } from '../../../redux/reducers/cartReducer';
import { haversineDistance } from '../distanceCalculator';



const paymentMethods = ['Pay Online', 'COD'];

const BasketScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Pay Online');
  const [coupon, setCoupon] = useState(null);
  const [applicationCharges, setApplicationCharges] = useState({
    "id": 1,
    "handling_charges": 0,
    "donation_charges": "0",
    "gst_percentage": 0,
    "delivery_fixed_charges": "0",
    "mail_id": "support@freshozapcart",
    "contact_number": "9515153819",
    "i_ts": "2025-03-22T13:08:52.000Z",
    "d_in": 0
  })
  const { location: storedLocation, locationName, locationId, address, customerId, mobileNumber, shopAddress } = useSelector(state => state.Auth);
  const { chargesList, selectedAddress } = useSelector(state => state.address);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const deliveryInstructions = useSelector(state => state.cart.deliveryInstructions);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [tempInstruction, setTempInstruction] = useState(''); // NEW state
  const orderDistance = haversineDistance(storedLocation.latitude,storedLocation.longitude, shopAddress.location_latitude,shopAddress.location_longitude)

  useEffect(() => {
    const loadApplicationCharges = async () => {
      try {
        const data = await fetchApplicationCharges();
        console.log(data)
        setApplicationCharges(data[0])
        // setState(data) if you're using state to store it
      } catch (error) {
        console.error('Failed to load application charges', error);
      }
    };

    loadApplicationCharges();
  }, []);

  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setIsLoading(true);

        // Check for applied coupon from navigation
        if (route.params?.appliedCoupon) {
          setCoupon(route.params.appliedCoupon);
        }

        // Load cart items from AsyncStorage
        const storedCartItems = await AsyncStorage.getItem('cartItems');
        if (storedCartItems) {
          const parsedCartItems = JSON.parse(storedCartItems);
          setCartItems(parsedCartItems);
        }

        // Load location from AsyncStorage
        const storedLocation = await AsyncStorage.getItem('location');
        if (storedLocation) {
          setStoredLocation(JSON.parse(storedLocation));
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, [route.params]);

  // Save cart items to AsyncStorage whenever cart items change
  useEffect(() => {
    const saveCartItems = async () => {
      try {
        // Save cart items to AsyncStorage
        await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
        await AsyncStorage.setItem('persistentCartItems', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart items:', error);
      }
    };

    if (!isLoading) {
      saveCartItems();
    }
  }, [cartItems, isLoading]);

  // Force green color by setting status to 0 if undefined, or ensure green is used
  const effectiveStatus = route.params?.status !== undefined && route.params?.status === 1 ? 0 : (route.params?.status || 0);
  const backgroundColor = '#6A48D2'; // Replacing dynamic color with specific color

  // Calculate total price
  const calculateTotalPrice = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Apply coupon if available
    if (coupon) {
      if (coupon.type === 'percentage') {
        // Percentage discount
        return subtotal - (subtotal * (coupon.discount / 100));
      } else if (coupon.type === 'flat') {
        // Flat discount
        return Math.max(0, subtotal - coupon.discount);
      }
    }

    return subtotal;
  };

  console.log("coupon", coupon)

  const handleQuantityChange = (id, action) => {
    const updatedCartItems = cartItems.map((item) =>
      item.id === id
        ? {
          ...item,
          quantity: action === 'increase'
            ? item.quantity + 1
            : Math.max(1, item.quantity - 1),
          totalPrice: item.price * (action === 'increase'
            ? item.quantity + 1
            : Math.max(1, item.quantity - 1))
        }
        : item
    ).filter(item => item.quantity > 0);

    setCartItems(updatedCartItems);
  };

  const handleDelete = (id) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems);
  };

  const handleClearCart = async () => {
    setCartItems([]);
    try {
      await AsyncStorage.removeItem('cartItems');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };
  const navigateToCategories = () => {
    navigation.navigate('CategoriesScreen');
  };
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={
          item.image
            ? { uri: item.image }
            : require('../../daddy/tabassets/keema.png')
        }
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemWeight}>{item.defaultWeight || item.weight}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
          <Text style={styles.originalPrice}>₹{(item.offer || item.originalPrice).toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, 'decrease')}>
          <Text style={styles.quantityButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, 'increase')}>
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHiddenItem = ({ item }) => (
    <View style={[styles.hiddenItem, { backgroundColor }]}>
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor }]}
        onPress={() => {
          // Show confirmation dialog before deleting
          Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from your cart?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => handleDelete(item.id),
              },
            ]
          );
        }}
      >
        <Icon name="delete" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyScreen = () => (
    <View style={styles.emptyScreenContainer}>
      <Image
        source={require('../../daddy/tabassets/shoppingCart.png')}
        resizeMode="contain"
        style={styles.emptyCartImage}
      />
      <Text style={styles.emptyScreenText}>
        Looks like you haven't added anything yet. Let's fix that!
      </Text>
      <TouchableOpacity
        onPress={navigateToCategories}
        style={[styles.exploreButton, { backgroundColor }]}
      >
        <Text style={styles.exploreButtonText}>Explore Items</Text>
      </TouchableOpacity>
    </View>
  );


  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);
      const mappedItems = cartItems.map((item) => ({
        item_name: item.name,
        item_image: item.image,
        item_id: item.id,
        category_id: item.category_id?.toString() || "", // handle null
        sub_category_id: item.subcategory_id?.toString() || "",
        category_name: item.category_name || "",
        sub_category_name: item.sub_category_name || "",
        actualitem_price: item.variant.actual_price.toString(),
        item_price: item.variant.selling_price.toString(),
        sub_item_count: item.quantity.toString(),
        item_total_amount: item.totalPrice.toString(),
        item_description: item.description || "",
        saving_price: (parseFloat(item.variant.actual_price) - parseFloat(item.variant.selling_price)).toString(),
        filter_one: item.variant.filter_one || "",
        quantity_type: item.variant.quantity_type || "",
        shop_id: item.shop_id?.toString() || ""
      }));

      let payload = {
        "customer_id": customerId,
        "customer_name": "",
        "customer_mobile_number": mobileNumber,
        "category_id": "",
        "item_count": cartItems.length,
        "total_amount": (calculateTotalPrice() + Number(applicationCharges?.delivery_fixed_charges) + Number(applicationCharges?.handling_charges) + gstCalculation()).toFixed(2) || 0,
        "total_saving_amount": 0,
        "coupon_amount": "",
        "delivery_charges": applicationCharges.delivery_fixed_charges || 0,
        "grand_total": (calculateTotalPrice() + Number(applicationCharges?.delivery_fixed_charges) + Number(applicationCharges?.handling_charges) + gstCalculation()).toFixed(2) || 0,
        "location_id": locationId,
        "location_name": locationName,
        "payment_type": selectedPaymentMethod,
        "payment_id": "",
        "razorpay_order_id": "",
        "order_status": "1",
        "order_instructions": "",
        "coupon_type": coupon?.coupon_type || "",
        "coupon_id": coupon?.id || "",
        "delivery_address": address,
        "order_latitude": storedLocation.latitude,
        "order_longitude": storedLocation.longitude,
        "order_distance": orderDistance || shopAddress.distance_km ||  "",
        "ext_del_charge": "",
        "shop_id": shopAddress.id || "",
        "actual_total_amount": calculateTotalPrice() || 0,
        "order_type": "Online",
        "delivery_charges_gst": "",
        "handling_charges": applicationCharges.handling_charges || 0,
        "packing_charges": "",
        "packing_charges_gst": "",
        "donation_charges": "",
        "delivery_instruction": deliveryInstructions,
        "sub_order_array": mappedItems
      };

      if (selectedPaymentMethod === 'COD') {
        const responseCod = await dispatch(placeOrder({ orderDetails: payload }));
        navigation.navigate('TrackOrder',);
        // navigation.replace('OrderDetailsScreen', { response: responseCod.payload });
        return;
      }

      payload.order_status = 7;
      console.log("payload:", payload)
      const pacedResponse = await dispatch(placeOrder({ orderDetails: payload }));
      console.log("pacedResponse", pacedResponse)
      if (!pacedResponse.payload) return
      // const orderIdResponse = await dispatch(generateOrderId({ orderAmount: 100 }));
      console.log(pacedResponse.payload.razorpay_order_id)

      const options = {
        description: 'Order Payment',
        image: '',
        currency: 'INR',
        key: 'rzp_live_tZgZCC254NtRmU',
        order_id: pacedResponse.payload.razorpay_order_id,
        amount: 1000,
        name: 'Abhi 24',
        prefill: {
          // email: "test@gmail.com",
          contact: selectedAddress?.customer_mobile_number,
          name: selectedAddress?.customer_name,
        },
        theme: { color: '#065E2C' },
      };

      RazorpayCheckout.open(options)
        .then(async data => {
          console.log("response from razorpay", data)
          payload.payment_id = data.razorpay_payment_id;
          payload.razorpay_order_id = data.razorpay_payment_id;
          payload.order_status = 0;
          const updateOrderStatusResponse = await dispatch(updateOrderStatus({ paymentId: data.razorpay_payment_id, rzpId: data.razorpay_order_id, orderId: pacedResponse.payload.id, orderStatus: 1 }))
          console.log("responselkmksdfkljas", updateOrderStatusResponse)
          navigation.navigate('TrackOrder');
          // navigation.replace('OrderDetailsScreen', { response: pacedResponse.payload });
        })
        .catch(error => {
          console.log('Payment error:', error);
        });
    } catch (error) {
      console.log('Payment error:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={backgroundColor}
          style={styles.loader}
        />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  const gstCalculation = () => {
    const gstAmmount = calculateTotalPrice() * (Number(applicationCharges?.gst_percentage) / 100)
    return gstAmmount
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>

      {/* Location Section */}
      <View style={styles.locationSection}>
        <Icon name="home" size={16} color={backgroundColor} style={styles.homeIcon} />
        <Text style={styles.locationName}>{locationName ? locationName : ""}</Text>
        <TouchableOpacity onPress={() => setShowFullAddress(!showFullAddress)}>
          <Icon name={showFullAddress ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={20} color={backgroundColor} />
        </TouchableOpacity>
      </View>
      {showFullAddress && (
        <Text style={styles.fullAddress}>{address || "Address Not Selected"}</Text>
      )}
      <TouchableOpacity
        onPress={() => {
          try {
            // Retrieve current location from AsyncStorage or Redux if possible
            const currentLocation = {
              latitude: storedLocation?.latitude,
              longitude: storedLocation?.longitude,
            };

            navigation.navigate('SelectServiceFromLocation', {
              previousScreen: 'ByOncescreen',
              ...(currentLocation.latitude && currentLocation.longitude
                ? { selectedAddress: currentLocation }
                : {})
            });
          } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert(
              'Navigation Error',
              'Unable to change address. Please try again later.',
              [{ text: 'OK' }]
            );
          }
        }}
      >
        <Text style={[styles.deliveryTagline, { color: backgroundColor }]}>
          Change Address
        </Text>
      </TouchableOpacity>

      {/* Conditional Rendering */}
      {cartItems.length === 0 ? (
        renderEmptyScreen()
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Total Items Section */}
          <View style={styles.totalItems}>
            <Text style={styles.totalItemsText}>TOTAL ITEMS ({cartItems.length})</Text>
            <TouchableOpacity
              style={[styles.clearCartContainer, { backgroundColor }]}
              onPress={handleClearCart}
            >
              <Text style={styles.clearCart}>Clear Cart</Text>
              <Icon name="delete" size={16} color="#fff" style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>

          {/* Swipeable Item List */}
          <SwipeListView
            data={cartItems}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-75}
            disableRightSwipe
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          {/* Apply Coupons Section */}
          <TouchableOpacity
            style={styles.couponSection}
            onPress={() => navigation.navigate("ApplyCuponScreen", {
              cartItems,
              totalAmount: (calculateTotalPrice() + Number(applicationCharges?.delivery_fixed_charges) + Number(applicationCharges?.handling_charges) + gstCalculation()).toFixed(2),
              status: route.params?.status,
              
            })}
          >
            <View style={[styles.couponIcon, { backgroundColor: '#E8F5E9' }]}>
              <Icon
                name="local-offer"
                size={24}
                color={backgroundColor}
              />
            </View>
            {coupon ? (
              <View style={styles.couponAppliedContainer}>
                <Text style={styles.couponText}>
                  Saved ₹{coupon.type === 'percentage'
                    ? (calculateTotalPrice() * (coupon.discount / 100)).toFixed(2)
                    : coupon.discount.toFixed(2)}
                </Text>
                <Text style={[
                  styles.couponCodeText,
                  { color: backgroundColor }
                ]}>
                  {coupon.code} Applied
                </Text>
              </View>
            ) : (
              <Text style={styles.couponText}>Apply coupons</Text>
            )}
            <Icon name="chevron-right" size={24} color="#000" />
          </TouchableOpacity>

          {/* Add Delivery Instructions */}
          <TouchableOpacity
            style={styles.deliveryInstructions}
            onPress={() => {
              setTempInstruction(deliveryInstructions); // <-- preload from redux
              setShowInstructionModal(true);
            }}
          >
            <Text style={styles.deliveryText}>
              {deliveryInstructions ? `Note: ${deliveryInstructions}` : '+ Add Delivery Instructions'}
            </Text>
          </TouchableOpacity>

          {showInstructionModal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add Delivery Instructions</Text>
                <TextInput
                  style={styles.instructionInput}
                  placeholder="Enter any delivery notes..."
                  multiline
                  value={tempInstruction}
                  onChangeText={setTempInstruction}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => setShowInstructionModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                   onPress={() => {
                    dispatch(setDeliveryInstructions(tempInstruction));
                    setShowInstructionModal(false);
                  }}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
              <TouchableOpacity>
                <Text style={[styles.viewMore, { color: backgroundColor }]}>View more</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>₹{calculateTotalPrice().toFixed(2)}</Text>
            </View>
            {coupon && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: backgroundColor }]}>Coupon Applied</Text>
                <Text style={[styles.summaryValue, { color: backgroundColor }]}>
                  -₹{coupon.type === 'percentage'
                    ? (calculateTotalPrice() * (coupon.discount / 100)).toFixed(2)
                    : coupon.discount}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charge</Text>
              <Text style={[styles.summaryValue, { color: backgroundColor }]}>₹{applicationCharges?.delivery_fixed_charges}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Tip</Text>
              <TouchableOpacity>
                <Text style={[styles.addTip, { color: backgroundColor }]}>Add tip</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform fee</Text>
              <Text style={styles.summaryValue}>₹{applicationCharges?.handling_charges}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST & Restaurant Charges</Text>
              <Text style={styles.summaryValue}>₹{gstCalculation().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>To Pay</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                ₹{(calculateTotalPrice() + Number(applicationCharges?.delivery_fixed_charges) + Number(applicationCharges?.handling_charges) + gstCalculation()).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* <View style={styles.Paymentcontainer}>
            <TouchableOpacity
              style={styles.selectedMethodBox}
              onPress={() => setPaymentMenuVisible(prev => !prev)}
            >
              <Text style={styles.selectedText}>{selectedPaymentMethod}</Text>
            </TouchableOpacity>

            {paymentMenuVisible && (
              <View style={styles.dropdown}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethodItem,
                      selectedPaymentMethod === method && styles.selectedItem,
                    ]}
                    onPress={() => {
                      setSelectedPaymentMethod(method);
                      setPaymentMenuVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method && styles.selectedTextBold,
                      ]}
                    >
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View> */}

          {/* Place Order Button */}
          < View style={{ paddingBottom: 60 }}>
            <TouchableOpacity
              style={[styles.placeOrderButton, { backgroundColor }]}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.placeOrderText}>Place Order</Text>
            </TouchableOpacity></View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#D32F2F', // Will be overridden by backgroundColor
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomEndRadius: 25,
    borderBottomStartRadius: 25,
    paddingVertical: "9%"
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  homeIcon: {
    marginRight: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  fullAddress: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    paddingBottom: 5,
    backgroundColor: '#fff',
  },
  deliveryTagline: {
    fontSize: 12,
    color: '#D32F2F', // Will be overridden by backgroundColor
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  totalItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
  },
  totalItemsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearCartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F', // Will be overridden by backgroundColor
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  clearCart: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  deleteIcon: {
    marginLeft: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 2,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemWeight: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "line-through",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 5,
  },
  quantityButton: {
    fontSize: 18,
    paddingHorizontal: 10,
    color: "#000",
  },
  quantityText: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
  hiddenItem: {
    backgroundColor: "#D32F2F", // Will be overridden by backgroundColor
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
    padding: 15,
  },
  deleteButton: {
    backgroundColor: "#D32F2F", // Will be overridden by backgroundColor
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    height: "100%",
    flexDirection: 'column',
    paddingVertical: 10,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
  couponSection: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  couponIcon: {
    backgroundColor: "#FFEBEE", // Will be updated to a light green shade
    borderRadius: 20,
    padding: 5,
  },
  couponText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  deliveryInstructions: {
    backgroundColor: "#fff",
    padding: 15,
    marginTop: 2,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  deliveryText: {
    fontSize: 16,
    color: "#666",
  },
  orderSummary: {
    backgroundColor: "#fff",
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  viewMore: {
    color: "#D32F2F", // Will be overridden by backgroundColor
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  addTip: {
    color: "#D32F2F", // Will be overridden by backgroundColor
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  placeOrderButton: {
    backgroundColor: "#D32F2F", // Will be overridden by backgroundColor
    padding: 15,
    margin: 10,
    borderRadius: 8,
    alignItems: "center",
    // paddingBottom:100
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  emptyCartImage: {
    width: responsiveWidth(70),
    height: responsiveHeight(40),
  },
  emptyScreenText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "700",
    width: responsiveWidth(75),
    textAlign: "center",
    lineHeight: 25,
    marginVertical: responsiveHeight(3),
  },
  exploreButton: {
    backgroundColor: '#D32F2F',
    width: responsiveWidth(80),
    paddingVertical: responsiveHeight(2),
    borderRadius: 8,
    marginTop: responsiveHeight(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#000',
  },
  couponCodeText: {
    fontSize: 12,
    marginTop: 2,
  },
  couponAppliedContainer: {
    flex: 1,
    marginLeft: 10,
  },
  cartContainer: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },



  Paymentcontainer: {
    padding: 16,
    position: 'relative',
    zIndex: 10,
  },

  selectedMethodBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#00796b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectedText: {
    fontSize: 16,
    color: '#00796b',
    fontWeight: '600',
  },

  dropdown: {
    marginTop: 6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },

  paymentMethodItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedItem: {
    backgroundColor: '#e0f2f1',
  },

  paymentMethodText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },

  selectedTextBold: {
    fontWeight: '700',
    color: '#004d40',
  },



  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 15,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },

});

export default BasketScreen;