import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Modal
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { RefreshControl } from 'react-native-gesture-handler';
import { useSelector, dispatch, useDispatch } from 'react-redux';
import { setLocation, setLocationId, setLocationName, setShopAddress } from '../../../redux/reducers/auth';
import { checkAddressExistence, placeSubscriptionOrder } from '../../../services/services';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const EditSubscriptionScreen = ({ navigation, route }) => {
  const { productDetails } = route.params;
  const insets = useSafeAreaInsets();
  const today = dayjs().format('YYYY-MM-DD');
  const [scheduleType, setScheduleType] = useState('Custom');
  const [startDate, setStartDate] = useState(dayjs().add(1, 'day').toDate());
  const [quantity, setQuantity] = useState(1);
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const walletBalance = useSelector((state) => state.wallet.amount); // assuming you store wallet balance in redux
  const { location: storedLocation, locationName, locationId, address, customerId, mobileNumber, shopAddress } = useSelector(state => state.Auth);
  const dispatch = useDispatch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [calendarKey, setCalendarKey] = useState(0);


  useEffect(() => {
    if (startDate) {
      updateMarkedDates(scheduleType, startDate);
    }
  }, [scheduleType, startDate]);

  const updateMarkedDates = (type, startDate) => {
    const newMarks = {};
    const start = dayjs(startDate);
    let firstSelectedDate = null;

    if (type === 'Weekly') {
      for (let i = 0; i <= 4; i++) {
        const date = start.add(i * 7, 'day').format('YYYY-MM-DD');
        newMarks[date] = {
          selected: true,
          selectedColor: backgroundColor,
        };
        if (!firstSelectedDate) firstSelectedDate = date;
      }
    } else if (type === 'Alternate Days') {
      for (let i = 0; i <= 13; i += 2) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');
        newMarks[date] = {
          selected: true,
          selectedColor: backgroundColor,
        };
        if (!firstSelectedDate) firstSelectedDate = date;
      }
    }

    setMarkedDates(newMarks);

    if (firstSelectedDate) {
      setCurrentMonth(firstSelectedDate); // Scroll to first marked date
      setCalendarKey(prev => prev + 1);   // Force re-render to apply
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);

    const today = dayjs().add(1, 'day').toDate();
    setStartDate(today);
    setCurrentMonth(dayjs(today).format('YYYY-MM-DD')); // update month
    setCalendarKey(prev => prev + 1); // 🔁 force Calendar to remount
    setScheduleType('Custom');
    setQuantity(1);
    setMarkedDates({});

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };



  const handleSubscribe = async () => {
    if (!storedLocation || !storedLocation.latitude || !storedLocation.longitude) {
      setShowServiceModal(true);
      console.warn("Location not available.");
      return;
    }

    try {
      setIsCheckingAddress(true);
      const response = await dispatch(
        checkAddressExistence({
          latitude: parseFloat(storedLocation.latitude),
          longitude: parseFloat(storedLocation.longitude),
        })
      );

      if (response?.payload?.data?.length > 0) {
        // ✅ Location is serviceable
        const locationData = response.payload.data[0];
        dispatch(setLocation({
          latitude: parseFloat(storedLocation.latitude),
          longitude: parseFloat(storedLocation.longitude),
          latitudeDelta: storedLocation.latitudeDelta,
          longitudeDelta: storedLocation.longitudeDelta,
        }));
        dispatch(setLocationName(locationData.location_name));
        dispatch(setLocationId(locationData.id));
        dispatch(setShopAddress(locationData));

        // ✅ Now check wallet balance
        if (walletBalance <= 0) {
          navigation.navigate("Wallet");
        } else {
          // Proceed to place order
          placeSubscriptionOrderHandler();
        }

      } else {
        // ❌ Location not serviceable
        setShowServiceModal(true);
      }
    } catch (error) {
      console.error("Subscribe check error:", error);
    } finally {
      setIsCheckingAddress(false);
    }
  };

  const placeSubscriptionOrderHandler = async () => {
    try {
      const payload = {
        subscription_start_date: dayjs(startDate).format('YYYY-MM-DD'),
        customer_id: customerId.toString(), // ensure string
        item_name: productDetails.name,
        item_image: productDetails.image,
        item_id: productDetails.id.toString(),
        quantity_type: productDetails.variant?.quantity_type,
        value: productDetails.variant?.value?.toString() ?? '1',
        category_id: productDetails?.category_id?.toString() || "",
        sub_category_id: productDetails.subcategory_id?.toString(),
        category_name: productDetails?.category_name || "",
        sub_category_name: productDetails?.sub_category_name || "",
        subtotal_category_id: productDetails?.subtotal_category_id?.toString() || "",
        subtotal_category_name: productDetails?.subtotal_category_name || "",
        actual_price: productDetails.variant?.actual_price,
        selling_price: productDetails.variant?.selling_price,
        sub_item_count: quantity,
        item_total_amount: quantity * productDetails.variant?.selling_price,
        filter_name: productDetails.filter_one ?? '',
        item_description: productDetails.description ?? '',
        saving_price: productDetails.variant?.actual_price - productDetails.variant?.selling_price,
        subscription_type: scheduleType,
        selecteddates: Object.keys(markedDates),
      };

      const res = await placeSubscriptionOrder(payload);
    
      if (res.status === 200) {
        setShowSuccessModal(true); // Show success modal
        setTimeout(() => {
          setShowSuccessModal(false); // Hide modal before navigating
          navigation.navigate('SubscriptionPage');
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to subscribe. Try again.',
        });
      }
    } catch (error) {

      Toast.show({
        type: 'error',
        text1: 'Something went wrong!',
        text2: error?.message,
      });
    }
  };

  // Define the background color
  const backgroundColor = '#8655d2';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Subscription</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.productInfo}>
          <Image
            source={{ uri: productDetails.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productDetails}>
            <Text style={styles.productCategory}>{productDetails.filter_one || 'Category'}</Text>
            <Text style={styles.productName}>{productDetails.name?.trim()}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.productWeight}>
                {productDetails.variant?.quantity_type || productDetails.quantity_type}
              </Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(prev => prev + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.productPrice}>
                ₹{parseFloat(productDetails.variant?.selling_price || productDetails.selling_price || 0) * quantity}
              </Text>
              <Text style={styles.actualPrice}>
                ₹{parseFloat(productDetails.variant?.actual_price || productDetails.price || "")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Schedule</Text>
          <View style={styles.scheduleOptions}>
            {['Weekly', 'Alternate Days', 'Custom'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.scheduleButton,
                  scheduleType === type && {
                    borderColor: backgroundColor,
                    backgroundColor: 'rgba(52, 131, 56, 0.1)'
                  },
                ]}
                onPress={() => setScheduleType(type)}
              >
                <Text
                  style={[
                    styles.scheduleButtonText,
                    scheduleType === type && { color: backgroundColor },
                  ]}
                >
                  {type}
                </Text>
                {scheduleType === type && (
                  <Icon name="check" size={wp('5%')} color={backgroundColor} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Date</Text>
          <Text style={styles.scheduleSubtitle}>Your deliveries will begin from this date</Text>

          <Calendar
            markingType={'custom'}
            key={calendarKey} // 🔁 force full re-render
            current={currentMonth} // scroll to correct month
            hideExtraDays={true} // ✅ hides previous/next month dates
            minDate={dayjs().add(1, 'day').format('YYYY-MM-DD')}
            onDayPress={(day) => {
              const selected = day.dateString;

              // Block selection if user somehow taps today's date
              const today = dayjs().format('YYYY-MM-DD');
              if (selected === today) return;

              if (scheduleType === 'Custom') {
                setMarkedDates((prev) => {
                  const newMarks = { ...prev };
                  if (newMarks[selected]) {
                    delete newMarks[selected];
                  } else {
                    newMarks[selected] = {
                      selected: true,
                      selectedColor: backgroundColor,
                    };
                  }
                  return newMarks;
                });
              } else {
                setStartDate(new Date(selected));
              }
            }}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: backgroundColor,
              selectedDayTextColor: '#fff',
              todayTextColor: backgroundColor,
              arrowColor: backgroundColor,
              disabledDayTextColor: '#A9A9A9', // light gray
              textDisabledColor: '#B0B0B0',
            }}
          />
        </View>

        {/* {scheduleType === 'Custom' && (
          <View style={styles.section}>
            <View style={styles.daysContainer}>
              {Object.keys(days).map((day) => (
                <View key={day} style={styles.dayItem}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => handleDayChange(day, 'decrease')}>
                      <Text style={styles.quantityButton}>−</Text>
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.quantityText,
                        days[day] > 0 && styles.quantityTextSelected,
                      ]}
                    >
                      {days[day]}
                    </Text>
                    <TouchableOpacity onPress={() => handleDayChange(day, 'increase')}>
                      <Text style={styles.quantityButton}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )} */}

        <View style={styles.section}>
          <View style={[styles.infoRow, styles.infoRowWithBackground]}>
            <Icon name="local-shipping" size={wp('5%')} color={backgroundColor} style={styles.infoIcon} />
            <Text style={styles.infoText}>Your order will be delivered on the scheduled day</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowWithBackground]}>
            <Icon name="account-balance-wallet" size={wp('5%')} color={backgroundColor} style={styles.infoIcon} />
            <Text style={styles.infoText}>Amount will be deducted from the wallet on the day of delivery</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.updateButton,
            Object.keys(markedDates).length === 0 && { backgroundColor: '#ccc' }
          ]}
          disabled={Object.keys(markedDates).length === 0}
          onPress={handleSubscribe}
        >
          <Text style={styles.updateButtonText}>Subscribe</Text>
        </TouchableOpacity>
        {/* <View style={styles.secondaryButtons}>
          <TouchableOpacity style={[styles.resumeButton, { borderColor: backgroundColor }]}>
            <Text style={[styles.resumeButtonText, { color: backgroundColor }]}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      {showSuccessModal && (
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <Icon name="check-circle" size={48} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.successTitle}>🎉 Subscription Successful!</Text>
            <Text style={styles.successMessage}>Your order has been placed.</Text>
          </View>
        </View>
      )}
      <Modal
        transparent
        visible={showServiceModal}
        animationType="fade"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Service Unavailable</Text>
            <Text style={styles.modalText}>
              We currently do not provide service in your area. You can change your location or visit our app for more information.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.changeLocationBtn}
                onPress={() => {
                  setShowServiceModal(false);
                  navigation.navigate('SelectServiceFromLocation'); // 👈 Navigate here
                }}
              >
                <Text style={styles.buttonText}>Change Location</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                style={styles.visitAppBtn}
                onPress={() => {
                  setShowServiceModal(false);
                  Linking.openURL("https://yourwebsite.com"); // Change to your app URL
                }}
              >
                <Text style={styles.buttonText}>Visit Our App</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles['subscribeConfirm-overlay']}>
          <View style={styles['subscribeConfirm-modal']}>
            <Text style={styles['subscribeConfirm-title']}>📦 Confirm Your Subscription</Text>

            <Text style={styles['subscribeConfirm-info']}>
              You've selected <Text style={{ fontWeight: 'bold' }}>{Object.keys(markedDates).length}</Text> delivery date(s):
            </Text>

            {/* Scrollable Date List */}
            <ScrollView
              style={styles['subscribeConfirm-dateScroll']}
              horizontal={true}
              showsHorizontalScrollIndicator={true}
            >
              <View style={styles['subscribeConfirm-dateList']}>
                {Object.keys(markedDates)
                  .sort((a, b) => new Date(a) - new Date(b))
                  .map((date) => (
                    <View key={date} style={styles['subscribeConfirm-dateBadge']}>
                      <Text style={styles['subscribeConfirm-dateText']}>
                        {dayjs(date).format('ddd, MMM DD YYYY')}
                      </Text>
                    </View>
                  ))}
              </View>
            </ScrollView>


            {/* Summary */}
            <View style={styles['subscribeConfirm-summaryBox']}>
              <Text style={styles['subscribeConfirm-summaryText']}>
                Your subscription will be delivered on the selected days.
              </Text>
              <Text style={styles['subscribeConfirm-summaryText']}>
                - Your wallet must have at least ₹{productDetails.variant?.selling_price * quantity} on each delivery date.
              </Text>
              <Text style={styles['subscribeConfirm-summaryText']}>
                - If your balance is insufficient, the delivery will be <Text style={{ fontWeight: 'bold' }}>automatically paused</Text>.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles['subscribeConfirm-actions']}>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmationModal(false);
                  placeSubscriptionOrderHandler();
                }}
                style={styles['subscribeConfirm-confirmBtn']}
              >
                <Text style={styles['subscribeConfirm-confirmText']}>✅ Confirm & Subscribe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowConfirmationModal(false)}
                style={styles['subscribeConfirm-cancelBtn']}
              >
                <Text style={styles['subscribeConfirm-cancelText']}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>





    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#8655d2',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',

  },
  headerTitle: {
    color: '#fff',
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginLeft: 15
  },
  scrollContent: {
    paddingBottom: hp('20%'),
  },
  productImage: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: 8,
    marginRight: wp('4%'),
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productCategory: {
    fontSize: wp('4%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  productName: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  productWeight: {
    fontSize: wp('4%'),
    color: '#666',
    marginBottom: hp('0.5%'),
    width: "50%",
     backgroundColor: "green",
  },
  productPrice: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    paddingHorizontal: wp('4%'),
    marginBottom: hp('1%'),

  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('2%'),
  },
  scheduleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('2%'),
    marginHorizontal: wp('1%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleButtonSmall: {
    flex: 1, // Smaller width for Daily and Custom
  },
  scheduleButtonLarge: {
    flex: 2, // Larger width for Alternate Days
  },
  scheduleButtonSelected: {
    borderColor: '#8655d2',
  },
  radioCircle: {
    width: wp('3%'),
    height: wp('3%'),
    borderRadius: wp('1.5%'),
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  radioCircleSelected: {
    borderColor: '#8655d2',
    backgroundColor: '#8655d2',
  },
  scheduleButtonText: {
    fontSize: wp('4%'),
    color: '#666',
  },
  scheduleButtonTextSelected: {
    color: '#8655d2',
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: wp('4%'),
    color: '#666',
    marginBottom: hp('1%'),
  },
  quantityContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
  },
  quantityButton: {
    fontSize: wp('5%'),
    color: '#000',
    paddingVertical: hp('0.5%'),
  },
  quantityText: {
    fontSize: wp('4%'),
    color: '#000',
    paddingVertical: hp('0.5%'),
    fontWeight: 'bold',
  },
  quantityTextSelected: {
    backgroundColor: '#8655d2',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: wp('2%'),
  },
  dateTimeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('3%'),
  },
  dateTimeLabel: {
    fontSize: wp('4%'),
    color: '#000',
    fontWeight: 'bold',
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1BFBF',
    borderRadius: 10,
    padding: wp('2%')
  },
  dateTimeIcon: {
    marginRight: wp('2%'),
  },
  dateTimeText: {
    fontSize: wp('4%'),
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  infoRowWithBackground: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    borderRadius: 8,
  },
  infoIcon: {
    marginRight: wp('2%'),
  },
  infoText: {
    fontSize: wp('3.5%'),
    color: '#666',
    flex: 1,
  },
  bottomBar: {
    padding: wp('4%'),
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateButton: {
    backgroundColor: '#8655d2',
    borderRadius: 20,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  updateButtonText: {
    fontSize: wp('4%'),
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8655d2',
    borderRadius: 20,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  resumeButtonText: {
    fontSize: wp('4%'),
    color: '#8655d2',
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: wp('4%'),
    color: '#666',
    fontWeight: 'bold',
  },
  // 
  productInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 2,
  },

  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },

  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  productCategory: {
    fontSize: 14,
    color: '#777',
  },

  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  productWeight: {
    fontSize: 14,
    color: '#555',
    
    width: "50%",
  },

  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8655d2',
  },

  actualPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    color: '#999',
    marginLeft: 8,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  quantityButton: {
    backgroundColor: '#8655d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  quantityButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
    fontWeight: '500',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 30,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  changeLocationBtn: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  visitAppBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  successModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successModalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  successIcon: {
    marginBottom: 12,
  },
  'subscribeConfirm-overlay': {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  'subscribeConfirm-modal': {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  'subscribeConfirm-title': {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  'subscribeConfirm-info': {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
  },
  'subscribeConfirm-dateScroll': {
    height: 60,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9fafb',
  },

  'subscribeConfirm-dateList': {
    flexDirection: 'row', // must be row for horizontal scroll
    alignItems: 'center',
  },

  'subscribeConfirm-dateBadge': {
    backgroundColor: '#e0f2fe',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
  },

  'subscribeConfirm-dateText': {
    fontSize: 13,
    color: '#0369a1',
  },
  'subscribeConfirm-dateText': {
    fontSize: 13,
    color: '#0369a1',
  },

  'subscribeConfirm-summaryBox': {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  'subscribeConfirm-summaryText': {
    fontSize: 13,
    color: '#78350f',
    marginBottom: 6,
  },
  'subscribeConfirm-dateText': {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '500',
  },
  'subscribeConfirm-warningBox': {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  'subscribeConfirm-warningText': {
    fontSize: 13,
    color: '#7c2d12',
    marginBottom: 6,
  },
  'subscribeConfirm-actions': {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  'subscribeConfirm-confirmBtn': {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',       // ✅ Center vertically
    alignItems: 'center',           // ✅ Center horizontally
  },
  'subscribeConfirm-cancelBtn': {
    flex: 1,
    backgroundColor: '#d1d5db',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',       // ✅ Center vertically
    alignItems: 'center',           // ✅ Center horizontally
  },
  'subscribeConfirm-confirmText': {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  'subscribeConfirm-cancelText': {
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },

});

export default EditSubscriptionScreen;