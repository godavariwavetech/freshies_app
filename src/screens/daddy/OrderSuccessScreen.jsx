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
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/reducers/daddy';
import { removeCoupon } from '../../redux/reducers/coupons';

const OrderSuccessScreen = ({ navigation, route }) => {
  const { selectedAddress } = useSelector((state) => state.address);
  const dispatch = useDispatch();

  const handleNavigate = () => {
    navigation.replace('OrderDetailsScreen');
  };

  useEffect(() => {
    setTimeout(() => {
      handleNavigate();
      dispatch(clearCart());
      dispatch(removeCoupon());
    }, 500);
  }, []);

  console.log(route?.params, '+++++++++++>>>>>RESPONSE');

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
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
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
    color: '#dc143c',
    marginBottom: responsiveHeight(0.5),
  },
  
  addressText: {
    fontSize: 14,
    color: '#dc143c',
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
});

export default OrderSuccessScreen;