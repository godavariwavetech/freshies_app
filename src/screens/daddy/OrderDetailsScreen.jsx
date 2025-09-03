import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message'; // Ensure toast is configured globally
import { getCoupons } from '../../services/services';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



// Assuming styles are defined in a separate file

 
const OffersScreen = ({ navigation }) => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchCouponsApi = async () => {
      try {
        setIsLoading(true);
        const response = await getCoupons(); // Assuming this returns the provided API data
       
        // Filter only active coupons (optional)
        // const validCoupons = response.filter(coupon => coupon.coupon_status === 0);
        setCoupons(response);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError(err.message || 'Failed to load offers');
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load offers. Please try again.',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      }
    };

    fetchCouponsApi();
  }, []);

  const renderCoupon = ({ item }) => (
    <View style={styles.couponCard}>
      <View style={styles.couponHeader}>
        <MaterialCommunityIcons name="tag-outline" size={24} color="#8655d2" />
        <Text style={styles.couponName}>{item.coupon_name}</Text>
      </View>
      <Text style={styles.couponDescription}>{item.coupon_description}</Text>
      <Text style={styles.couponMeta}>
        {item.coupon_percentage}% off • Max ₹{item.coupon_max_price_limit}
      </Text>
      {item.coupon_upto_price > 0 && (
        <Text style={styles.couponMetaSmall}>
          Minimum cart value: ₹{item.coupon_upto_price}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView >
        <StatusBar backgroundColor="#8655d2" barStyle="light-content" />

        {/* Header */}
        <View style={[styles.header,{paddingTop: insets.top}]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Available Offers</Text>
        </View>

        {/* Offers List */}
        <View style={styles.couponsSection}>
          {/* Refer & Earn Card — Always Visible */}
          <LinearGradient
            colors={['#a77be9', '#8655d2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.referCard}
          >
            {/* Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔥 Trending</Text>
            </View>

            {/* Content */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ReferAndEarnScreen')}
              style={{ flex: 1 }}
              activeOpacity={0.85}
            >
              <View style={styles.couponHeader}>
                <MaterialCommunityIcons name="gift-outline" size={26} color="#fff" />
                <Text style={styles.referTitle}>Refer & Earn</Text>
              </View>
              <Text style={styles.referDescription}>
                Invite friends and earn rewards! Tap to view more.
              </Text>
              <Text style={styles.referMeta}>Share your referral code & get benefits</Text>
            </TouchableOpacity>
          </LinearGradient>


          {/* Rest of the offers logic */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#8655d2" />
          ) : coupons.length === 0 ? (
            <View style={styles.emptyCouponsContainer}>
              <Icon name="local-offer" size={80} color="#999" />
              <Text style={styles.emptyCouponsText}>No offers available</Text>
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
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8655d2',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 16,
  },
  couponsSection: {
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  couponName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8655d2',
    marginLeft: 8,
  },
  couponDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  couponMeta: {
    fontSize: 13,
    color: '#555',
  },
  couponMetaSmall: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  emptyCouponsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyCouponsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '600',
  },
  referCard: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  referTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  referDescription: {
    fontSize: 14,
    color: '#f5f5f5',
    marginTop: 8,
    marginBottom: 4,
  },
  referMeta: {
    fontSize: 13,
    color: '#ddd',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffdd55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  couponCard: {
    backgroundColor: '#F3EDFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  
  couponName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#8655d2',
  },
  
  couponDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  
  couponMeta: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  
  couponMetaSmall: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  
  referCard: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  
  referTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  
  referDescription: {
    fontSize: 14,
    color: '#f0f0f0',
    marginTop: 8,
  },
  
  referMeta: {
    fontSize: 13,
    color: '#ddd',
  },
  
});

export default OffersScreen


