import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FocusAwareStatusBar from '../../../components/CustomStatusBar';
import { WalletAPI } from '../../../services/services';
import { useSelector } from 'react-redux';
import DateTimePickerModal from 'react-native-modal-datetime-picker';



const RechargeHistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { customerId } = useSelector(state => state.Auth);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isFromPickerVisible, setFromPickerVisible] = useState(false);
  const [isToPickerVisible, setToPickerVisible] = useState(false);



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await WalletAPI.getRechargeHistory(customerId);
      
      setTransactions(data);
      setLoading(false);
    };
    fetchData();
  }, []);


  const handleFromConfirm = (date) => {
    setFromDate(date);
    setFromPickerVisible(false);
  };

  const handleToConfirm = (date) => {
    setToDate(date);
    setToPickerVisible(false);
  };

  const formatDateLabel = (date) => {
    return date ? new Date(date).toLocaleDateString('en-GB') : 'Select';
  };

  const filteredTransactions = transactions.filter((item) => {
    const txnDate = new Date(item.i_ts);

    const matchSearch = item.razorpay_order_id
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchFrom = fromDate ? txnDate >= new Date(fromDate) : true;
    const matchTo = toDate ? txnDate <= new Date(toDate) : true;

    return matchSearch && matchFrom && matchTo;
  });


  const renderTransaction = ({ item }) => {
    let statusStyle, borderColor;
    const statusText = item.payment_status_text;

    switch (statusText.toLowerCase()) {
      case 'success':
        statusStyle = styles.successButton;
        borderColor = '#4CAF50';
        break;
      case 'failed':
        statusStyle = styles.failedButton;
        borderColor = '#8655d2';
        break;
      case 'pending':
      default:
        statusStyle = styles.pendingButton;
        borderColor = '#FFA000';
    }

    return (
      <View style={[styles.transactionItem, { borderColor, borderWidth: 0.5 }]}>
        <View style={styles.transactionDetails}>
          <Text style={styles.amount}>₹{item.payment_amount}</Text>
          <Text style={styles.method}>Wallet Recharge via Razorpay</Text>
          <Text style={styles.date}>{item.formatted_datetime}</Text>
          <Text style={styles.transactionId}>Txn ID: #{item.razorpay_order_id}</Text>
        </View>
        <TouchableOpacity style={[styles.statusButton, statusStyle]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />

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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={wp('5%')} color="#999" style={styles.searchIcon} />
        </View>
      </View>

      <View style={styles.dateFilterContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setFromPickerVisible(true)}
          >
            <Text style={styles.dateButtonText}>From: {formatDateLabel(fromDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setToPickerVisible(true)}
          >
            <Text style={styles.dateButtonText}>To: {formatDateLabel(toDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        <DateTimePickerModal
          isVisible={isFromPickerVisible}
          mode="date"
          onConfirm={handleFromConfirm}
          onCancel={() => setFromPickerVisible(false)}
          maximumDate={new Date()}
        />
        <DateTimePickerModal
          isVisible={isToPickerVisible}
          mode="date"
          onConfirm={handleToConfirm}
          onCancel={() => setToPickerVisible(false)}
          minimumDate={fromDate || undefined}
          maximumDate={new Date()}
        />

      {/* List or Loader */}
      {loading ? (
        <ActivityIndicator size="large" color="#8655d2" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
              No transactions found
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
    backgroundColor: '#8655d2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
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
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 10,
  },

  dateButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  dateButtonText: {
    fontSize: 14,
    color: '#333',
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
    backgroundColor: '#8655d2',
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
    backgroundColor: '#8655d2',
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