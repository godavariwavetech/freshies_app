import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const BillingHistoryScreen = ({ navigation }) => {
  // Mock billing history data
  const billingHistory = [
    { id: '1', date: '12 Apr 2025, 10:30 AM', amount: '-₹500.00', description: 'Payment for Order #1234' },
    { id: '2', date: '11 Apr 2025, 02:15 PM', amount: '-₹250.00', description: 'Payment for Order #1233' },
    { id: '3', date: '10 Apr 2025, 09:45 AM', amount: '-₹1000.00', description: 'Payment for Order #1232' },
    { id: '4', date: '09 Apr 2025, 11:20 AM', amount: '-₹300.00', description: 'Payment for Order #1231' },
  ];

  const renderBillingItem = ({ item }) => (
    <View style={styles.billingItem}>
      <View style={styles.billingDetails}>
        <Text style={styles.billingDescription}>{item.description}</Text>
        <Text style={styles.billingDate}>{item.date}</Text>
      </View>
      <Text style={styles.billingAmount}>{item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6A48D2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing History</Text>
        <View style={{ width: wp('6%') }} /> {/* Placeholder for symmetry */}
      </View>

      {/* Billing List */}
      <FlatList
        data={billingHistory}
        renderItem={renderBillingItem}
        keyExtractor={(item) => item.id}
        style={styles.billingList}
        showsVerticalScrollIndicator={false}
      />
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
    backgroundColor: '#6A48D2',
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
    color: '#6A48D2', // Red for debits
  },
});

export default BillingHistoryScreen;