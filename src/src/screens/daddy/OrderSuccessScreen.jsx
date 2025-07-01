import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { removeCoupon } from '../../redux/reducers/coupons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { clearCart } from '../../redux/reducers/cartReducer';


const OrderSuccessScreen = ({ navigation, route }) => {
  const { orderDetails } = route.params; // ✅ Get the passed data
  const { selectedAddress } = useSelector((state) => state.address);
  const dispatch = useDispatch();
 

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('TrackOrder', {
        orderDetails,
        status: 0
      });
      dispatch(clearCart());
      dispatch(removeCoupon());
    }, 1500);

    return () => clearTimeout(timer); // Cleanup
  }, []);

  

  const handleBackPress = () => {
    navigation.navigate('OrderDetails', {
      fromOrderSuccess: true,
      orderDetails: route?.params?.response,
    });
  };

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Cleanup the event listener
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Reinstated checkmarkContainer with the new color */}
        <View style={styles.checkmarkContainer}>
          <Image
            source={require('../daddy/tabassets/orderSuccess.png')}
            resizeMode="contain"
            style={styles.checkmarkImage}
          />
          {/* Optionally, you can overlay the MaterialIcons checkmark */}
          {/* <MaterialIcons name="check" size={40} color="#fff" /> */}
        </View>
        
        <Text style={styles.successText}>
          Order successfully placed for
        </Text>
        
        <View style={styles.addressContainer}>
          <Text style={styles.addressType}>
            {selectedAddress?.address_type || 'Home'}
          </Text>
          <Text style={styles.addressText}>
            {selectedAddress?.full_address || '301, JSR Enclave, Danvaipetapuram Lorem Ipsum Lorem Dolor Sit'}
          </Text>
        </View>

        {/* Reinstated the button with the new color */}
        {/* <TouchableOpacity style={styles.offerButton}>
          <Ionicons name="pricetag" size={responsiveFontSize(2)} color="#348338" />
          <Text style={styles.offerText}> ₹200 saved from this order</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(10),
    paddingBottom: responsiveHeight(5),
  },

  checkmarkImage: {
    width: responsiveWidth(50),
    height: responsiveWidth(50),
  },
  successText: {
    fontSize: 18,
    color: 'black',
    marginBottom: responsiveHeight(2),
    fontWeight: '600',
    textAlign: 'center',
  },
  
  addressContainer: {
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(3),
  },
  
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: responsiveHeight(0.5),
  },
  
  addressText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    width: responsiveWidth(80),
  },
  
  button: {
    backgroundColor: '#7E57C2', // purple
    paddingVertical: responsiveHeight(1.8),
    paddingHorizontal: responsiveWidth(20),
    borderRadius: 10,
    marginTop: responsiveHeight(4),
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

export default OrderSuccessScreen;