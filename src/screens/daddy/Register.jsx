import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AuthBackground from './tabassets/AuthBackground';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import GoogleIcon from '../user/svgs/GoogleIcon';
import { actionLogin, setInitial, verifyCustomerMobile } from '../../redux/reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import CustomModal from '../../components/CustomModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getUserLoginOTP } from '../../services/services';
// import CustomModal from '../components/CustomModal';



export default function Register({ navigation, route }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: ''
  });
  const [sendingOTP, setSendingOTP] = useState(false);
  const dispatch = useDispatch();
  const loading = useSelector(state => state.Auth.loading);
  const [username, setUsername] = useState('');

  const showErrorModal = (title, message) => {
    setModalContent({ title, message });
    setModalVisible(true);
  };

  const validateForm = () => {
    // if (!username.trim()) {
    //   showErrorModal('Validation Error', 'Username is required');
    //   return false;
    // }
    if (!phoneNumber) {
      showErrorModal('Validation Error', 'Phone number is required');
      return false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
      showErrorModal('Validation Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };


  const handleGetOTP = async () => {
    if (validateForm()) {
      setSendingOTP(true);
      try {
        const response = await getUserLoginOTP(parseInt(phoneNumber, 10));
        console.log(response)
        if (response.status === 200) {
          navigation.navigate("OTPVerification", {
            phoneNumber: phoneNumber,
            otp: response.loginotp,
            isFromCart: route.params?.isFromCart || null,
            user_ind : response.user_ind,
            message: response.message
            // username: username.trim()
          });          
        } else {
          Alert.alert('Error', 'Failed to generate OTP');
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to get OTP. Please try again.');
        console.error(error);
      } finally {
        setSendingOTP(false);
      }
    }
  };

  useEffect(() => {
    dispatch(setInitial())
  }, [])

  return (
    <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()} >
      <View style={styles.main}>
        <CustomModal
          visible={modalVisible}
          title={modalContent.title}
          message={modalContent.message}
          onConfirm={() => setModalVisible(false)}
          confirmText="OK"
          cancelText={null}
        />
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#065E2C" />
          </View>
        )}
        <StatusBar translucent hidden />
        <ImageBackground
          source={require('./tabassets/voiletsignin.png')}
          resizeMode="stretch"
          style={{
            width: responsiveWidth(100),
            height: responsiveHeight(30),
            backgroundColor: '#8655d2',
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
            Please enter your phone number to continue
          </Text>
          {/* <View style={{ marginTop: responsiveHeight(3) }}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              placeholderTextColor={'#3D3D3D'}
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </View> */}
          <View style={{ marginTop: responsiveHeight(5) }}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              placeholderTextColor={'#3D3D3D'}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, ''); // Remove non-numeric chars
                setPhoneNumber(numericText);
              }}
              maxLength={10}
            />
          </View>
          <TouchableOpacity
            onPress={handleGetOTP}
            style={[
              styles.loginButton,
              sendingOTP && { opacity: 0.6 } // Visual feedback when disabled
            ]}
            disabled={sendingOTP}
          >
            <Text style={styles.loginText}>
              {sendingOTP ? <ActivityIndicator size="small" color="#fff" /> : 'Get OTP'}
            </Text>
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
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
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
    fontSize: 14,
    color: '#065E2C',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: "#8655d2", // updated
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
    fontSize: 16,
    color: '#646982',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    backgroundColor: '#395998',
    width: 62,
    height: 62,
    borderRadius: 50,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8655d2',
    backgroundColor: 'transparent',
    marginTop: responsiveHeight(2),
    marginHorizontal: responsiveWidth(1),
  },
  skipText: {
    color: '#8655d2',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
