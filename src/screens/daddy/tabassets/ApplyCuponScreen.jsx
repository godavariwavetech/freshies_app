import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import { getCoupons } from '../../../services/services'; // Import the getCoupons service

const ApplyCouponScreen = ({ navigation, route }) => {
  const [promoCode, setPromoCode] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cartItems, totalAmount = 0, status } = route.params || {};
 
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const response = await getCoupons();
         console.log("0000000", response)
        // Filter and validate coupons
        const validCoupons = response.filter(coupon => {
          const minPurchase = parseFloat(coupon.coupon_upto_price || 0);
          return totalAmount >= minPurchase;
        });
        
        setCoupons(validCoupons);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError(err.message || 'Failed to load coupons');
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load coupons. Please try again.',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      }
    };

    fetchCoupons();
  }, [totalAmount]);

  const handleApplyCoupon = (coupon) => {
    // Validate coupon
    const minPurchase = parseFloat(coupon.coupon_upto_price || 0);
    const maxDiscount = parseFloat(coupon.coupon_max_price_limit || 0);
    const couponPercentage = parseFloat(coupon.coupon_percentage || 0);

    if (totalAmount < minPurchase) {
      Toast.show({
        type: 'error',
        text1: 'Coupon Not Applicable',
        text2: `Minimum purchase of ₹${minPurchase.toFixed(2)} required`,
        position: 'top',
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
      return;
    }

    // Calculate discount
    let discountAmount = totalAmount * (couponPercentage / 100);
    if (maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, maxDiscount);
    }

    // Prepare coupon details
    const appliedCoupon = {
      ...coupon,
      type: 'percentage',
      discount: couponPercentage,
      discountAmount: discountAmount,
      code: coupon.coupon_name,
    };

    // Navigate back with coupon details
    navigation.navigate({
      name: route.params?.previousScreen || 'ByOncescreen',
      params: {
        appliedCoupon: appliedCoupon,
        cartItems: cartItems,
        status: status,
      },
      merge: true,
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B3395" />
        <Text style={styles.loadingText}>Loading Coupons...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Icon name="error-outline" size={wp('20%')} color="#FF4444" />
        <Text style={styles.errorText}>Failed to load coupons</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            const fetchCoupons = async () => {
              try {
                setIsLoading(true);
                const response = await getCoupons();
                const validCoupons = response.filter(coupon => {
                  const minPurchase = parseFloat(coupon.coupon_upto_price || 0);
                  return totalAmount >= minPurchase;
                });
                setCoupons(validCoupons);
                setIsLoading(false);
              } catch (err) {
                setError(err.message);
                setIsLoading(false);
              }
            };
            fetchCoupons();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderCoupon = ({ item }) => (
    <View
      style={[
        styles.couponContainer,
        totalAmount < parseFloat(item.coupon_upto_price || 0) && styles.disabledCoupon,
      ]}
    >
      <View style={styles.couponHeader}>
        <Text style={styles.couponCode}>{item.coupon_name}</Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApplyCoupon(item)}
          disabled={totalAmount < parseFloat(item.coupon_upto_price || 0)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.couponTitle}>{item.coupon_description}</Text>
      <Text style={styles.couponValidity}>
        Min. Purchase: ₹{parseFloat(item.coupon_upto_price || 0).toFixed(2)}
      </Text>
      {parseFloat(item.coupon_max_price_limit || 0) > 0 && (
        <Text style={styles.couponValidity}>
          Max Discount: ₹{parseFloat(item.coupon_max_price_limit || 0).toFixed(2)}
        </Text>
      )}
      {/* <TouchableOpacity>
        <Text style={styles.viewDetails}>View Details</Text>
      </TouchableOpacity> */}
    </View>
  );

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#8655d2" barStyle="light-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={wp('6%')} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply Coupon</Text>
        </View>

        {/* Promo Code Input */}
        <View style={styles.promoContainer}>
          <Text style={styles.promoLabel}>Have a Promo Code?</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter coupon code"
              placeholderTextColor="#999"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setPromoCode('')}
            >
              <Icon name="close" size={wp('5%')} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.promoApplyButton}
            onPress={() => {
              const matchedCoupon = coupons.find(
                coupon => coupon.coupon_name.toUpperCase() === promoCode.toUpperCase()
              );

              if (matchedCoupon) {
                handleApplyCoupon(matchedCoupon);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Invalid Coupon',
                  text2: 'The coupon code you entered is not valid.',
                  position: 'top',
                  topOffset: Platform.OS === 'ios' ? 50 : 30,
                });
              }
            }}
          >
            <Text style={styles.promoApplyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Available Coupons */}
        <View style={styles.couponsSection}>
          <Text style={styles.sectionTitle}>Available Coupons for You</Text>
          {coupons.length === 0 ? (
            <View style={styles.emptyCouponsContainer}>
              <Icon name="local-offer" size={wp('20%')} color="#999" />
              <Text style={styles.emptyCouponsText}>
                No applicable coupons available
              </Text>
              <Text style={styles.emptyCouponsSubtext}>
                Total cart value: ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
          ) : (
            <FlatList
              data={coupons}
              renderItem={renderCoupon}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.couponList}
            />
          )}
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#8655d2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  headerTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginLeft: wp('4%'),
  },
  promoContainer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFF',
  },
  promoLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  promoInput: {
    flex: 1,
    padding: wp('3%'),
    fontSize: wp('4%'),
    color: '#000',
  },
  clearButton: {
    padding: wp('2%'),
  },
  promoApplyButton: {
    backgroundColor: '#8655d2',
    borderRadius: 8,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  promoApplyButtonText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  couponsSection: {
    flex: 1,
    paddingHorizontal: wp('4%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('2%'),
  },
  couponList: {
    paddingBottom: hp('2%'),
  },
  couponContainer: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledCoupon: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  couponCode: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#8655d2',
  },
  applyButton: {
    backgroundColor: '#8655d2',
    borderRadius: 20,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
  },
  applyButtonText: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#FFF',
  },
  couponTitle: {
    fontSize: wp('3.5%'),
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  couponValidity: {
    fontSize: wp('3%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  viewDetails: {
    fontSize: wp('3.5%'),
    color: '#4B3395',
    fontWeight: '600',
  },
  emptyCouponsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('10%'),
  },
  emptyCouponsText: {
    fontSize: wp('4%'),
    color: '#666',
    marginTop: hp('2%'),
    textAlign: 'center',
  },
  emptyCouponsSubtext: {
    fontSize: wp('3%'),
    color: '#999',
    marginTop: hp('1%'),
    textAlign: 'center',
  },
  loadingText: {
    marginTop: wp('4%'),
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    marginTop: wp('4%'),
    fontSize: wp('4%'),
    color: '#FF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: wp('4%'),
    backgroundColor: '#4B3395',
    paddingHorizontal: wp('6%'),
    paddingVertical: wp('2%'),
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
});

export default ApplyCouponScreen;