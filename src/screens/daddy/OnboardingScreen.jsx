import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  Alert,
  Modal
} from 'react-native';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useDispatch } from 'react-redux';
import { setLocation } from '../../redux/reducers/auth'; // Update with your actual path
import { checkAddressExistence } from '../../services/services';
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('./tabassets/onBoard1.png'),
    title: 'Buy Groceries Easily\nwith Us',
    description: 'It is a long established fact that a reader\nwill be distracted by the readable.',
  },
  {
    id: 2,
    image: require('./tabassets/onBoard2.png'),
    title: 'Buy Groceries Easily\nwith Us',
    description: 'It is a long established fact that a reader\nwill be distracted by the readable.',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isCheckingAddress, setIsCheckingAddress] = useState(true)
  const dispatch = useDispatch();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === RESULTS.GRANTED) {
        getLocation();
      } else {
        const requestResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (requestResult === RESULTS.GRANTED) {
          getLocation();
        } else {
          // Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      position => {
        (async () => {
          const { latitude, longitude } = position.coords;
          
          const region = {
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                };
          dispatch(setLocation(region));

          // try {
          //   setIsCheckingAddress(true);

          //   const response = await dispatch(
          //     checkAddressExistence({
          //       latitude: parseFloat(latitude),
          //       longitude: parseFloat(longitude),
          //     }),
          //   );

          //   

          //   if (response.payload.data.length > 0) {
          //     const region = {
          //       latitude,
          //       longitude,
          //       latitudeDelta: 0.01,
          //       longitudeDelta: 0.01,
          //     };

          //     dispatch(setLocation(region));
          //     dispatch(setLocationName(response.payload.data[0].location_name));
          //     dispatch(setLocationId(response.payload.data[0].id));
          //     dispatch(setShopAddress(response.payload.data[0]));
          //     navigation.goBack();
          //   } else {
          //     setShowServiceModal(true);
          //   }
          // } catch (error) {
          //   console.error('Location confirmation error:', error);
          // } finally {
          //   setIsCheckingAddress(false);
          // }
        })(); // immediately-invoked async function expression
      },
      error => {
        console.warn(error);
        Alert.alert('Location', 'Unable to fetch your location please On your Locacation in Settings.');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };


  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Register');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.replace('Register')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Image
          source={onboardingData[currentIndex].image}
          style={[styles.image, { marginBottom: responsiveHeight(currentIndex === 0 ? 13 : 17) }]}
          resizeMode="contain"
        />

        <ImageBackground
          source={require('./tabassets/voiletonboard.png')}
          style={[styles.image, { alignItems: "center", justifyContent: "center", alignSelf: "center" }, { position: "absolute", bottom: responsiveHeight(0) }]}
          resizeMode="contain"
        >
          <Text style={styles.title}>
            {onboardingData[currentIndex].title}
          </Text>
          <Text style={styles.description}>
            {onboardingData[currentIndex].description}
          </Text>
          <TouchableOpacity
            style={[styles.nextButton, {}]}
            onPress={handleNext}
          >
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </ImageBackground>
      </View>

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
              <TouchableOpacity
                style={styles.visitAppBtn}
                onPress={() => {
                  setShowServiceModal(false);
                  Linking.openURL("https://yourwebsite.com"); // Change to your app URL
                }}
              >
                <Text style={styles.buttonText}>Visit Our App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#000000',
    marginRight: 5,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8655d2',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: responsiveHeight(6),
    position: 'absolute',
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
  }
});

export default OnboardingScreen; 