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
} from 'react-native';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useDispatch } from 'react-redux';
import { setLocation } from '../../redux/reducers/auth'; // Update with your actual path

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

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude)
        dispatch(setLocation({ latitude, longitude }));
      },
      error => {
        console.warn(error);
        Alert.alert('Error', 'Unable to fetch location.');
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
    backgroundColor: '#6A48D2',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: responsiveHeight(6),
    position: 'absolute',
  },
});

export default OnboardingScreen; 