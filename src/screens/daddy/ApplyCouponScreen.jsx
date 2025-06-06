import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { 
  widthPercentageToDP as wp, 
  heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

// Import the getCoupons service
import { getCoupons } from '../../services/services';

const ApplyCouponScreen = ({ navigation, route }) => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch coupons when the screen loads
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const fetchedCoupons = await getCoupons();
        setCoupons(fetchedCoupons);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError(err.message);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load coupons. Please try again.',
        });
      }
    };

    fetchCoupons();
  }, []);

  // Render individual coupon item
  const renderCouponItem = ({ item }) => {
    const handleApplyCoupon = () => {
      // Pass selected coupon back to previous screen
      navigation.navigate({
        name: route.params?.previousScreen || 'CheckoutScreen',
        params: { 
          selectedCoupon: item 
        },
        merge: true,
      });
    };

    return (
      <TouchableOpacity 
        style={styles.couponContainer}
        onPress={handleApplyCoupon}
      >
        <View style={styles.couponHeader}>
          <Text style={styles.couponName}>{item.coupon_name}</Text>
          <Text style={styles.couponPercentage}>
            {item.coupon_percentage}% OFF
          </Text>
        </View>
        
        <Text style={styles.couponDescription}>
          {item.coupon_description}
        </Text>
        
        <View style={styles.couponDetailsContainer}>
          <View style={styles.couponDetail}>
            <Text style={styles.couponDetailLabel}>Location:</Text>
            <Text style={styles.couponDetailValue}>
              {item.location_name}
            </Text>
          </View>
          
          <View style={styles.couponDetail}>
            <Text style={styles.couponDetailLabel}>Max Discount:</Text>
            <Text style={styles.couponDetailValue}>
              ₹{item.coupon_max_price_limit}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9010BF" />
        <Text style={styles.loadingText}>Loading Coupons...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={wp('20%')} color="#FF4444" />
        <Text style={styles.errorText}>Failed to load coupons</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            // Retry fetching coupons
            const fetchCoupons = async () => {
              try {
                setIsLoading(true);
                const fetchedCoupons = await getCoupons();
                setCoupons(fetchedCoupons);
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
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Coupons</Text>
      </View>

      <FlatList
        data={coupons}
        renderItem={renderCouponItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.couponListContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyCouponsContainer}>
            <Icon name="ticket-outline" size={wp('20%')} color="#9010BF" />
            <Text style={styles.emptyCouponsText}>
              No coupons available at the moment
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: wp('4%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#000',
  },
  couponListContainer: {
    padding: wp('4%'),
  },
  couponContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  couponName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#9010BF',
  },
  couponPercentage: {
    fontSize: wp('4%'),
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  couponDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('1%'),
  },
  couponDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  couponDetail: {
    flexDirection: 'row',
  },
  couponDetailLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginRight: wp('2%'),
  },
  couponDetailValue: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: '#9010BF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: wp('5%'),
    color: '#FF4444',
    marginTop: hp('2%'),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#9010BF',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    borderRadius: 5,
    marginTop: hp('2%'),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  emptyCouponsContainer: {
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
});

export default ApplyCouponScreen; 