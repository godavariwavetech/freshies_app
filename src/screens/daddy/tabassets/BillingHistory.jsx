import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FocusAwareStatusBar from '../../../components/CustomStatusBar';
import { WalletAPI } from '../../../services/services';
import { useSelector } from 'react-redux';

const BillingHistoryScreen = ({ navigation }) => {
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customerId } = useSelector(state => state.Auth);

  

  useEffect(() => {
    const fetchBillingHistory = async () => {
      setLoading(true);
      const data = await WalletAPI.getBillingHistory(customerId);
      
      setBillingHistory(data);
      setLoading(false);
    };

    fetchBillingHistory();
  }, []);

  const renderBillingItem = ({ item }) => (
    <View style={styles.billingItem}>
      <View style={styles.billingDetails}>
        <Text style={styles.billingDescription}>Txn ID: {item.razorpay_order_id}</Text>
        <Text style={styles.billingDate}>{item.formatted_datetime}</Text>
      </View>
      <Text style={styles.billingAmount}>- ₹{parseFloat(item.payment_amount).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing History</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      {/* List or Loading */}
      {loading ? (
        <ActivityIndicator size="large" color="#8655d2" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={billingHistory}
          renderItem={renderBillingItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.billingList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>
              No billing history found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#8655d2',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  billingList: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },
  billingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  billingDetails: {
    flex: 1,
  },
  billingDescription: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
  },
  billingDate: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('0.5%'),
  },
  billingAmount: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#8655d2', // Red for debits
  },
  billingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  
  billingDetails: {
    flex: 1,
  },
  
  billingDescription: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  
  billingDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  
  billingAmount: {
    fontSize: 14,
    color: '#D32F2F',
    alignSelf: 'center',
  },
  
});

export default BillingHistoryScreen;