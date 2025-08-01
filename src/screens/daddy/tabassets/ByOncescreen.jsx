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
  TextInput,
  Modal,
  Switch,
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
import {
  checkAddressExistence,
  applicationCharges as fetchApplicationCharges,
  placeOrder,
  updateOrderStatus,
  WalletAPI,
} from '../../../services/services';
import RazorpayCheckout from 'react-native-razorpay';
import {
  addToCart,
  clearCart,
  setDeliveryInstructions,
  removeFromCart
} from '../../../redux/reducers/cartReducer';
import { haversineDistance } from '../distanceCalculator';
import {
  setLocation,
  setLocationId,
  setLocationName,
  setShopAddress,
} from '../../../redux/reducers/auth';
import { setWalletData } from '../../../redux/reducers/walletSlice';
// import {addToCart} from "../../../redux/reducers/cartReducer"

const paymentMethods = ['Pay Online', 'COD'];
const backgroundColor = '#8655d2'; // Replacing dynamic color with specific color

const BasketScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Pay Online');
  const [coupon, setCoupon] = useState(null);
  const [applicationCharges, setApplicationCharges] = useState({
    id: 1,
    handling_charges: 0,
    donation_charges: '0',
    gst_percentage: 0,
    delivery_fixed_charges: '0',
    mail_id: 'support@freshozapcart',
    contact_number: '9515153819',
    i_ts: '2025-03-22T13:08:52.000Z',
    d_in: 0,
  });
  const {
    location: storedLocation,
    locationName,
    locationId,
    address,
    customerId,
    mobileNumber,
    shopAddress,
  } = useSelector(state => state.Auth);
  const { chargesList, selectedAddress } = useSelector(state => state.address);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const deliveryInstructions = useSelector(state => state.cart.deliveryInstructions);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [tempInstruction, setTempInstruction] = useState(''); // NEW state
  const orderDistance =
    storedLocation?.latitude &&
      storedLocation?.longitude &&
      shopAddress?.location_latitude &&
      shopAddress?.location_longitude
      ? haversineDistance(
        storedLocation.latitude,
        storedLocation.longitude,
        shopAddress.location_latitude,
        shopAddress.location_longitude,
      )
      : null;
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const walletData = useSelector(state => state.wallet);


  const gstCalculation = () => {
    const subtotal = cartItems.reduce(
      (total, item) =>
        total +
        Number(item.variant?.selling_price || item.offer || 0) * item.quantity,
      0,
    );
    const gstAmmount = subtotal * (Number(applicationCharges?.gst_percentage) / 100);
    console.log("gstcalculated amount", gstAmmount)
    return gstAmmount;
  };

  const calculateTotalPrice = () => {
    const subtotal = cartItems.reduce(
      (total, item) =>
        total +
        Number(item.variant?.selling_price || item.offer || 0) * item.quantity,
      0,
    );
    console.log("subtotalamount:::::::", subtotal)
    return subtotal;
  };


  const getSplitCartTotals = () => {
    let muttonSubtotal = 0;
    let otherSubtotal = 0;
    cartItems.forEach(item => {
      const price = Number(item.variant?.selling_price || item.offer || 0);
      const itemTotal = price * item.quantity;
      if (item.sub_category_id === 2) {
        muttonSubtotal += itemTotal;
      } else {
        otherSubtotal += itemTotal;
      }
    });
    console.log('muttonSubtotal', muttonSubtotal);
    console.log('otherSubtotal', otherSubtotal);
    return { muttonSubtotal, otherSubtotal };
  };

  const [useAbhiWallet, setUseAbhiWallet] = useState(false);
  const [useUserWallet, setUseUserWallet] = useState(false);

  const { muttonSubtotal, otherSubtotal } = getSplitCartTotals();
  const abhiWalletAmount = Number(walletData?.abhi24_balanced_amount ?? 0);
  const userWalletAmount = Number(walletData?.user_balance_amount ?? 0);
  const deliveryCharge = Number(applicationCharges?.delivery_fixed_charges || 0);
  const handlingCharge = Number(applicationCharges?.handling_charges || 0);
  let subtotal = muttonSubtotal + otherSubtotal;
  // Apply coupon
  if (coupon) {
    console.log("aws", coupon)
    if (coupon.type === 'percentage') {
      subtotal -= subtotal * (coupon.coupon_percentage / 100);
    } else {
      subtotal -= coupon.discount;
    }
  }
  const gst = gstCalculation(subtotal);
  const totalBeforeWallets = subtotal + deliveryCharge + handlingCharge + gst;
  console.log("totalBeforeWallets", totalBeforeWallets)
  const abhiWalletUsed = useAbhiWallet ? Math.min(muttonSubtotal, abhiWalletAmount) : 0;
  const userWalletUsed = useUserWallet ? Math.min(totalBeforeWallets - abhiWalletUsed, userWalletAmount) : 0;
  const totalAfterWallets = totalBeforeWallets - abhiWalletUsed - userWalletUsed;



  useEffect(() => {
    if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
      console.log("vachindhi")
      checkAddressExistenceInList();
    } else {
      setShowServiceModal(true);
      console.warn('Location not available. Permission may be denied.');
      // Optionally show alert/modal or redirect user
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    const data = await WalletAPI.getWalletAmounts(customerId);
    dispatch(setWalletData(data));
  };

  const checkAddressExistenceInList = async () => {
    if (
      !storedLocation ||
      !storedLocation.latitude ||
      !storedLocation.longitude
    ) {
      console.warn('Cannot check address: Location data is missing.');
      return;
    }
    try {
      setIsCheckingAddress(true);
      const response = await dispatch(
        checkAddressExistence({
          latitude: parseFloat(storedLocation.latitude),
          longitude: parseFloat(storedLocation.longitude),
        }),
      );
      console.log("helooooooooo", storedLocation)
      console.log("heloooooooooooooooooo", response)
      if (response.payload.data.length > 0) {
        dispatch(
          setLocation({
            latitude: parseFloat(storedLocation.latitude),
            longitude: parseFloat(storedLocation.longitude),
            latitudeDelta: storedLocation.latitudeDelta,
            longitudeDelta: storedLocation.longitudeDelta,
          }),
        );
        dispatch(setLocationName(response.payload.data[0].location_name));
        dispatch(setLocationId(response.payload.data[0].id));
        dispatch(setShopAddress(response.payload.data[0]));
        // navigation.goBack();
      } else {
        setShowServiceModal(true);
      }
    } catch (error) {
      console.error('Location confirmation error:', error);
    } finally {
      setIsCheckingAddress(false);
    }
  };

  useEffect(() => {
    const loadApplicationCharges = async () => {
      try {
        const data = await fetchApplicationCharges();
        setApplicationCharges(data[0]);
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

  const handleQuantityChange = (id, action) => {
    const updatedCartItems = cartItems
      .map(item =>
        item.id === id
          ? {
            ...item,
            quantity:
              action === 'increase'
                ? item.quantity + 1
                : Math.max(1, item.quantity - 1),
            totalPrice:
              item.price *
              (action === 'increase'
                ? item.quantity + 1
                : Math.max(1, item.quantity - 1)),
          }
          : item,
      )
      .filter(item => item.quantity > 0);

    setCartItems(updatedCartItems);
  };

  const handleDelete = async (id, quantityType) => {
    console.log('handleDelete called with:', id, quantityType);
    const updatedCartItems = cartItems.filter(item => item.id !== id);
    dispatch(removeFromCart({ id, quantityType }));
    setCartItems(updatedCartItems);

  };

  const handleClearCart = async () => {
    setCartItems([]);
    try {
      dispatch(clearCart());
      await AsyncStorage.removeItem('cartItems');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const navigateToHomeTab = () => {
    navigation.navigate('BottomNavigation', { screen: 'Home' });
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
        <Text style={styles.itemWeight}>
          {item.variant?.quantity_type || item?.quantity_type || item.weight}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>
            ₹
            {(
              Number(item.variant?.selling_price || item.offer || 0) *
              item.quantity
            ).toFixed(2)}
          </Text>
          <Text style={styles.originalPrice}>
            ₹
            {(
              Number(item.variant?.actual_price || item.price || 0) ||
              item.originalPrice ||
              0
            ).toFixed(2)}
          </Text>
        </View>
      </View>
      <View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => handleQuantityChange(item.id, 'decrease')}>
            {/* <Text style={styles.quantityButton}>-</Text> */}
            <Icon style={styles.quantityButton} name="remove" size={14} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleQuantityChange(item.id, 'increase')}>
            {/* <Text style={styles.quantityButton}>+</Text> */}
            <Icon style={styles.quantityButton} name="add" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            Alert.alert(
              'Remove Item',
              'Are you sure you want to remove this item from your cart?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => handleDelete(item.id, item.variant?.quantity_type || item?.quantity_type || item.weight),
                },
              ],
            );
          }}
        >
          <Icon name="delete" size={14} color="#D32F2F" style={{ marginRight: 4 }} />
          <Text style={styles.removeText}>Remove</Text>
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
                onPress: () => handleDelete(item.id, item.variant?.quantity_type || item?.quantity_type || item.weight),
              },
            ],
          );
        }}>
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
        onPress={navigateToHomeTab}
        style={[styles.exploreButton, { backgroundColor }]}>
        <Text style={styles.exploreButtonText}>Explore Items</Text>
      </TouchableOpacity>
    </View>
  );

  // const handlePlaceOrder = async () => {
  //   try {
  //     setIsProcessingPayment(true);

  //     const mappedItems = cartItems.map(item => {
  //       // Determine which price values to use
  //       const actualPrice = item?.variant?.actual_price ?? item?.price ?? 0;
  //       const sellingPrice =
  //         item?.variant?.selling_price ?? item?.offer ?? item?.price ?? 0;
  //       const quantityType =
  //         item?.variant?.quantity_type ?? item?.quantity_type ?? '';
  //       const filterOne = item?.variant?.filter_one ?? item?.filter_one ?? '';

  //       return {
  //         item_name: item?.name || '',
  //         item_image: item?.image || '',
  //         item_id: item?.id?.toString() || '',
  //         category_id: item?.category_id?.toString() || '',
  //         sub_category_id:
  //           item?.sub_category_id?.toString() ||
  //           item?.subcategory_id?.toString() ||
  //           '',
  //         category_name: item?.category_name || '',
  //         sub_category_name: item?.sub_category_name || '',
  //         actualitem_price: actualPrice.toString(),
  //         item_price: sellingPrice.toString(),
  //         sub_item_count: (item?.quantity ?? 1).toString(),
  //         item_total_amount: (
  //           (item?.totalPrice ?? sellingPrice * (item?.quantity ?? 1)) ||
  //           0
  //         ).toString(),
  //         item_description: item?.description || '',
  //         saving_price: (
  //           parseFloat(actualPrice) - parseFloat(sellingPrice)
  //         ).toString(),
  //         filter_one: filterOne,
  //         quantity_type: quantityType,
  //         shop_id: item?.shop_id?.toString() || '',
  //         value: item?.value,
  //       };
  //     });

  //     const totalSavingAmount = cartItems.reduce((acc, item) => {
  //       const actualPrice = parseFloat(item?.variant?.actual_price ?? item?.price ?? 0);
  //       const sellingPrice = parseFloat(item?.variant?.selling_price ?? item?.offer ?? item?.price ?? 0);
  //       const quantity = item?.quantity ?? 1;

  //       const savingPerItem = actualPrice - sellingPrice;
  //       return acc + (savingPerItem > 0 ? savingPerItem * quantity : 0);
  //     }, 0);

  //     const couponAmount = coupon?.coupon_percentage
  //       ? (calculateTotalPrice() * (coupon.coupon_percentage / 100)).toFixed(2)
  //       : '0.00';

  //     console.log(" calculateTotalPrice()", calculateTotalPrice())
  //     console.log("gstCalculation()", gstCalculation())
  //     console.log("counpun amount", calculateTotalPrice(), (coupon?.coupon_percentage / 100))
  //     let payload = {
  //       customer_id: customerId,
  //       customer_name: '',
  //       customer_mobile_number: mobileNumber,
  //       category_id: '',
  //       item_count: cartItems.length,
  //       total_amount:
  //         (
  //           Number(calculateTotalPrice()) +
  //           Number(applicationCharges?.delivery_fixed_charges) +
  //           Number(applicationCharges?.handling_charges) +
  //           Number(gstCalculation())
  //         ).toFixed(2) || 0,
  //       total_saving_amount: totalSavingAmount.toFixed(2),
  //       coupon_amount: couponAmount,
  //       delivery_charges: applicationCharges.delivery_fixed_charges || 0,
  //       grand_total: (
  //         calculateTotalPrice() +
  //         Number(applicationCharges?.delivery_fixed_charges) +
  //         Number(applicationCharges?.handling_charges) +
  //         Number(gstCalculation())
  //       ).toFixed(2) || 0,
  //       location_id: locationId,
  //       location_name: locationName,
  //       payment_type: selectedPaymentMethod,
  //       payment_id: '',
  //       razorpay_order_id: '',
  //       order_status: 1,
  //       order_instructions: '',
  //       coupon_type: coupon?.coupon_type || '',
  //       coupon_id: coupon?.id || '',
  //       delivery_address: address,
  //       order_latitude: storedLocation.latitude,
  //       order_longitude: storedLocation.longitude,
  //       order_distance: orderDistance || shopAddress.distance_km || '',
  //       ext_del_charge: applicationCharges?.delivery_fixed_charges,
  //       shop_id: shopAddress.id || '',
  //       actual_total_amount: calculateTotalPrice() || 0,
  //       order_type: 'Online',
  //       delivery_charges_gst: gstCalculation().toFixed(2) || 0,
  //       handling_charges: applicationCharges.handling_charges || 0,
  //       packing_charges: '',
  //       packing_charges_gst: '',
  //       donation_charges: '',
  //       delivery_instruction: deliveryInstructions,
  //       abhicash_amount: abhiWalletUsed,
  //       userwallet_amount: userWalletUsed,
  //       payment_amount: totalAfterWallets.toFixed(2),
  //       sub_order_array: mappedItems,
  //     };

  //     console.log('mappeditems', mappedItems);
  //     console.log('payload', payload);
  //     const finalPrice = parseFloat(totalAfterWallets);
  //     console.log("final price", finalPrice)
  //     if ((finalPrice === 0) || selectedPaymentMethod === 'COD' && address) {
  //       const responseCod = await dispatch(placeOrder({ orderDetails: payload }));
  //       if (!responseCod.payload) return;
  //       const orderDetails = {
  //         orderId: responseCod?.payload?.id || '',
  //         totalAmount: calculateTotalPrice(),
  //         grandTotal: (
  //           calculateTotalPrice() +
  //           Number(applicationCharges?.delivery_fixed_charges || 0) +
  //           Number(applicationCharges?.handling_charges || 0) +
  //           gstCalculation() -
  //           (couponAmount || 0)
  //         ).toFixed(2),
  //         couponAmount: couponAmount || 0,
  //         deliveryCharges: applicationCharges?.delivery_fixed_charges || 0,
  //         totalSavings: totalSavingAmount || 0,
  //         paymentType: selectedPaymentMethod,
  //         shopName: '',
  //         orderDate: responseCod.payload.order_date,
  //         orderTime: responseCod.payload.order_date,
  //         deliveryAddress: address,
  //         shopAddress: '',
  //         shopPhoneNumber: '',
  //         order_id: responseCod.payload.order_id,
  //         delivery_charges_gst: gstCalculation().toFixed(2) || 0,
  //         handling_charges: applicationCharges?.handling_charges || 0,
  //         abhicash_amount: abhiWalletUsed,
  //         userwallet_amount: userWalletUsed,
  //       };
  //       if (responseCod.payload.status === 200) {
  //         fetchWallet()
  //         navigation.navigate('OrderSuccess', { orderDetails, status: 0 });
  //       }
  //       return;
  //     }

  //     payload.order_status = 7;
  //     const pacedResponse = await dispatch(placeOrder({ orderDetails: payload }));
  //     if (!pacedResponse.payload) return;
  //     // Prepare order details only once
  //     const orderDetails = {
  //       orderId: pacedResponse.payload.id,
  //       totalAmount: calculateTotalPrice(),
  //       grandTotal:
  //         (
  //           calculateTotalPrice() +
  //           Number(applicationCharges?.delivery_fixed_charges || 0) +
  //           Number(applicationCharges?.handling_charges || 0) +
  //           gstCalculation() - (couponAmount || 0)
  //         ).toFixed(2),
  //       couponAmount: couponAmount || 0,
  //       deliveryCharges: applicationCharges?.delivery_fixed_charges || 0,
  //       totalSavings: totalSavingAmount,
  //       paymentType: selectedPaymentMethod,
  //       shopName: '',
  //       orderDate: pacedResponse.payload.order_date,
  //       orderTime: pacedResponse.payload.order_date,
  //       deliveryAddress: address,
  //       shopAddress: '',
  //       shopPhoneNumber: '',
  //       order_id: pacedResponse.payload.order_id,
  //       delivery_charges_gst: gstCalculation().toFixed(2) || 0,
  //       handling_charges: applicationCharges?.handling_charges || 0,
  //       abhicash_amount: abhiWalletUsed,
  //       userwallet_amount: userWalletUsed,
  //     };

  //     const options = {
  //       description: 'Order Payment',
  //       image: '',
  //       currency: 'INR',
  //       key: pacedResponse.payload.key_id,
  //       order_id: pacedResponse.payload.razorpay_order_id,
  //       amount: 1000,
  //       name: 'Abhi 24',
  //       prefill: {
  //         contact: mobileNumber,
  //         name: selectedAddress?.customer_name,
  //       },
  //       theme: { color: '#8655d2' },
  //     };

  //     RazorpayCheckout.open(options)
  //       .then(async data => {
  //         payload.payment_id = data.razorpay_payment_id;
  //         payload.razorpay_order_id = data.razorpay_order_id;
  //         payload.order_status = 0;

  //         await dispatch(
  //           updateOrderStatus({
  //             paymentId: data.razorpay_payment_id,
  //             rzpId: data.razorpay_order_id,
  //             orderId: pacedResponse.payload.id,
  //             orderStatus: 0,
  //           }),
  //         );
  //         fetchWallet()
  //         navigation.navigate('OrderSuccess', { orderDetails, status: 0 });
  //       })
  //       .catch(error => {
  //         let errorMessage = 'Transaction was not completed.';

  //         // Handle user cancel case explicitly
  //         if (
  //           error?.code === 0 ||
  //           error?.description === 'The payment was cancelled'
  //         ) {
  //           console.log('User exited Razorpay payment screen.');
  //           return; // Don’t show alert for user cancel
  //         }

  //         // Extract more specific error messages if available
  //         if (typeof error === 'object') {
  //           if (error.description) {
  //             errorMessage = error.description;
  //           } else if (error.error?.description) {
  //             errorMessage = error.error.description;
  //           } else if (error.reason) {
  //             errorMessage = error.reason.replace(/_/g, ' ');
  //           }
  //         }
  //         console.error('Payment failed:', error);
  //         Alert.alert('Payment Failed', errorMessage);
  //       });
  //   } catch (error) {
  //     console.error('Order Payment Error:', error);
  //     Alert.alert('Error', 'Something went wrong. Please try again.');
  //   } finally {
  //     setIsProcessingPayment(false);
  //   }
  // };

  // const calculateFinalPrice = () => {
  //   const deliveryCharge = Number(applicationCharges?.delivery_fixed_charges || 0);
  //   const handlingCharge = Number(applicationCharges?.handling_charges || 0);
  //   const gst = gstCalculation();

  //   let subtotal = muttonSubtotal + otherSubtotal;
  //   console.log("before coupon+++++++++++++++", subtotal)
  //   // Apply coupon on subtotal
  //   if (coupon) {
  //     if (coupon.type === 'percentage') {
  //       subtotal -= subtotal * (coupon.discount / 100);
  //     } else {
  //       subtotal -= coupon.discount;
  //     }
  //   }
  //   console.log("coupon", coupon)
  //   console.log("after coupon+++++++++++++++", subtotal)
  //   // Full total (after coupon)
  //   const totalBeforeWallets = subtotal + deliveryCharge + handlingCharge + gst;

  //   // Abhi Wallet can only be used for mutton subtotal (no change needed)
  //   const abhiWalletUsed = useAbhiWallet ? Math.min(muttonSubtotal, abhiWalletAmount) : 0;

  //   // User Wallet can apply to full remaining amount
  //   const remainingAfterAbhi = totalBeforeWallets - abhiWalletUsed;
  //   const userWalletUsed = useUserWallet ? Math.min(remainingAfterAbhi, userWalletAmount) : 0;
  //   console.log(totalBeforeWallets, abhiWalletUsed, userWalletUsed)
  //   const totalAfterWallets = totalBeforeWallets - abhiWalletUsed - userWalletUsed;

  //   return Math.max(0, totalAfterWallets);
  // };


  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);
      const actualPrice = item => parseFloat(item?.variant?.actual_price ?? item?.price ?? 0);
      const sellingPrice = item => parseFloat(item?.variant?.selling_price ?? item?.offer ?? item?.price ?? 0);
      const quantity = item => item?.quantity ?? 1;

      const mappedItems = cartItems.map(item => ({
        item_name: item?.name || '',
        item_image: item?.image || '',
        item_id: item?.id?.toString() || '',
        category_id: item?.category_id?.toString() || '',
        sub_category_id: item?.sub_category_id?.toString() || item?.subcategory_id?.toString() || '',
        category_name: item?.category_name || '',
        sub_category_name: item?.sub_category_name || '',
        actualitem_price: actualPrice(item).toFixed(2),
        item_price: sellingPrice(item).toFixed(2),
        sub_item_count: quantity(item).toString(),
        item_total_amount: (item?.totalPrice ?? sellingPrice(item) * quantity(item)).toFixed(2),
        item_description: item?.description || '',
        saving_price: (actualPrice(item) - sellingPrice(item)).toFixed(2),
        filter_one: item?.variant?.filter_one ?? item?.filter_one ?? '',
        quantity_type: item?.variant?.quantity_type ?? item?.quantity_type ?? '',
        shop_id: item?.shop_id?.toString() || '',
        value: item?.value,
      }));

      const totalSavingAmount = cartItems.reduce((acc, item) => {
        const save = actualPrice(item) - sellingPrice(item);
        return acc + (save > 0 ? save * quantity(item) : 0);
      }, 0);

      const totalPrice = calculateTotalPrice();
      const gst = gstCalculation();
      const delivery = Number(applicationCharges?.delivery_fixed_charges || 0);
      const handling = Number(applicationCharges?.handling_charges || 0);
      const couponAmount = coupon?.coupon_percentage
        ? ((totalPrice * coupon.coupon_percentage) / 100).toFixed(2)
        : '0.00';

      const grandTotal = (
        totalPrice + delivery + handling + gst - Number(couponAmount || 0)
      ).toFixed(2);

      const payload = {
        customer_id: customerId,
        customer_name: '',
        customer_mobile_number: mobileNumber,
        category_id: '',
        item_count: cartItems.length,
        total_amount: (totalPrice + delivery + handling + gst).toFixed(2),
        total_saving_amount: totalSavingAmount.toFixed(2),
        coupon_amount: couponAmount,
        delivery_charges: delivery,
        grand_total: grandTotal,
        location_id: locationId,
        location_name: locationName,
        payment_type: selectedPaymentMethod,
        payment_id: '',
        razorpay_order_id: '',
        order_status: selectedPaymentMethod === 'COD' || totalAfterWallets === 0 ? 1 : 7,
        order_instructions: '',
        coupon_type: coupon?.coupon_type || '',
        coupon_id: coupon?.id || '',
        delivery_address: address,
        order_latitude: storedLocation.latitude,
        order_longitude: storedLocation.longitude,
        order_distance: orderDistance || shopAddress.distance_km || '',
        ext_del_charge: delivery,
        shop_id: shopAddress.id || '',
        actual_total_amount: totalPrice,
        order_type: 'Online',
        delivery_charges_gst: gst.toFixed(2),
        handling_charges: handling,
        packing_charges: '',
        packing_charges_gst: '',
        donation_charges: '',
        delivery_instruction: deliveryInstructions,
        abhicash_amount: abhiWalletUsed,
        userwallet_amount: userWalletUsed,
        payment_amount: totalAfterWallets.toFixed(2),
        sub_order_array: mappedItems,
      };

      const isCodOrFree = selectedPaymentMethod === 'COD' || totalAfterWallets === 0;
      const orderResponse = await dispatch(placeOrder({ orderDetails: payload }));
      if (!orderResponse.payload) return;

      const orderDetails = {
        orderId: orderResponse.payload.id,
        totalAmount: totalPrice,
        grandTotal,
        couponAmount,
        deliveryCharges: delivery,
        totalSavings: totalSavingAmount.toFixed(2),
        paymentType: selectedPaymentMethod,
        shopName: '',
        orderDate: orderResponse.payload.order_date,
        orderTime: orderResponse.payload.order_date,
        deliveryAddress: address,
        shopAddress: '',
        shopPhoneNumber: '',
        order_id: orderResponse.payload.order_id,
        delivery_charges_gst: gst.toFixed(2),
        handling_charges: handling,
        abhicash_amount: abhiWalletUsed,
        userwallet_amount: userWalletUsed,
      };

      if (isCodOrFree && address) {
        if (orderResponse.payload.status === 200) {
          fetchWallet();
          navigation.navigate('OrderSuccess', { orderDetails, status: 0 });
        }
        return;
      }

      const options = {
        description: 'Order Payment',
        image: '',
        currency: 'INR',
        key: orderResponse.payload.key_id,
        order_id: orderResponse.payload.razorpay_order_id,
        amount: 1000, // You may want to update this to the actual amount * 100
        name: 'Abhi 24',
        prefill: {
          contact: mobileNumber,
          name: selectedAddress?.customer_name,
        },
        theme: { color: '#8655d2' },
      };

      RazorpayCheckout.open(options)
        .then(async data => {
          const updatedPayload = {
            ...payload,
            payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            order_status: 0,
          };

          await dispatch(updateOrderStatus({
            paymentId: data.razorpay_payment_id,
            rzpId: data.razorpay_order_id,
            orderId: orderResponse.payload.id,
            orderStatus: 0,
          }));

          fetchWallet();
          navigation.navigate('OrderSuccess', { orderDetails, status: 0 });
        })
        .catch(error => {
          if (
            error?.code === 0 ||
            error?.description === 'The payment was cancelled'
          ) return;

          let errorMessage = 'Transaction was not completed.';
          if (error.description) errorMessage = error.description;
          else if (error?.error?.description) errorMessage = error.error.description;
          else if (error.reason) errorMessage = error.reason.replace(/_/g, ' ');

          console.error('Payment failed:', error);
          Alert.alert('Payment Failed', errorMessage);
        });

    } catch (error) {
      console.error('Order Payment Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
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

  const couponAmount = coupon?.discount ? ((muttonSubtotal + otherSubtotal) * (coupon.discount / 100)).toFixed(2) : '0.00';

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity onPress={() => navigation.navigate("BottomNavigation")}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Cart</Text>

        {/* Invisible spacer to balance the back icon */}
        <View style={{ width: 24 }} />
      </View>
      {/* Location Section */}
      <View style={styles.locationSection}>
        <Icon
          name="home"
          size={16}
          color={backgroundColor}
          style={styles.homeIcon}
        />
        <Text style={styles.locationName}>
          {address ? address : locationName || 'Address Not Selected'}
        </Text>
      </View>
      {/* change location */}
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
                : {}),
            });
          } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert(
              'Navigation Error',
              'Unable to change address. Please try again later.',
              [{ text: 'OK' }],
            );
          }
        }}>
        <Text style={[styles.deliveryTagline, { color: backgroundColor }]}>
          Change Address
        </Text>
      </TouchableOpacity>

      {/* Conditional Rendering */}
      {cartItems.length === 0 ? (
        renderEmptyScreen()
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {/* Total Items Section */}
          <View style={styles.totalItems}>
            <Text style={styles.totalItemsText}>
              TOTAL ITEMS ({cartItems.length})
            </Text>
            <TouchableOpacity
              style={[styles.clearCartContainer, { backgroundColor }]}
              onPress={handleClearCart}>
              <Text style={styles.clearCart}>Clear Cart</Text>
              <Icon
                name="delete"
                size={16}
                color="#fff"
                style={styles.deleteIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Swipeable Item List */}
          <View >
            <SwipeListView
              data={cartItems}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-100}
              disableRightSwipe
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Apply Coupons Section */}
          {totalAfterWallets !== 0 && <TouchableOpacity
            style={styles.couponSection}
            onPress={() =>
              navigation.navigate('ApplyCuponScreen', {
                cartItems,
                totalAmount: totalBeforeWallets.toFixed(2),
                status: route.params?.status,
              })
            }>
            <View style={[styles.couponIcon, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="local-offer" size={24} color={backgroundColor} />
            </View>

            {coupon ? (
              <View style={styles.couponAppliedContainer}>
                <View style={{ width: "85%" }}>
                  <Text style={styles.couponText}>
                    Saved ₹
                    {coupon.type === 'percentage'
                      ? ((muttonSubtotal + otherSubtotal) * (coupon.discount / 100)).toFixed(2)
                      : coupon.discount.toFixed(2)}
                  </Text>
                  <Text style={[styles.couponCodeText, { color: backgroundColor, marginLeft: 10 }]}>
                    {coupon.code} Applied
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setCoupon(null)}
                  style={styles.removeCouponButton}>
                  <Icon name="close" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.couponText}>Apply coupons</Text>
                <Icon name="chevron-right" size={24} color="#000" />
              </>
            )}
          </TouchableOpacity>}

          {(abhiWalletAmount > 0 || userWalletAmount > 0) &&
            abhiWalletAmount > 0 && userWalletAmount > 0 && (
              <View style={styles.walletSection}>
                {abhiWalletAmount > 0 && muttonSubtotal > 0 && (
                  <View style={styles.walletRow}>
                    <View style={styles.walletIcon}>
                      <Icon
                        name="account-balance-wallet"
                        size={24}
                        color="#4CAF50"
                      />
                    </View>
                    <View style={styles.walletTextContainer}>
                      <Text style={styles.walletText}>
                        {useAbhiWallet
                          ? `Using ₹${abhiWalletUsed.toFixed(2)} from Abhi Wallet`
                          : `Use Abhi Wallet (₹${abhiWalletAmount})`}
                      </Text>
                    </View>
                    <Switch
                      value={useAbhiWallet}
                      onValueChange={val => setUseAbhiWallet(val)}
                    />
                  </View>
                )}

                {userWalletAmount > 0 && otherSubtotal > 0 && (
                  <View style={styles.walletRow}>
                    <View style={styles.walletIcon}>
                      <Icon
                        name="account-balance-wallet"
                        size={24}
                        color="#03A9F4"
                      />
                    </View>
                    <View style={styles.walletTextContainer}>
                      <Text style={styles.walletText}>
                        {useUserWallet
                          ? `Using ₹${userWalletUsed.toFixed(2)} from Wallet`
                          : `Use Wallet (₹${userWalletAmount})`}
                      </Text>
                    </View>
                    <Switch
                      value={useUserWallet}
                      onValueChange={val => setUseUserWallet(val)}
                    />
                  </View>
                )}
                
              </View>
            )}

          {/* Add Delivery Instructions */}
          <TouchableOpacity
            style={styles.deliveryInstructions}
            onPress={() => {
              setTempInstruction(deliveryInstructions); // <-- preload from redux
              setShowInstructionModal(true);
            }}>
            <Text style={styles.deliveryText}>
              {deliveryInstructions
                ? `Note: ${deliveryInstructions}`
                : '+ Add Delivery Instructions'}
            </Text>
          </TouchableOpacity>

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
            </View>

            {/* Item Total - always show */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>
                ₹{(muttonSubtotal + otherSubtotal).toFixed(2)}
              </Text>
            </View>


            {/* Delivery Charge */}
            {Number(applicationCharges?.delivery_fixed_charges) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Charges</Text>
                <Text style={[styles.summaryValue]}>
                  ₹{applicationCharges?.delivery_fixed_charges}
                </Text>
              </View>
            )}

            {/* Platform Fee */}
            {Number(applicationCharges?.handling_charges) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform fee</Text>
                <Text style={styles.summaryValue}>
                  ₹{applicationCharges?.handling_charges}
                </Text>
              </View>
            )}

            {/* GST */}
            {applicationCharges?.gst_percentage > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  GST & Restaurant Charges
                </Text>
                <Text style={styles.summaryValue}>
                  ₹{gstCalculation().toFixed(2)}
                </Text>
              </View>
            )}

            {/* Coupon */}
            {coupon && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                  Coupon Applied
                </Text>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  -₹
                  {coupon.type === 'percentage'
                    ? ((muttonSubtotal + otherSubtotal) * (coupon.discount / 100)).toFixed(
                      2,
                    )
                    : coupon.discount}
                </Text>
              </View>
            )}

            {/* Wallet Deduction */}
            {abhiWalletUsed > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                  Abhi Wallet Used
                </Text>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  -₹{abhiWalletUsed.toFixed(2)}
                </Text>
              </View>
            )}

            {userWalletUsed > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                  Wallet Used
                </Text>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  -₹{userWalletUsed.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Final To Pay */}
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: "#ddd", paddingTop: 4, borderStyle: 'dashed' }]}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>
                To Pay
              </Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                ₹{totalAfterWallets.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* <View style={styles.Paymentcontainer}>
            <TouchableOpacity
              style={styles.selectedMethodBox}
              onPress={() => setPaymentMenuVisible(prev => !prev)}>
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
                    }}>
                    <Text
                      style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method &&
                        styles.selectedTextBold,
                      ]}>
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View> */}

          {/* Place Order Button */}
          <View style={{ paddingBottom: 60 }}>
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                {
                  backgroundColor: isProcessingPayment
                    ? '#ccc'
                    : backgroundColor,
                },
              ]}
              onPress={handlePlaceOrder}
              disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.placeOrderText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <Modal
        transparent
        visible={showServiceModal}
        animationType="fade"
        onRequestClose={() => setShowServiceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Service Unavailable</Text>
            <Text style={styles.modalText}>
              We currently do not provide service in your area. You can change
              your location or visit our app for more information.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.changeLocationBtn}
                onPress={() => {
                  setShowServiceModal(false);
                  navigation.navigate('SelectServiceFromLocation'); // 👈 Navigate here
                }}>
                <Text style={styles.buttonText}>Change Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showInstructionModal && (
        <View style={styles.CustomModalOverlay}>
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
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  dispatch(setDeliveryInstructions(tempInstruction));
                  setShowInstructionModal(false);
                }}
                style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '5%',
    paddingHorizontal: 10,
    borderBottomStartRadius: 25,
    borderBottomEndRadius: 25,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },

  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    marginTop: 13,
  },

  removeText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '500',
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
    fontSize: 14,
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
    flexDirection: 'row',
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
  },
  quantityButton: {
    fontSize: 18,
    paddingHorizontal: 3,
    color: '#000',
  },
  quantityText: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
  hiddenItem: {
    backgroundColor: '#D32F2F', // Will be overridden by backgroundColor
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 15,
  },
  deleteButton: {
    backgroundColor: '#D32F2F', // Will be overridden by backgroundColor
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
    flexDirection: 'column',
    paddingVertical: 10,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  couponSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  couponIcon: {
    backgroundColor: '#FFEBEE', // Will be updated to a light green shade
    borderRadius: 20,
    padding: 5,
  },
  couponText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  couponAppliedContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  removeCouponButton: {
    marginLeft: 10,
    padding: 4,
  },

  deliveryInstructions: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 2,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  deliveryText: {
    fontSize: 16,
    color: '#666',
  },
  orderSummary: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewMore: {
    color: '#D32F2F', // Will be overridden by backgroundColor
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addTip: {
    color: '#D32F2F', // Will be overridden by backgroundColor
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  placeOrderButton: {
    backgroundColor: '#D32F2F', // Will be overridden by backgroundColor
    padding: 15,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
    // paddingBottom:100
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#000',
    fontWeight: '700',
    width: responsiveWidth(75),
    textAlign: 'center',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  CustomModalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20000,
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
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 30,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  changeLocationBtn: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  visitAppBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  walletTextContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },

  walletSection: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 18,
  },

  walletIcon: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  walletText: {
    fontSize: 14,
    color: '#333',
  },
});

export default BasketScreen;
