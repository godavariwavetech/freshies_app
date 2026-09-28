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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BillingHistoryScreen = ({ navigation }) => {
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalDebits: 0, totalCredits: 0 });
  const { customerId } = useSelector(state => state.Auth);
 const insets = useSafeAreaInsets();
  

  useEffect(() => {
    const fetchBillingHistory = async () => {
      setLoading(true);
      const data = await WalletAPI.getBillingHistory(customerId);
     
      setBillingHistory(data);
      
      // Calculate summary
      const summaryData = data.reduce((acc, item) => {
        if (item.payment_type_text === 'Debited') {
          acc.totalDebits += parseFloat(item.payment_amount);
        } else {
          acc.totalCredits += parseFloat(item.payment_amount);
        }
        return acc;
      }, { totalDebits: 0, totalCredits: 0 });
      
      setSummary(summaryData);
      setLoading(false);
    };

    fetchBillingHistory();
  }, []);

  const renderBillingItem = ({ item }) => {
    // Determine if it's a credit or debit based on payment_type_text
    const isDebit = item.payment_type_text === 'Debited';
    const amountColor = isDebit ? '#D32F2F' : '#4CAF50'; // Red for debit, Green for credit
    const amountPrefix = isDebit ? '- ₹' : '+ ₹';
    
    return (
      <View style={styles.billingItem}>
        <View style={styles.billingDetails}>
          <Text style={styles.billingDescription}>{item.description}</Text>
          <Text style={styles.billingDate}>{item.formatted_datetime}</Text>
          <Text style={styles.billingType}>Type: {item.payment_type_text}</Text>
        </View>
        <View style={styles.billingAmountContainer}>
          <Text style={[styles.billingAmount, { color: amountColor }]}>
            {amountPrefix}{parseFloat(item.payment_amount).toFixed(2)}
          </Text>
          {/* <Text style={styles.billingStatus}>
            {item.payment_status === 0 ? 'Pending' : 'Completed'}
          </Text> */}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#117943" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing History</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      {/* Summary Section */}
      {!loading && billingHistory.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Credits</Text>
            <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
              + ₹{summary.totalCredits.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Debits</Text>
            <Text style={[styles.summaryAmount, { color: '#D32F2F' }]}>
              - ₹{summary.totalDebits.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* List or Loading */}
      {loading ? (
        <ActivityIndicator size="large" color="#117943" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={billingHistory}
          renderItem={renderBillingItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.billingList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="receipt" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No billing history found</Text>
              <Text style={styles.emptySubText}>Your transaction history will appear here</Text>
            </View>
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
    backgroundColor: '#117943',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  billingDetails: {
    flex: 1,
    marginRight: 10,
  },
  billingDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  billingDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  billingType: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  billingAmountContainer: {
    alignItems: 'flex-end',
  },
  billingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  billingStatus: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default BillingHistoryScreen;