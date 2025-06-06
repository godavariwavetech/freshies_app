import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';

// Import the getCoupons service
import { getCoupons } from '../../../services/services';

const ApplyCouponScreen = ({ navigation, route }) => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cartItems, totalAmount = 0, status } = route.params || {};

  // Fetch coupons when the screen loads
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const response = await getCoupons();
        
        // Filter and validate coupons
        const validCoupons = response.filter(coupon => {
          // Validate coupon conditions
          const minPurchase = parseFloat(coupon.coupon_upto_price || 0);
          const maxDiscount = parseFloat(coupon.coupon_max_price_limit || 0);
          const couponPercentage = parseFloat(coupon.coupon_percentage || 0);

          // Check if coupon meets minimum purchase requirement
          const isValidPurchase = totalAmount >= minPurchase;
          
          // Optional: Add more validation logic here
          // For example, check expiry date, location, etc.
          
          return isValidPurchase;
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

  const handleCouponSelect = (coupon) => {
    // Detailed coupon validation
    const minPurchase = parseFloat(coupon.coupon_upto_price || 0);
    const maxDiscount = parseFloat(coupon.coupon_max_price_limit || 0);
    const couponPercentage = parseFloat(coupon.coupon_percentage || 0);

    // Validate coupon
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
    
    // Cap discount at max limit if specified
    if (maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, maxDiscount);
    }

    // Prepare coupon details
    const appliedCoupon = {
      ...coupon,
      type: 'percentage', // Assuming percentage-based coupon
      discount: couponPercentage,
      discountAmount: discountAmount,
      code: coupon.coupon_name
    };

    // Navigate back with coupon details
    navigation.navigate({
      name: route.params?.previousScreen || 'ByOncescreen', 
      params: { 
        appliedCoupon: appliedCoupon,
        cartItems: cartItems,
        status: status
      },
      merge: true
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#9010BF" />
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
            // Retry fetching coupons
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply Coupon</Text>
      </View>

      {/* Coupon List */}
      <ScrollView 
        style={styles.couponList}
        showsVerticalScrollIndicator={false}
      >
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
          coupons.map((coupon) => {
            const minPurchase = parseFloat(coupon.coupon_upto_price || 0);
            const maxDiscount = parseFloat(coupon.coupon_max_price_limit || 0);
            
            return (
              <TouchableOpacity 
                key={coupon.id} 
                style={[
                  styles.couponContainer, 
                  totalAmount < minPurchase && styles.disabledCoupon
                ]}
                onPress={() => handleCouponSelect(coupon)}
                disabled={totalAmount < minPurchase}
              >
                <View style={styles.couponDetails}>
                  <Text style={styles.couponCode}>{coupon.coupon_name}</Text>
                  <Text style={styles.couponDescription}>
                    {coupon.coupon_description}
                  </Text>
                  <Text style={styles.couponCondition}>
                    Min. Purchase: ₹{minPurchase.toFixed(2)}
                  </Text>
                  {maxDiscount > 0 && (
                    <Text style={styles.couponCondition}>
                      Max Discount: ₹{maxDiscount.toFixed(2)}
                    </Text>
                  )}
                </View>
                <View style={styles.couponDiscount}>
                  <Text style={styles.discountText}>
                    {coupon.coupon_percentage}% OFF
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginLeft: wp('4%'),
  },
  couponList: {
    width: '100%',
    padding: wp('4%'),
  },
  couponContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: wp('4%'),
    marginBottom: wp('3%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledCoupon: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  couponDetails: {
    flex: 1,
    marginRight: wp('2%'),
  },
  couponCode: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: wp('1%'),
  },
  couponDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: wp('1%'),
  },
  couponCondition: {
    fontSize: wp('3%'),
    color: '#999',
    marginBottom: wp('0.5%'),
  },
  couponDiscount: {
    backgroundColor: '#9010BF',
    borderRadius: 5,
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('2%'),
  },
  discountText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
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
  },
  errorText: {
    marginTop: wp('4%'),
    fontSize: wp('4%'),
    color: '#FF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: wp('4%'),
    backgroundColor: '#9010BF',
    paddingHorizontal: wp('6%'),
    paddingVertical: wp('2%'),
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
});

export default ApplyCouponScreen; 