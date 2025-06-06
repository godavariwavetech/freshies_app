// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
// } from 'react-native';
// import RadioForm from 'react-native-simple-radio-button';
// import { Picker } from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // For icons
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// const WalletPage = ({ navigation }) => {
//   const [selectedAmount, setSelectedAmount] = useState(1500);
//   const [rechargeOption, setRechargeOption] = useState('one-time');
//   const [autoRechargeAmount, setAutoRechargeAmount] = useState(2000);

//   const radioProps = [
//     { label: 'Recharge Only Once', value: 'one-time' },
//     { label: 'Recharge Automatically', value: 'auto' },
//   ];

//   const amountOptions = [
//     { label: '₹2000', value: 2000 },
//     { label: '₹1500', value: 1500 },
//     { label: '₹1000', value: 1000 },
//   ];

//   const autoRechargeOptions = [
//     { label: '₹2000', value: 2000 },
//     { label: '₹1500', value: 1500 },
//     { label: '₹1000', value: 1000 },
//   ];
//   const handleAmountPress = (amount) => {
//     setSelectedAmount(amount);
//   };
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#6A48D2" />

//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={wp('6%')} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Wallet</Text>
//         </View>
//       </View>

//       {/* Balance Section (Card) */}
//       <View style={styles.balanceContainer}>
//         <Text style={styles.balanceLabel}>Main balance</Text>
//         <Text style={styles.balanceAmount}>₹1000.00</Text>
//         <View style={styles.optionsContainer}>
//           <TouchableOpacity style={styles.option}>
//             <Icon name="arrow-upward" size={wp('5%')} color="#fff" />
//             <Text style={styles.optionText}>Recharge History</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.option}>
//             <Icon name="arrow-downward" size={wp('5%')} color="#fff" />
//             <Text style={styles.optionText}>Billing History</Text>
//           </TouchableOpacity>
//           {/* <TouchableOpacity style={styles.option}>
//             <Icon name="autorenew" size={wp('5%')} color="#fff" />
//             <Text style={styles.optionText}>View Auto Recharge</Text>
//           </TouchableOpacity> */}
//         </View>
//       </View>

//       {/* Add Money Section */}
//       <View style={styles.addMoneyContainer}>
//         {/* Wallet Header */}
//         <View style={styles.walletHeader}>
//           <Text style={styles.sectionTitle}>User Wallet</Text>
//           <Text style={styles.walletName}>Abhi24 Wallet</Text>
//         </View>

//         {/* Add Money Title */}
//         <Text style={styles.addMoneyTitle}>Add Money</Text>

//         {/* Selected Amount Field */}
//         <Text style={styles.selectedAmount}>₹{selectedAmount}</Text>

//         {/* Amount Options */}
//         <View style={styles.amountOptions}>
//           {amountOptions.map((option) => (
//             <TouchableOpacity
//               key={option.value}
//               style={[
//                 styles.amountButton,
//                 selectedAmount === option.value && styles.amountButtonSelected,
//               ]}
//               onPress={() => handleAmountPress(option.value)}
//             >
//               <Text
//                 style={[
//                   styles.amountText,
//                   selectedAmount === option.value && styles.amountTextSelected,
//                 ]}
//               >
//                 +{option.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Recharge Options */}
//         {/* <RadioForm
//           radio_props={radioProps}
//           initial={0}
//           onPress={(value) => setRechargeOption(value)}
//           formHorizontal={false}
//           labelStyle={styles.radioLabel}
//           buttonColor="#6A48D2"
//           selectedButtonColor="#6A48D2"
//           buttonSize={wp('4%')}
//           buttonOuterSize={wp('6%')}
//           style={styles.radioForm}
//         /> */}

//         {/* Auto Recharge Picker */}
//         {/* {rechargeOption === 'auto' && (
//           <View style={styles.autoRechargeContainer}>
//             <Text style={styles.autoRechargeText}>
//               Every time wallet goes below
//             </Text>
//             <View style={styles.pickerContainer}>
//               <Picker
//                 selectedValue={autoRechargeAmount}
//                 onValueChange={(itemValue) => setAutoRechargeAmount(itemValue)}
//                 style={styles.picker}
//               >
//                 {autoRechargeOptions.map((option) => (
//                   <Picker.Item
//                     key={option.value}
//                     label={option.label}
//                     value={option.value}
//                   />
//                 ))}
//               </Picker>
//             </View>
//           </View>

