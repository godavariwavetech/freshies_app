import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getPreviousOrders } from '../services/services';
import Icon from 'react-native-vector-icons/Ionicons'; // or MaterialIcons, Feather, etc.
import { useSelector } from 'react-redux'; // ✅ Import useSelector
import FocusAwareStatusBar from '../components/CustomStatusBar';


const PreviousOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const customerId = useSelector(state => state.Auth.customerId)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) return; // Avoid API call if customerId is missing
   
      try {
        const payload = {
          customer_id: customerId,
          order_id: 0
        };
        const result = await getPreviousOrders(payload);
        console.log("previous orders", result)
        setOrders(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);


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
        },
        status: item.order_status,
      })}
    style={styles.card}
  >
    <View style={styles.headerRow}>
      <Text style={styles.orderStatus}>#{item.order_id}</Text>
      <Text style={styles.orderDate}>{item.order_date_time}</Text>
    </View>
  
    <View style={styles.middleRow}>
      <Text style={styles.itemCount}>Items: {item.item_count}</Text>
      <Text style={styles.amount}>₹{item.grand_total}</Text>
    </View>
  
    <Text numberOfLines={1} style={styles.address}>{item.delivery_address}</Text>
  </TouchableOpacity>
  
  );



  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 5, backgroundColor: "#8655d2" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 16, color: "white" }}>
            Previous Orders
          </Text>
        </View>
        
  
        {/* Loading or Data */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8655d2" />
          </View>
        ) : orders.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#888' }}>No orders available</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.order_id.toString()}
            renderItem={renderOrder}
            contentContainerStyle={{ paddingBottom: 200 }}
          />
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
    color: '#8655d2',
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
  
});


export default PreviousOrdersScreen;
