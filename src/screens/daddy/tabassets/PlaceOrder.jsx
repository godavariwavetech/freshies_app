import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const OrderSuccessScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('TrackOrder'); // Replace with your actual screen name
    }, 2000);

    return () => clearTimeout(timer); // Cleanup
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.checkmarkCircle}>
          <Ionicons name="checkmark" size={responsiveFontSize(4)} color="white" />
        </View>

        <Text style={styles.orderText}>Order Placed for</Text>
        <Text style={styles.placeText}>Home</Text>
        <Text style={styles.addressText}>
          Drno 72-32-8 Near Sai Baba Temple, {'\n'}
          Near Cyclone Colony Food Gowdence...
        </Text>

        <TouchableOpacity style={styles.offerButton}>
          <Ionicons name="pricetag" size={responsiveFontSize(2)} color="#348338" />
          <Text style={styles.offerText}> ₹200 saved from this order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderSuccessScreen;
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
      justifyContent: 'center', // center vertically
      alignItems: 'center',     // center horizontally
      paddingHorizontal: responsiveWidth(5),
    },
    content: {
      alignItems: 'center',
    },
    checkmarkCircle: {
      backgroundColor: '#348338',
      borderRadius: 100,
      padding: responsiveFontSize(3.5),
      marginBottom: responsiveHeight(4),
    },
    orderText: {
      fontSize: responsiveFontSize(2),
      color: '#333',
      marginBottom: responsiveHeight(1),
    },
    placeText: {
      fontSize: responsiveFontSize(2.5),
      fontWeight: 'bold',
      color: '#000',
      marginBottom: responsiveHeight(1),
    },
    addressText: {
      fontSize: responsiveFontSize(1.8),
      textAlign: 'center',
      color: '#444',
      marginBottom: responsiveHeight(6),
    },
    offerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#348338',
      paddingVertical: responsiveHeight(1),
      paddingHorizontal: responsiveWidth(5),
      borderRadius: 8,
      backgroundColor: '#fff5f5',
    },
    offerText: {
      color: '#348338',
      fontSize: responsiveFontSize(1.8),
    },
  });