//         )} */}
//         {/* Add Money Button */}
//         <TouchableOpacity style={styles.addMoneyButton}>
//           <Text style={styles.addMoneyButtonText}>ADD MONEY</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: wp('4%'),
//     paddingVertical: hp('20%'),
//     backgroundColor: '#6A48D2',
//     position:"relative"
//   },
//   headerTitle: {
//     fontSize: wp('5%'),
//     fontWeight: 'bold',
//     color: '#fff',
//     // alignItems:"center",
//     alignSelf:"center",
//     justifyContent:"center",
//     textAlign:"center",
//     // backgroundColor:"pink",
//     marginRight:"45%"
//   },
//   balanceContainer: {
//     backgroundColor: '#962121',
//     borderRadius: 15,
//     marginHorizontal: wp('4%'),
//     padding: wp('5%'),
//     alignItems: 'center',
//     marginTop: -hp('2%'), // Overlap with header
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     position:"absolute",
//     top:100,
//     zIndex:1000
//   },
//   balanceLabel: {
//     fontSize: wp('4%'),
//     color: '#fff',
//     opacity: 0.8,
//     fontWeight: '500',
//   },
//   balanceAmount: {
//     fontSize: wp('8%'),
//     fontWeight: 'bold',
//     color: '#fff',
//     marginVertical: hp('1%'),
//   },
//   optionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginTop: hp('2%'),
//   },
//   option: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   optionText: {
//     fontSize: wp('3.5%'),
//     color: '#fff',
//     marginTop: hp('1%'),
//   },
//   addMoneyContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: wp('5%'),
//     marginTop: hp('2%'),
//   },
//   walletHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: hp('2%'),
//   },
//   sectionTitle: {
//     fontSize: wp('4.5%'),
//     fontWeight: 'bold',
//     color: '#6A48D2',
//   },
//   walletName: {
//     fontSize: wp('4.5%'),
//     color: '#666',
//   },
//   addMoneyTitle: {
//     fontSize: wp('5%'),
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: hp('1%'),
//   },
//   selectedAmount: {
//     fontSize: wp('6%'),
//     fontWeight: 'bold',
//     color: '#000',
//     marginVertical: hp('1%'),
//   },
//   amountOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: hp('2%'),
//   },
//   amountButton: {
//     borderWidth: 1,
//     borderColor: '#6A48D2',
//     borderRadius: 8,
//     paddingVertical: hp('1.5%'),
//     paddingHorizontal: wp('4%'),
//     flex: 1,
//     alignItems: 'center',
//     marginHorizontal: wp('1%'),
//   },
//   amountButtonSelected: {
//     backgroundColor: '#6A48D2',
//     borderColor: '#6A48D2',
//   },
//   amountText: {
//     fontSize: wp('4%'),
//     color: '#6A48D2',
//     fontWeight: '500',
//   },
//   amountTextSelected: {
//     color: '#fff',
//   },
//   radioForm: {
//     marginVertical: hp('2%'),
//   },
//   radioLabel: {
//     fontSize: wp('4%'),
//     color: '#000',
//     marginLeft: wp('2%'),
//   },
//   autoRechargeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: hp('1%'),
//   },
//   autoRechargeText: {
//     fontSize: wp('4%'),
//     color: '#000',
//     flex: 1,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     width: wp('30%'),
//   },
//   picker: {
//     height: hp('7%'),
//     color: '#000',
//   },
//   addMoneyButton: {
//     backgroundColor: '#6A48D2',
//     borderRadius: 8,
//     paddingVertical: hp('2%'),
//     alignItems: 'center',
//     marginTop: hp('2%'),
//   },
//   addMoneyButtonText: {
//     fontSize: wp('4.5%'),
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   headerContent:{
//     position:"absolute",
//     top:10,
//     left:20,
//     right:20,
//     zIndex:1000,
//     // display:"flex",
//     // flex:1,
//     // alignItems:"center",
//     justifyContent:"space-between",
//     flexDirection:"row",
//     // backgroundColor:"pink"
//   }
// });

// export default WalletPage;
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   FlatList,
// } from 'react-native';
// import RadioForm from 'react-native-simple-radio-button';
// import { Picker } from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// const WalletPage = ({ navigation }) => {
//   const [selectedAmount, setSelectedAmount] = useState(1500);
//   const [rechargeOption, setRechargeOption] = useState('one-time');
//   const [autoRechargeAmount, setAutoRechargeAmount] = useState(2000);
//   const [selectedWallet, setSelectedWallet] = useState('User Wallet');
//   const [selectedFilter, setSelectedFilter] = useState('All');

//   // Mock transaction data
//   const transactions = [
//     { id: '1', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
//     { id: '2', type: 'Referral', description: 'Referral Bonus - Ram referred', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
//     { id: '3', type: 'Used', description: 'Used in Order #1235', date: '12 Apr 2025', amount: '-₹10.00', icon: 'arrow-upward', color: '#6A48D2' },
//     { id: '4', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
//     { id: '5', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
//     { id: '6', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
//   ];

//   const radioProps = [
//     { label: 'Recharge Only Once', value: 'one-time' },
//     { label: 'Recharge Automatically', value: 'auto' },
//   ];

//   const amountOptions = [
//     { label: '₹2000', value: 2000 },
//     { label: '₹1500', value: 1500 },
//     { label: '₹1000', value: 1000 },
//   ];

//   const autoRechargeOptions = [
//     { label: '₹2000', value: 2000 },
//     { label: '₹1500', value: 1500 },
//     { label: '₹1000', value: 1000 },
//   ];

//   const handleAmountPress = (amount) => {
//     setSelectedAmount(amount);
//   };

//   const handleWalletPress = (wallet) => {
//     setSelectedWallet(wallet);
//   };

//   const handleFilterPress = (filter) => {
//     setSelectedFilter(filter);
//   };

//   // Filter transactions based on selected filter
//   const filteredTransactions = selectedFilter === 'All'
//     ? transactions
//     : transactions.filter((transaction) => transaction.type === selectedFilter);

//   const renderTransaction = ({ item }) => (
//     <View style={styles.transactionItem}>
//       <View style={styles.transactionIconContainer}>
//         <Icon
//           name={item.icon}
//           size={wp('5%')}
//           color={item.color}
//           style={styles.transactionIcon}
//         />
//       </View>
//       <View style={styles.transactionDetails}>
//         <Text style={styles.transactionDescription}>{item.description}</Text>
//         <Text style={styles.transactionDate}>{item.date}</Text>
//       </View>
//       <Text style={[styles.transactionAmount, { color: item.color }]}>{item.amount}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#6A48D2" />

//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={wp('6%')} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Wallet</Text>
//         </View>
//       </View>

//       {/* Balance Section (Card) */}
//       <View style={styles.balanceContainer}>
//         <Text style={styles.balanceLabel}>
//           {selectedWallet === 'User Wallet' ? 'Main balance' : 'Total Wallet Balance'}
//         </Text>
//         <Text style={styles.balanceAmount}>
//           {selectedWallet === 'User Wallet' ? '₹1000.00' : '₹12,450.75'}
//         </Text>
//         {selectedWallet === 'User Wallet' ? (
//           <View style={styles.optionsContainer}>
//             <TouchableOpacity
//               style={styles.option}
//               onPress={() => navigation.navigate('RechargeHistoryScreen')}
//             >
//               <Icon name="arrow-upward" size={wp('5%')} color="#fff" />
//               <Text style={styles.optionText}>Recharge History</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.option}
//               onPress={() => navigation.navigate('BillingHistory')}
//             >
//               <Icon name="arrow-downward" size={wp('5%')} color="#fff" />
//               <Text style={styles.optionText}>Billing History</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <Text style={styles.balanceSubText}>Available to use on your orders</Text>
//         )}
//       </View>
//       {/* Add Money Section */}
//       <View style={styles.addMoneyContainer}>
//         {/* Wallet Header */}
//         <View style={styles.walletHeader}>
//           <TouchableOpacity
//             onPress={() => handleWalletPress('User Wallet')}
//             style={styles.walletTab}
//           >
//             <Text
//               style={
//                 selectedWallet === 'User Wallet'
//                   ? [styles.sectionTitle, styles.sectionTitleSelected]
//                   : styles.sectionTitle
//               }
//             >
//               User Wallet
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => handleWalletPress('Abhi24 Wallet')}
//             style={styles.walletTab}
//           >
//             <Text
//               style={
//                 selectedWallet === 'Abhi24 Wallet'
//                   ? [styles.walletName, styles.sectionTitleSelected]
//                   : styles.walletName
//               }
//             >
//               Abhi24 Wallet
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {selectedWallet === 'User Wallet' ? (
//           <>
//             {/* Add Money Title */}
//             <Text style={styles.addMoneyTitle}>Add Money</Text>

//             {/* Selected Amount Field */}
//             <Text style={styles.selectedAmount}>₹{selectedAmount}</Text>

//             {/* Amount Options */}
//             <View style={styles.amountOptions}>
//               {amountOptions.map((option) => (
//                 <TouchableOpacity
//                   key={option.value}
//                   style={
//                     selectedAmount === option.value
//                       ? [styles.amountButton, styles.amountButtonSelected]
//                       : styles.amountButton
//                   }
//                   onPress={() => handleAmountPress(option.value)}
//                 >
//                   <Text
//                     style={
//                       selectedAmount === option.value
//                         ? [styles.amountText, styles.amountTextSelected]
//                         : styles.amountText
//                     }
//                   >
//                     +{option.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             {/* Recharge Options */}
//             {/* <RadioForm
//               radio_props={radioProps}
//               initial={0}
//               onPress={(value) => setRechargeOption(value)}
//               formHorizontal={false}
//               labelStyle={styles.radioLabel}
//               buttonColor="#6A48D2"
//               selectedButtonColor="#6A48D2"
//               buttonSize={wp('4%')}
//               buttonOuterSize={wp('6%')}
//               style={styles.radioForm}
//             /> */}

//             {/* Auto Recharge Picker */}
//             {rechargeOption === 'auto' && (
//               <View style={styles.autoRechargeContainer}>
//                 <Text style={styles.autoRechargeText}>
//                   Every time wallet goes below
//                 </Text>
//                 <View style={styles.pickerContainer}>
//                   <Picker
//                     selectedValue={autoRechargeAmount}
//                     onValueChange={(itemValue) => setAutoRechargeAmount(itemValue)}
//                     style={styles.picker}
//                   >
//                     {autoRechargeOptions.map((option) => (
//                       <Picker.Item
//                         key={String(option.value)}
//                         label={option.label}
//                         value={option.value}
//                       />
//                     ))}
//                   </Picker>
//                 </View>
//               </View>
//             )}

//             {/* Add Money Button */}
//             <TouchableOpacity style={styles.addMoneyButton}>
//               <Text style={styles.addMoneyButtonText}>ADD MONEY</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {/* Filter Tabs */}
//             <View style={styles.filterContainer}>
//               <TouchableOpacity
//                 style={
//                   selectedFilter === 'All'
//                     ? [styles.filterButton, styles.filterButtonSelected]
//                     : styles.filterButton
//                 }
//                 onPress={() => handleFilterPress('All')}
//               >
//                 <Text
//                   style={
//                     selectedFilter === 'All'
//                       ? [styles.filterText, styles.filterTextSelected]
//                       : styles.filterText
//                   }
//                 >
//                   All
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={
//                   selectedFilter === 'Cashback'
//                     ? [styles.filterButton, styles.filterButtonSelected]
//                     : styles.filterButton
//                 }
//                 onPress={() => handleFilterPress('Cashback')}
//               >
//                 <Text
//                   style={
//                     selectedFilter === 'Cashback'
//                       ? [styles.filterText, styles.filterTextSelected]
//                       : styles.filterText
//                   }
//                 >
//                   Cashback
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={
//                   selectedFilter === 'Referral'
//                     ? [styles.filterButton, styles.filterButtonSelected]
//                     : styles.filterButton
//                 }
//                 onPress={() => handleFilterPress('Referral')}
//               >
//                 <Text
//                   style={
//                     selectedFilter === 'Referral'
//                       ? [styles.filterText, styles.filterTextSelected]
//                       : styles.filterText
//                   }
//                 >
//                   Referral
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Transaction List */}
//             <FlatList
//               data={filteredTransactions}
//               renderItem={renderTransaction}
//               keyExtractor={(item) => item.id}
//               style={styles.transactionList}
//               showsVerticalScrollIndicator={false}
//             />
//           </>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: wp('4%'),
//     paddingVertical: hp('20%'),
//     backgroundColor: '#6A48D2',
//     position: 'relative',
//   },
//   headerTitle: {
//     fontSize: wp('5%'),
//     fontWeight: 'bold',
//     color: '#fff',
//     alignSelf: 'center',
//     justifyContent: 'center',
//     textAlign: 'center',
//     marginRight: '45%',
//   },
//   balanceContainer: {
//     backgroundColor: '#962121',
//     borderRadius: 15,
//     marginHorizontal: wp('4%'),
//     padding: wp('5%'),
//     alignItems: 'center',
//     marginTop: -hp('2%'),
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     position: 'absolute',
//     top: 100,
//     zIndex: 1000,
//   },
//   balanceLabel: {
//     fontSize: wp('4%'),
//     color: '#fff',
//     opacity: 0.8,
//     fontWeight: '500',
//   },
//   balanceAmount: {
//     fontSize: wp('8%'),
//     fontWeight: 'bold',
//     color: '#fff',
//     marginVertical: hp('1%'),
//   },
//   balanceSubText: {
//     fontSize: wp('3.5%'),
//     color: '#fff',
//     opacity: 0.8,
//     textAlign: 'center',
//   },
//   optionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginTop: hp('2%'),
//   },
//   option: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   optionText: {
//     fontSize: wp('3.5%'),
//     color: '#fff',
//     marginTop: hp('1%'),
//   },
//   addMoneyContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: wp('5%'),
//     marginTop: hp('2%'),
//   },
//   walletHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: hp('2%'),
//   },
//   walletTab: {
//     paddingVertical: hp('1%'),
//     paddingHorizontal: wp('4%'),
//   },
//   sectionTitle: {
//     fontSize: wp('4.5%'),
//     fontWeight: 'bold',
//     color: '#6A48D2',
//   },
//   sectionTitleSelected: {
//     color: '#6A48D2',
//     borderBottomWidth: 2,
//     borderBottomColor: '#6A48D2',
//   },
//   walletName: {
//     fontSize: wp('4.5%'),
//     color: '#666',
//   },
//   addMoneyTitle: {
//     fontSize: wp('5%'),
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: hp('1%'),
//   },
//   selectedAmount: {
//     fontSize: wp('6%'),
//     fontWeight: 'bold',
//     color: '#000',
//     marginVertical: hp('1%'),
//   },
//   amountOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: hp('2%'),
//   },
//   amountButton: {
//     borderWidth: 1,
//     borderColor: '#6A48D2',
//     borderRadius: 8,
//     paddingVertical: hp('1.5%'),
//     paddingHorizontal: wp('4%'),
//     flex: 1,
//     alignItems: 'center',
//     marginHorizontal: wp('1%'),
//   },
//   amountButtonSelected: {
//     backgroundColor: '#6A48D2',
//     borderColor: '#6A48D2',
//   },
//   amountText: {
//     fontSize: wp('4%'),
//     color: '#6A48D2',
//     fontWeight: '500',
//   },
//   amountTextSelected: {
//     color: '#fff',
//   },
//   radioForm: {
//     marginVertical: hp('2%'),
//   },
//   radioLabel: {
//     fontSize: wp('4%'),
//     color: '#000',
//     marginLeft: wp('2%'),
//   },
//   autoRechargeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: hp('1%'),
//   },
//   autoRechargeText: {
//     fontSize: wp('4%'),
//     color: '#000',
//     flex: 1,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     width: wp('30%'),
//   },
//   picker: {
//     height: hp('7%'),
//     color: '#000',
//   },
//   addMoneyButton: {
//     backgroundColor: '#6A48D2',
//     borderRadius: 8,
//     paddingVertical: hp('2%'),
//     alignItems: 'center',
//     marginTop: hp('2%'),
//   },
//   addMoneyButtonText: {
//     fontSize: wp('4.5%'),
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   headerContent: {
//     position: 'absolute',
//     top: 10,
//     left: 20,
//     right: 20,
//     zIndex: 1000,
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//   },
//   filterContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     marginBottom: hp('2%'),
//   },
//   filterButton: {
//     paddingVertical: hp('1%'),
//     paddingHorizontal: wp('4%'),
//     marginRight: wp('2%'),
//     borderRadius: 20,
//     backgroundColor: '#F5F5F5',
//   },
//   filterButtonSelected: {
//     backgroundColor: '#6A48D2',
//   },
//   filterText: {
//     fontSize: wp('4%'),
//     color: '#666',
//     fontWeight: '500',
//   },
//   filterTextSelected: {
//     color: '#fff',
//   },
//   transactionList: {
//     flex: 1,
//   },
//   transactionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: hp('2%'),
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   transactionIconContainer: {
//     width: wp('8%'),
//     height: wp('8%'),
//     borderRadius: wp('4%'),
//     backgroundColor: '#F5F5F5',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: wp('3%'),
//   },
//   transactionIcon: {
//     transform: [{ rotate: '45deg' }],
//   },
//   transactionDetails: {
//     flex: 1,
//   },
//   transactionDescription: {
//     fontSize: wp('4%'),
//     fontWeight: '500',
//     color: '#000',
//   },
//   transactionDate: {
//     fontSize: wp('3.5%'),
//     color: '#666',
//     marginTop: hp('0.5%'),
//   },
//   transactionAmount: {
//     fontSize: wp('4%'),
//     fontWeight: 'bold',
//   },
// });

// export default WalletPage;
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import RadioForm from 'react-native-simple-radio-button';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const WalletPage = ({ navigation }) => {
  const [selectedAmount, setSelectedAmount] = useState(1500);
  const [rechargeOption, setRechargeOption] = useState('one-time');
  const [autoRechargeAmount, setAutoRechargeAmount] = useState(2000);
  const [selectedWallet, setSelectedWallet] = useState('User Wallet');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Mock transaction data
  const transactions = [
    { id: '1', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
    { id: '2', type: 'Referral', description: 'Referral Bonus - Ram referred', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
    { id: '3', type: 'Used', description: 'Used in Order #1235', date: '12 Apr 2025', amount: '-₹10.00', icon: 'arrow-upward', color: '#6A48D2' },
    { id: '4', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
    { id: '5', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
    { id: '6', type: 'Cashback', description: 'Cashback on Order #1234', date: '12 Apr 2025', amount: '+₹25.00', icon: 'arrow-downward', color: '#00C853' },
  ];

  const radioProps = [
    { label: 'Recharge Only Once', value: 'one-time' },
    { label: 'Recharge Automatically', value: 'auto' },
  ];

  const amountOptions = [
    { label: '₹2000', value: 2000 },
    { label: '₹1500', value: 1500 },
    { label: '₹1000', value: 1000 },
  ];

  const autoRechargeOptions = [
    { label: '₹2000', value: 2000 },
    { label: '₹1500', value: 1500 },
    { label: '₹1000', value: 1000 },
  ];

  const handleAmountPress = (amount) => {
    setSelectedAmount(amount);
  };

  const handleWalletPress = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  // Filter transactions based on selected filter
  const filteredTransactions = selectedFilter === 'All'
    ? transactions
    : transactions.filter((transaction) => transaction.type === selectedFilter);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIconContainer}>
        <Icon
          name={item.icon}
          size={wp('5%')}
          color={item.color}
          style={styles.transactionIcon}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.color }]}>{item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6A48D2" />

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
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Main balance</Text>
        <Text style={styles.balanceAmount}>₹1000.00</Text>
        <View style={styles.optionsContainer}>
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
        </View>
      </View>

      {/* Add Money Section */}
      <View style={styles.addMoneyContainer}>
        {/* Wallet Header */}
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
              User Wallet
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
              Abhi24 Wallet
            </Text>
          </TouchableOpacity>
        </View>

        {selectedWallet === 'User Wallet' ? (
          <>
            {/* Add Money Title */}
            <Text style={styles.addMoneyTitle}>Add Money</Text>

            {/* Selected Amount Field */}
            <Text style={styles.selectedAmount}>₹{selectedAmount}</Text>

            {/* Amount Options */}
            <View style={styles.amountOptions}>
              {amountOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={
                    selectedAmount === option.value
                      ? [styles.amountButton, styles.amountButtonSelected]
                      : styles.amountButton
                  }
                  onPress={() => handleAmountPress(option.value)}
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

            {/* Recharge Options */}
            {/* <RadioForm
              radio_props={radioProps}
              initial={0}
              onPress={(value) => setRechargeOption(value)}
              formHorizontal={false}
              labelStyle={styles.radioLabel}
              buttonColor="#6A48D2"
              selectedButtonColor="#6A48D2"
              buttonSize={wp('4%')}
              buttonOuterSize={wp('6%')}
              style={styles.radioForm}
            /> */}

            {/* Auto Recharge Picker */}
            {rechargeOption === 'auto' && (
              <View style={styles.autoRechargeContainer}>
                <Text style={styles.autoRechargeText}>
                  Every time wallet goes below
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={autoRechargeAmount}
                    onValueChange={(itemValue) => setAutoRechargeAmount(itemValue)}
                    style={styles.picker}
                  >
                    {autoRechargeOptions.map((option) => (
                      <Picker.Item
                        key={String(option.value)}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Add Money Button */}
            <TouchableOpacity style={styles.addMoneyButton}>
              <Text style={styles.addMoneyButtonText}>ADD MONEY</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={
                  selectedFilter === 'All'
                    ? [styles.filterButton, styles.filterButtonSelected]
                    : styles.filterButton
                }
                onPress={() => handleFilterPress('All')}
              >
                <Text
                  style={
                    selectedFilter === 'All'
                      ? [styles.filterText, styles.filterTextSelected]
                      : styles.filterText
                  }
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  selectedFilter === 'Cashback'
                    ? [styles.filterButton, styles.filterButtonSelected]
                    : styles.filterButton
                }
                onPress={() => handleFilterPress('Cashback')}
              >
                <Text
                  style={
                    selectedFilter === 'Cashback'
                      ? [styles.filterText, styles.filterTextSelected]
                      : styles.filterText
                  }
                >
                  Cashback
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  selectedFilter === 'Referral'
                    ? [styles.filterButton, styles.filterButtonSelected]
                    : styles.filterButton
                }
                onPress={() => handleFilterPress('Referral')}
              >
                <Text
                  style={
                    selectedFilter === 'Referral'
                      ? [styles.filterText, styles.filterTextSelected]
                      : styles.filterText
                  }
                >
                  Referral
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transaction List */}
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              style={styles.transactionList}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('20%'),
    backgroundColor: '#6A48D2',
    position: 'relative',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginRight: '45%',
  },
  balanceContainer: {
    backgroundColor: '#4B3395',
    borderRadius: 15,
    marginHorizontal: wp('4%'),
    padding: wp('5%'),
    alignItems: 'center',
    marginTop: -hp('2%'),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'absolute',
    top: 100,
    zIndex: 1000,
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
    justifyContent: 'space-around',
    marginBottom: hp('2%'),
  },
  walletTab: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#6A48D2',
  },
  sectionTitleSelected: {
    color: '#6A48D2',
    borderBottomWidth: 2,
    borderBottomColor: '#6A48D2',
  },
  walletName: {
    fontSize: wp('4.5%'),
    color: '#666',
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
    borderColor: '#6A48D2',
    borderRadius: 8,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    flex: 1,
    alignItems: 'center',
    marginHorizontal: wp('1%'),
  },
  amountButtonSelected: {
    backgroundColor: '#6A48D2',
    borderColor: '#6A48D2',
  },
  amountText: {
    fontSize: wp('4%'),
    color: '#6A48D2',
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
    backgroundColor: '#6A48D2',
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
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    zIndex: 1000,
    justifyContent: 'space-between',
    flexDirection: 'row',
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
    backgroundColor: '#6A48D2',
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