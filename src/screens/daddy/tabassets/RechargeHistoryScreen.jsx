import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Sample transaction data
const transactions = [
  {
    id: 'TXN2025041811041',
    amount: '₹500.00',
    method: 'Wallet Recharge via UPI',
    status: 'Success',
    date: '18 Apr 2025, 11:04 AM',
  },
  {
    id: 'TXN2025041811042',
    amount: '₹500.00',
    method: 'Wallet Recharge via Card',
    status: 'Failed',
    date: '18 Apr 2025, 11:04 AM',
  },
  {
    id: 'TXN2025041811043',
    amount: '₹500.00',
    method: 'Wallet Recharge via Net Banking',
    status: 'Pending',
    date: '18 Apr 2025, 11:04 AM',
  },
];

const RechargeHistoryScreen = ({ navigation }) => {
  const renderTransaction = ({ item }) => {
    // Determine status button style and border color
    let statusStyle, borderColor;
    switch (item.status) {
      case 'Success':
        statusStyle = styles.successButton;
        borderColor = '#4CAF50';
        break;
      case 'Failed':
        statusStyle = styles.failedButton;
        borderColor = '#6A48D2';
        break;
      case 'Pending':
        statusStyle = styles.pendingButton;
        borderColor = '#FFA000';
        break;
      default:
        statusStyle = styles.successButton;
        borderColor = '#4CAF50';
    }

    return (
      <View style={[styles.transactionItem, { borderColor, borderWidth: 0.5 }]}>
        <View style={styles.transactionDetails}>
          <Text style={styles.amount}>{item.amount}</Text>
          <Text style={styles.method}>{item.method}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.transactionId}>Txn ID: #{item.id}</Text>
        </View>
        <TouchableOpacity style={[styles.statusButton, statusStyle]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6A48D2" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharge History</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Transaction ID"
            placeholderTextColor="#999"
          />
          <Icon name="search" size={wp('5%')} color="#999" style={styles.searchIcon} />
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <Icon name="calendar-today" size={wp('5%')} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
    backgroundColor: '#6A48D2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    paddingTop: hp('6%'), // Adjust for status bar
  },
  headerTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: wp('5%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: wp('6%'), // Match the size of the back button for alignment
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('4%'),
    marginVertical: hp('2%'),
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: wp('3%'),
    paddingLeft: wp('10%'),
    fontSize: wp('4%'),
    color: '#000',
  },
  searchIcon: {
    position: 'absolute',
    left: wp('3%'),
    top: hp('1.5%'),
  },
  calendarButton: {
    backgroundColor: '#6A48D2',
    borderRadius: 8,
    padding: wp('3%'),
    marginLeft: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: wp('4%'),
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },
  transactionDetails: {
    flex: 1,
  },
  amount: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
  },
  method: {
    fontSize: wp('3.5%'),
    color: '#000',
    marginTop: hp('0.5%'),
  },
  date: {
    fontSize: wp('3%'),
    color: '#666',
    marginTop: hp('0.5%'),
  },
  transactionId: {
    fontSize: wp('3%'),
    color: '#666',
    marginTop: hp('0.5%'),
  },
  statusButton: {
    borderRadius: 20,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    alignSelf: 'flex-start',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  failedButton: {
    backgroundColor: '#6A48D2',
  },
  pendingButton: {
    backgroundColor: '#FFA000',
  },
  statusText: {
    color: '#FFF',
    fontSize: wp('3%'),
    fontWeight: 'bold',
  },
});

export default RechargeHistoryScreen;