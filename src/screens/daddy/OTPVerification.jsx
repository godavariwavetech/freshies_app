import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import AuthBackground from './tabassets/AuthBackground';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import GoogleIcon from '../user/svgs/GoogleIcon';
import { useDispatch } from 'react-redux';
import { actionLogin, addCustomer, setMobile, verifyCustomerMobile, verifyCustomerOTP } from '../../redux/reducers/auth';
import Geolocation from '@react-native-community/geolocation';
import { checkAddressExistence } from '../../redux/reducers/daddy';
import { customerLogin } from '../../services/services';

export default function OTPVerification({ navigation, route }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        clearInterval(countdown);
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);



  const handleVerifyOtp = async () => {
    if (otp.includes('')) {
      setError('Please enter all 4 digits of the OTP');
      return;
    }

    try {
      const enteredOtp = otp.join('');
      setLoader(true);

      // Check if OTP is from getuserloginotp endpoint
      if (route.params?.otp && enteredOtp === route.params.otp.toString()) {
        // Direct OTP verification from getuserloginotp
        dispatch(addCustomer({
          mobileNumber: route.params?.phoneNumber,
          otp: enteredOtp
        }));

        dispatch(setMobile(route.params?.phoneNumber))

        // // Navigate based on flow
        if (route.params?.isFromCart) {
          navigation.replace("CartScreen");
        } else {
          dispatch(actionLogin());
          // navigation.replace('BottomNavigation');
        }
        return;
      }

      // If not matched with route params OTP, try customer login
      const loginResponse = await customerLogin(parseInt(route.params?.phoneNumber, 10));
      
      // Compare entered OTP with customer login OTP
      if (loginResponse.status === 200 &&
        enteredOtp === loginResponse.data.customer_otp.toString()) {

        dispatch(addCustomer({
          mobileNumber: route.params?.phoneNumber,
          otp: enteredOtp,
          customerId: loginResponse.data.customer_id
        }));

        // Navigate based on flow
        if (route.params?.isFromCart) {
          navigation.replace("CartScreen");
        } else {
          dispatch(actionLogin());
          navigation.replace('BottomNavigation');
        }
      } else {
        setError('Invalid OTP. Please try again.');
        setLoader(false);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoader(false);
      console.error(error);
    }
  };

  const handleOTPChange = (value, index) => {
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to the next input field
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // If the input is empty, move back to the previous field
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const maskPhoneNumber = number => {
    if (!number) return '';
    return number.replace(/(\d{2})\d{5}(\d{3})/, '$1*****$2');
  };

  const resendOtpHandler = () => {
    setError("")
    setTimer(60);
    setOtp(['', '', '', '']);
    dispatch(verifyCustomerMobile({ customer_mobile_number: route.params?.phoneNumber }));
  };

  return (
    <Pressable onPress={() => Keyboard.dismiss()} style={{ flex: 1 }}>
      <View style={styles.main}>
        <StatusBar translucent hidden />
        <ImageBackground
          source={require('./tabassets/voiletverification.png')}
          resizeMode="stretch"
          style={{
            width: responsiveWidth(100),
            height: responsiveHeight(30),
            backgroundColor: '#6A48D2',
            justifyContent: "flex-end"
          }}>
        </ImageBackground>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            transform: [{ translateY: -responsiveHeight(4.5) }],
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: responsiveWidth(5),
            paddingVertical: responsiveHeight(3),
          }}>
          <Text
            style={{
              color: '#3D3D3D',
              textAlign: 'center',
              fontSize: 20,
              fontWeight: '500',
            }}>
            Enter the verification code we just sent on the mobile number
            {maskPhoneNumber(` ${route.params?.phoneNumber}`)}
          </Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                style={styles.otpBox}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={value => handleOTPChange(value, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={{ marginTop: responsiveHeight(5) }}>
            {timer !== 0 && <Text style={{ color: "#3D3D3D", fontSize: 18, fontWeight: "700", textAlign: "center" }}>Resend OTP in {timer}s </Text>}
            <TouchableOpacity disabled={timer != 0} onPress={resendOtpHandler}>
              <Text style={{ fontSize: 14, color: timer == 0 ? "#6A48D2" : "#8F8F8F", fontWeight: "700", textAlign: "center", marginTop: responsiveHeight(1) }}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleVerifyOtp}
            style={[styles.loginButton, loader && { opacity: 0.6 }]}
            disabled={loader}
          >
            {loader ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginText}>Verify</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#666',
    color: '#000',
    fontWeight: 'condensed',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  passwordInput: {
    flex: 1,
    color: '#000',
  },
  icon: {
    paddingHorizontal: 10,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginVertical: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    marginRight: 5,
  },
  rememberText: {
    fontSize: 13,
    color: '#7E8A97',
    fontWeight: '400',
  },
  forgotPassword: {
    // marginLeft: "auto",
    fontSize: 14,
    color: '#6A48D2',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: "#8655d2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: responsiveHeight(5),
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  signupText: {
    textAlign: 'center',
    // marginTop: 15,
    fontSize: 14,
    color: '#646982',
    fontWeight: '400',
  },
  signupLink: {
    color: '#065E2C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orText: {
    textAlign: 'center',
    // marginVertical: 10,
    fontSize: 16,
    color: '#646982',
  },

  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 8,
    textAlign: "center"
  },
  otpContainer: {
    flexDirection: 'row',
    // justifyContent: "space-between",
    // marginHorizontal:20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // alignSelf:"center",
    // marginVertical: 16,
    marginTop: responsiveHeight(5),
    gap: 16,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderRadius: 7,
    textAlign: 'center',
    fontSize: 18,
    // backgroundColor: '#F5F9FF',
    borderColor: '#6A48D2',
  },
  timer: {
    color: 'gray',
    marginBottom: 20,
    alignSelf: 'start',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2264D2',
    textAlign: 'center',
  },
  locationLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6A48D2',
    fontWeight: '500',
  },
  locationErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  locationErrorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6A48D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
