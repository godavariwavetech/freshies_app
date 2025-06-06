import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getPreviousOrders } from '../api/orders'; // adjust path
import { useNavigation } from '@react-navigation/native';

const PreviousOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await getPreviousOrders(2); // Example userId
        setOrders(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_id })}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.shopName}>{item.shop_name}</Text>
        <Text style={styles.orderStatus}>#{item.order_id}</Text>
      </View>
      <Text style={styles.orderDate}>{item.order_date_time}</Text>
      <Text style={styles.itemCount}>Items: {item.item_count}</Text>
      <Text style={styles.amount}>₹{item.grand_total}</Text>
      <Text numberOfLines={1} style={styles.address}>{item.delivery_address}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#6A48D2" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F6F6F6',
      padding: 16,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    shopName: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#333',
    },
    orderStatus: {
      fontSize: 12,
      color: '#6A48D2',
    },
    orderDate: {
      fontSize: 13,
      color: '#999',
      marginTop: 4,
    },
    itemCount: {
      fontSize: 14,
      color: '#444',
      marginTop: 6,
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      marginTop: 4,
    },
    address: {
      fontSize: 12,
      color: '#555',
      marginTop: 6,
    },
  });
  

export default PreviousOrdersScreen;
