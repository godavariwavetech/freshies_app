import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  alert,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import RadioForm from 'react-native-simple-radio-button';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FocusAwareStatusBar from '../../../components/CustomStatusBar';
import { WalletAPI } from '../../../services/services';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import RazorpayCheckout from 'react-native-razorpay';
import { useDispatch, useSelector } from 'react-redux';
import { setWalletData } from '../../../redux/reducers/walletSlice';
import Clipboard from '@react-native-clipboard/clipboard';


const radioProps = [
  { label: 'Recharge Only Once', value: 'one-time' },
  { label: 'Recharge Automatically', value: 'auto' },
];

const autoRechargeOptions = [
  { label: '₹2000', value: 2000 },
  { label: '₹1500', value: 1500 },
  { label: '₹1000', value: 1000 },
];



const WalletPage = ({ navigation }) => {
  const [selectedAmount, setSelectedAmount] = useState("");
  const [rechargeOption, setRechargeOption] = useState('one-time');
  const [autoRechargeAmount, setAutoRechargeAmount] = useState(2000);
  const [selectedWallet, setSelectedWallet] = useState('User Wallet');
  const [amountOptions, setAmountOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletDataState] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const { customerId, mobileNumber, referralCode, username } = useSelector(state => state.Auth);
  const [transactions, setTransactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const dispatch = useDispatch();
  const [rechargeSuccessfull, setRechargeSuccessfull] = useState(false)
  console.log("customar ID", customerId, referralCode)

  useEffect(() => {
    const fetchAmounts = async () => {
      setLoading(true);
      const data = await WalletAPI.getDefaultWalletAmounts();

      const formatted = data.map(item => ({
        label: `₹${item.wallet_amount}`,
        value: parseInt(item.wallet_amount),
      }));
      console.log("eloo", formatted)
      setSelectedAmount(formatted[0].value)
      setAmountOptions(formatted);
      setLoading(false);
    };

    fetchAmounts();
  }, [rechargeSuccessfull]);

  useEffect(() => {
    const fetchWallet = async () => {
      setWalletLoading(true);
      const data = await WalletAPI.getWalletAmounts(customerId);
      console.log("walleter amounts", data)
      dispatch(setWalletData(data));

      setWalletDataState(data);
      setWalletLoading(false);
    };
    fetchWallet();
  }, [rechargeSuccessfull]);

  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);
      const data = await WalletAPI.getAbhi24WalletDetails(customerId);
      console.log("herlo", data)
      const formattedData = data.map((item) => ({
        id: item.id.toString(),
        type:
          item.payment_type_text === 'Credited'
            ? item.wallet_type === 1
              ? 'Cashback'
              : 'Referral'
            : 'Used',
        description: `${item.description || 'N/A'}`,
        date: item.formatted_datetime,
        amount:
          item.payment_type_text === 'Credited'
            ? `+₹${item.payment_amount}`
            : `-₹${item.payment_amount}`,
        icon:
          item.payment_type_text === 'Credited' ? 'arrow-downward' : 'arrow-upward',
        color:
          item.payment_type_text === 'Credited' ? '#00C853' : '#8655d2',
        payment_ind: item.payment_ind, // ✅ add this
      }));
      setTransactions(formattedData);
      setLoading(false);
    };

    fetchWalletData();
  }, [rechargeSuccessfull]);

  const handleWalletPress = (wallet) => {
    setSelectedWallet(wallet);
  };

  // Filter transactions based on selected filter
  const handleFilterPress = (filterType) => {
    setSelectedFilter(filterType);
  };

  const filteredTransactions =
    selectedFilter === 'All'
      ? transactions
      : selectedFilter === 'Referral'
        ? transactions.filter((item) => item.payment_ind === 1)
        : selectedFilter === 'Refund'
          ? transactions.filter((item) => item.payment_ind === 2)
          : transactions;


  const renderTransaction = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 10,
        marginVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EAEAEA', // soft border for subtle separation
      }}
    >
      {/* Left icon in circle */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#F1ECFC',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Icon name={item.icon} size={24} color="#8655d2" />
      </View>
      {/* Description + date */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '600', color: '#000' }}
          numberOfLines={2} // Limit to 2 lines
          ellipsizeMode="tail" // Default, shows ... at end
        >
          {item.description}
        </Text>
        <Text style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{item.date}</Text>
      </View>

      {/* Amount */}
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#00C853', marginLeft: 8 }}>
        {item.amount}
      </Text>
    </View>
  );


  const handleAddMoney = async (amount) => {
    try {
      setIsLoading(true);
      // Step 1: Create Razorpay Order
      const response = await WalletAPI.insertUserWalletAmount({
        user_id: customerId,
        payment_amount: amount,
      });
      if (response.status === 200) {
        const { razorpay_order_id, key_id, id } = response;
        // Step 2: Open Razorpay
        const options = {
          description: 'Add Money to Wallet',
          currency: 'INR',
          key: key_id,
          amount: amount * 100,
          name: 'Your App Name',
          order_id: razorpay_order_id,
          prefill: {
            email: 'user@example.com',
            contact: mobileNumber,
            name: username,
          },
          theme: { color: '#8655d2' },
        };
        RazorpayCheckout.open(options)
          .then(async (paymentResult) => {
            const updateRes = await WalletAPI.updateUserWalletAmount({
              id, // ID from insert response
              user_id: customerId,
              payment_id: paymentResult.razorpay_payment_id,
              payment_amount: amount,
            });

            if (updateRes.status === 200) {
              setRechargeSuccessfull((prev) => !prev)
              // Alert.alert('Success', 'Money added successfully!');
            } else {
              Alert.alert('Error', 'Payment verification failed.');
            }
            setIsLoading(false);
          }).catch((error) => {
            setIsLoading(false);

            let errorMessage = 'Transaction was not completed.';

            // Handle user cancel case explicitly
            if (error?.code === 0 || error?.description === 'The payment was cancelled') {
              console.log('User exited Razorpay payment screen.');
              return; // Don’t show alert for user cancel
            }

            // Handle API or Razorpay failures
            if (typeof error === 'object') {
              if (error.description) {
                errorMessage = error.description;
              } else if (error.error && error.error.description) {
                errorMessage = error.error.description;
              } else if (error.reason) {
                errorMessage = error.reason.replace(/_/g, ' ');
              }
            }

            console.error('Payment failed:', error);
            Alert.alert('Payment Failed', errorMessage);
          });
      } else {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to create payment order.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Add Money Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(referralCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={wp('6%')} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>
      </View>
      {/* Balance Section (Card) */}
      {selectedWallet === 'User Wallet' && walletData && parseFloat(walletData?.user_balance_amount || 0) <= 0 && (
        <View
          style={{
            backgroundColor: '#fff0f0',
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#D32F2F',
          }}
        >
          <Text
            style={{
              color: '#D32F2F',
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            You have no User Cash. If you want to subscribe to any product, please recharge your wallet.
          </Text>
        </View>
      )}

      <View style={styles.balanceContainer}>
        {/* Tabs */}

        <View style={styles.walletHeader}>
          <TouchableOpacity
            onPress={() => handleWalletPress('User Wallet')}
            style={styles.walletTab}
          >
            <Text
              style={
                selectedWallet === 'User Wallet'
                  ? [styles.sectionTitle, styles.sectionTitleSelected]
                  : styles.sectionTitle
              }
            >
              User Cash
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleWalletPress('Abhi24 Wallet')}
            style={styles.walletTab}
          >
            <Text
              style={
                selectedWallet === 'Abhi24 Wallet'
                  ? [styles.walletName, styles.sectionTitleSelected]
                  : styles.walletName
              }
            >
              Abhi24 Cash
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {walletLoading ? (
            '₹ --.--'
          ) : selectedWallet === 'User Wallet' ? (
            `₹${parseFloat(walletData?.user_balance_amount || 0).toFixed(2)}`
          ) : (
            `₹${parseFloat(walletData?.abhi24_balanced_amount || 0).toFixed(2)}`
          )}
        </Text>
        <Text style={styles.balanceSubText}>
          {selectedWallet === 'User Wallet'
            ? `Used: ₹${walletData?.user_used_amount || 0}`
            : `Used: ₹${walletData?.abhi24_used_amount || 0}`}
        </Text>

        {/* Actions */}
        <View style={styles.optionsContainer}>
          {selectedWallet === 'User Wallet' ? (
            <>
              <TouchableOpacity
                style={styles.option}
                onPress={() => navigation.navigate('RechargeHistoryScreen')}
              >
                <Icon name="arrow-upward" size={wp('5%')} color="#fff" />
                <Text style={styles.optionText}>Recharge History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => navigation.navigate('BillingHistory')}
              >
                <Icon name="arrow-downward" size={wp('5%')} color="#fff" />
                <Text style={styles.optionText}>Billing History</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              style={{
                flex: 1,                     // fills available space
                justifyContent: 'center',   // center vertically
                alignItems: 'center',       // center horizontally

              }}
            >
              <View
                style={{
                  width: '100%',               // full width within padded container
                  maxWidth: 320,               // optional: limit width on large screens
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#333',
                      fontSize: 14,
                      fontWeight: '600',
                      flex: 1,
                    }}
                  >
                    {referralCode || '--'}
                  </Text>

                  <TouchableOpacity onPress={copyToClipboard}>
                    <Icon name="content-copy" size={20} color="#8E44AD" />
                  </TouchableOpacity>
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    color: '#eee',
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                >
                  Share your code with friends. When they make their first payment, you’ll earn wallet cash!
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>


      {/* Add Money Section */}
      <View style={styles.addMoneyContainer}>
        {selectedWallet === 'User Wallet' ? (
          <>
            {/* Add Money Title */}
            <Text style={styles.addMoneyTitle}>Add Money</Text>
            {/* Input Field for Amount */}
            <TextInput
              style={styles.amountInput}
              placeholder="Enter Amount"
              keyboardType="numeric"
              value={selectedAmount ? selectedAmount.toString() : ''}
              onChangeText={(text) => {
                const numeric = parseInt(text);
                setSelectedAmount(isNaN(numeric) ? null : numeric);
              }}
            />
            {loading ? (
              <SkeletonPlaceholder>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  {[1, 2, 3].map((_, index) => (
                    <View key={index} style={{ width: 80, height: 40, borderRadius: 8 }} />
                  ))}
                </View>
              </SkeletonPlaceholder>
            ) : (
              <View style={styles.amountOptions}>
                {amountOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={
                      selectedAmount === option.value
                        ? [styles.amountButton, styles.amountButtonSelected]
                        : styles.amountButton
                    }
                    onPress={() => setSelectedAmount(option.value)}
                  >
                    <Text
                      style={
                        selectedAmount === option.value
                          ? [styles.amountText, styles.amountTextSelected]
                          : styles.amountText
                      }
                    >
                      +{option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* Add Money Button */}
            <TouchableOpacity
              style={[
                styles.addMoneyButton,
                {
                  backgroundColor:
                    selectedAmount > 0 && !isLoading ? '#8655d2' : '#ccc',
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={() => {
                if (selectedAmount > 0 && !isLoading) {
                  handleAddMoney(selectedAmount);
                }
              }}
              disabled={!selectedAmount || selectedAmount <= 0 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addMoneyButtonText}>ADD MONEY</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
              {['All', 'Referral', "Refund"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => handleFilterPress(filter)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: selectedFilter === filter ? '#8655d2' : '#eee',
                  }}
                >
                  <Text style={{ color: selectedFilter === filter ? '#fff' : '#444' }}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#8655d2" style={{ marginTop: 30 }} />
            ) : filteredTransactions.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#888', fontSize: 16 }}>
                  No {selectedFilter === 'All' ? 'transactions' : selectedFilter.toLowerCase()} found.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
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
    backgroundColor: '#8655d2', // instead of '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#8655d2',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginLeft: 15
  },
  balanceContainer: {
    backgroundColor: '#543d9c',
    borderRadius: 16,
    marginHorizontal: wp('4%'),
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
    marginTop: hp('2%'), // provide top margin to separate from header
  },
  amountInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  balanceLabel: {
    fontSize: wp('4%'),
    color: '#fff',
    opacity: 0.8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: hp('1%'),
  },
  walletTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },

  walletTabItem: {
    alignItems: 'center',
    flex: 1,
  },

  walletTabTitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },

  walletTabValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  skeletonButton: {
    borderWidth: 1,
    borderColor: '#8655d2',
    borderRadius: 8,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    flex: 1,
    alignItems: 'center',
    marginHorizontal: wp('1%'),
  },
  balanceSubText: {
    fontSize: wp('3.5%'),
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp('2%'),
  },
  option: {
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: wp('3.5%'),
    color: '#fff',
    marginTop: hp('1%'),
  },
  addMoneyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: wp('5%'),
    marginTop: hp('2%'),
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#543d9c',
    paddingBottom: hp('1.5%'),
    marginBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  walletTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('2%'),
    borderRadius: 30,
    marginHorizontal: wp('1%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    color: '#fff',
    fontWeight: '500',
  },
  sectionTitleSelected: {
    backgroundColor: '#fff',
    color: '#543d9c',
    fontWeight: 'bold',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 30,
  },
  walletName: {
    fontSize: wp('4%'),
    color: '#fff',
    fontWeight: '500',
  },
  addMoneyTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('1%'),
  },
  selectedAmount: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#000',
    marginVertical: hp('1%'),
  },
  amountOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp('2%'),
  },
  amountButton: {
    borderWidth: 1,
    borderColor: '#8655d2',
    borderRadius: 8,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    flex: 1,
    alignItems: 'center',
    marginHorizontal: wp('1%'),
  },
  amountButtonSelected: {
    backgroundColor: '#8655d2',
    borderColor: '#8655d2',
  },
  amountText: {
    fontSize: wp('4%'),
    color: '#8655d2',
    fontWeight: '500',
  },
  amountTextSelected: {
    color: '#fff',
  },
  radioForm: {
    marginVertical: hp('2%'),
  },
  radioLabel: {
    fontSize: wp('4%'),
    color: '#000',
    marginLeft: wp('2%'),
  },
  autoRechargeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  autoRechargeText: {
    fontSize: wp('4%'),
    color: '#000',
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: wp('30%'),
  },
  picker: {
    height: hp('7%'),
    color: '#000',
  },
  addMoneyButton: {
    backgroundColor: '#8655d2',
    borderRadius: 8,
    paddingVertical: hp('2%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  addMoneyButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#fff',
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: hp('2%'),
  },
  filterButton: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    marginRight: wp('2%'),
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterButtonSelected: {
    backgroundColor: '#8655d2',
  },
  filterText: {
    fontSize: wp('4%'),
    color: '#666',
    fontWeight: '500',
  },
  filterTextSelected: {
    color: '#fff',
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIconContainer: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  transactionIcon: {
    transform: [{ rotate: '45deg' }],
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
  },
  transactionDate: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('0.5%'),
  },
  transactionAmount: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
});

export default WalletPage;


