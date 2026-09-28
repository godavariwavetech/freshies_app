import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { getPreviousOrders } from '../services/services';
import Icon from 'react-native-vector-icons/Ionicons'; // or MaterialIcons, Feather, etc.
import { useDispatch, useSelector } from 'react-redux'; // ✅ Import useSelector
import FocusAwareStatusBar from '../components/CustomStatusBar';
import { actionLogout } from '../redux/reducers/auth';
import { clearCart } from '../redux/reducers/daddy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const PreviousOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const customerId = useSelector(state => state.Auth.customerId)
  const [activeTab, setActiveTab] = useState('InProgress'); // 'InProgress' | 'Completed'
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  
  
  const fetchOrders = async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        customer_id: customerId,
        order_id: 0
      };
      const result = await getPreviousOrders(payload);
      setOrders(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh when Screen is Focused
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [customerId])
  );


  const renderOrder = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('TrackOrder', {
          orderDetails: {
            orderId: item.id,
            totalAmount: item.total_amount,
            grandTotal: item.grand_total,
            couponAmount: item.coupon_amount,
            deliveryCharges: item.delivery_charges,
            totalSavings: item.total_saving_amount,
            paymentType: item.payment_type,
            shopName: item.shop_name,
            orderDate: item.order_date,
            orderTime: item.order_time,
            deliveryAddress: item.delivery_address,
            shopAddress: item.shop_address,
            shopPhoneNumber: item.shop_phone_number,
            order_id: item.order_id,
            delivery_charges_gst: item.delivery_charges_gst,
            handling_charges: item.handling_charges,
            abhicash_amount: item.abhicash_amount,
            userwallet_amount: item.userwallet_amount,
            orderDeliverdDateTime: item.order_deliverd_date_time,
          },
          status: item.order_status,
        })}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.orderStatus}>#{item.order_id}</Text>
        <Text style={styles.orderDate}>{item.order_status === 3 ? item.order_deliverd_date_time : item.order_date_time}</Text>
      </View>

      <View style={styles.middleRow}>
        <Text style={styles.itemCount}>Items: {item.item_count}</Text>
        <Text style={styles.amount}>₹{item.grand_total}</Text>
      </View>

      <Text numberOfLines={1} style={styles.address}>{item.delivery_address}</Text>
    </TouchableOpacity>

  );

  const getInProgressOrders = () => {
    return orders.filter(order =>
      [0, 1, 2, 7, 8].includes(order.order_status) // Placed, Accepted, Ongoing, Waiting Payment, Delivery Boy Accepted
    );
  };

  const getCompletedOrders = () => {
    return orders.filter(order =>
      [3, 4, 5, 6].includes(order.order_status) // Completed, User Cancelled, Rejected, Not Received
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1}}>
        {/* Header */}
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#117943" />
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 5, backgroundColor: "#117943" , paddingTop: insets.top }}>
          <TouchableOpacity onPress={() =>  {

                    // Navigate back based on where user came from
                    if (route.params?.fromProfile) {
                      navigation.navigate('BottomNavigation', { screen: 'Profile' });
                    } else {
                      navigation.goBack();
                    }
          }
             }>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 16, color: "white" }}>
            Previous Orders
          </Text>
        </View>

        {/* Login Prompt for users without customer ID */}
        {!customerId && (
          <View style={styles.loginPromptContainer}>
            <Icon name="person-circle-outline" size={60} color="#117943" />
            <Text style={styles.loginPromptTitle}>Login Required</Text>
            <Text style={styles.loginPromptText}>
              Please login to view your previous orders and track your deliveries.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                // dispatch(actionLogout());
                navigation.navigate('Register1', { withoutLogin: true });
              }}>

              <Text style={styles.loginButtonText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {customerId && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
              <TouchableOpacity
                onPress={() => setActiveTab('InProgress')}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  backgroundColor: activeTab === 'InProgress' ? '#117943' : '#ddd',
                  marginRight: 10,
                }}
              >
                <Text style={{ color: activeTab === 'InProgress' ? '#fff' : '#000' }}>In-Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('Completed')}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  backgroundColor: activeTab === 'Completed' ? '#117943' : '#ddd',
                }}
              >
                <Text style={{ color: activeTab === 'Completed' ? '#fff' : '#000' }}>Completed</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#117943" />
              </View>
            ) : (activeTab === 'InProgress' ? getInProgressOrders().length === 0 : getCompletedOrders().length === 0) ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#888' }}>No {activeTab === 'InProgress' ? 'In-Progress' : 'Completed'} orders available</Text>
              </View>
            ) : (
              <FlatList
                data={activeTab === 'InProgress' ? getInProgressOrders() : getCompletedOrders()}
                keyExtractor={(item) => item.order_id.toString()}
                renderItem={renderOrder}
                contentContainerStyle={{ paddingBottom: 200 }}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );



};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    margin: 5
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#117943',
  },

  orderDate: {
    fontSize: 12,
    color: '#888',
  },

  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  itemCount: {
    fontSize: 14,
    color: '#333',
  },

  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },

  address: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F6F6F6',
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#117943',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default PreviousOrdersScreen;
