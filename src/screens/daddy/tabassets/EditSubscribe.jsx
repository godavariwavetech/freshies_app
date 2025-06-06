import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditSubscriptionScreen = ({ navigation }) => {
  const [scheduleType, setScheduleType] = useState('Custom');
  const [days, setDays] = useState({
    Sun: 0,
    Mon: 0,
    Tue: 1,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  });

  const date = new Date('2025-04-01');
  const time = new Date();
  time.setHours(6, 30); // Static time set to 06:30 AM

  const handleDayChange = (day, action) => {
    setDays((prev) => ({
      ...prev,
      [day]: action === 'increase' ? prev[day] + 1 : Math.max(0, prev[day] - 1),
    }));
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    const hours = time.getHours() % 12 || 12;
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  };

  // Define the background color
  const backgroundColor = '#6A48D2';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Subscription</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.productInfo}>
          <Image
            source={require('../../daddy/tabassets/keema.png')}
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productCategory}>Mutton</Text>
            <Text style={styles.productName}>Mince (Keema)</Text>
            <Text style={styles.productWeight}>500gms</Text>
            <Text style={styles.productPrice}>₹350.00</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Schedule</Text>
          <View style={styles.scheduleOptions}>
            {['Daily', 'Alternate Days', 'Custom'].map((type) => (
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

        {scheduleType === 'Custom' && (
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
        )}

        <View style={styles.section}>
          <View style={styles.dateTimeWrapper}>
            <View>
              <Text style={styles.dateTimeLabel}>Start Date</Text>
            </View>
            <View style={styles.dateTimeContent}>
              <Icon name="calendar-today" size={wp('5%')} color={backgroundColor} style={styles.dateTimeIcon} />
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.dateTimeWrapper}>
            <View>
              <Text style={styles.dateTimeLabel}>Start Time</Text>
            </View>
            <View style={styles.dateTimeContent}>
              <Icon name="access-time" size={wp('5%')} color={backgroundColor} style={styles.dateTimeIcon} />
              <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
            </View>
          </View>
        </View>
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
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Update Subscription</Text>
        </TouchableOpacity>
        <View style={styles.secondaryButtons}>
          <TouchableOpacity style={[styles.resumeButton, { borderColor: backgroundColor }]}>
            <Text style={[styles.resumeButtonText, { color: backgroundColor }]}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#6A48D2',
    paddingVertical: hp('4%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: hp('20%'),
  },
  productInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: 8,
    margin: wp('4%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderColor: '#6A48D2',
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
    borderColor: '#6A48D2',
    backgroundColor: '#6A48D2',
  },
  scheduleButtonText: {
    fontSize: wp('4%'),
    color: '#666',
  },
  scheduleButtonTextSelected: {
    color: '#6A48D2',
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
    backgroundColor: '#6A48D2',
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
    borderWidth:1,
    borderColor:'#F1BFBF',
    borderRadius:10,
    padding:wp('2%')
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
    backgroundColor: '#6A48D2',
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
    borderColor: '#6A48D2',
    borderRadius: 20,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  resumeButtonText: {
    fontSize: wp('4%'),
    color: '#6A48D2',
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
});

export default EditSubscriptionScreen;