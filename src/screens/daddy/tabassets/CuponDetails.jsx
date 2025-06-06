import React from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const CouponDetailsScreen = ({ navigation, route }) => {
  // Get coupon data from navigation params
  const { coupon } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#D32F2F" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupon Details</Text>
      </View>

      {/* Coupon Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.couponCode}>{coupon.code}</Text>
        <Text style={styles.couponTitle}>{coupon.title}</Text>
        <Text style={styles.couponValidity}>{coupon.validity}</Text>
        <Text style={styles.conditionsTitle}>Terms & Conditions</Text>
        {coupon.conditions.map((condition, index) => (
          <View key={index} style={styles.conditionItem}>
            <Text style={styles.conditionBullet}>•</Text>
            <Text style={styles.conditionText}>{condition}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#D32F2F',
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
    marginLeft: wp('4%'),
  },
  detailsContainer: {
    padding: wp('4%'),
  },
  couponCode: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: hp('1%'),
  },
  couponTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1%'),
  },
  couponValidity: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('2%'),
  },
  conditionsTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('1%'),
  },
  conditionItem: {
    flexDirection: 'row',
    marginBottom: hp('0.5%'),
  },
  conditionBullet: {
    fontSize: wp('4%'),
    color: '#000',
    marginRight: wp('2%'),
  },
  conditionText: {
    fontSize: wp('3.5%'),
    color: '#000',
    flex: 1,
  },
});

export default CouponDetailsScreen;