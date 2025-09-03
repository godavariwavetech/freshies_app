import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import SplashScreen from 'react-native-splash-screen'
import { Alert, Linking, BackHandler, PermissionsAndroid, Platform, View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { checkNotifications, requestNotifications } from 'react-native-permissions';
import VersionCheck from 'react-native-version-check';
import CustomAlert from './src/components/CustomAlert';
import CustomModal from './src/components/CustomModal';
import NetInfo from '@react-native-community/netinfo';
import { setIsNetworkConnected } from './src/redux/reducers/addressSlice';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import RootNavigation from './src/navigation/AppNavigation';
import { OneSignal, LogLevel } from 'react-native-onesignal'; // Import OneSignal
import { SafeAreaProvider } from 'react-native-safe-area-context'; // 👈 add this

// OneSignal App ID
const ONESIGNAL_APP_ID = '2f9cf292-abd6-4f8f-9d4e-72e7b38f9a14'; // 🔁 Replace this with your real App ID

const NetworkStatusBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-50));
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      dispatch(setIsNetworkConnected(state.isConnected));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isConnected ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, slideAnim]);

  if (isConnected) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'red',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10
  },
});

const App = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
    checkForUpdate();
    checkAndRequestPermissions();
  }, []);

  useEffect(() => {

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // OneSignal Initialization
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // **Delay the permission request**
    setTimeout(() => {
      OneSignal.Notifications.requestPermission(true);
    }, 500); // Delay by 500 milliseconds (adjust if needed)


    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {

      event.complete(event.notification);
    });

    OneSignal.Notifications.addEventListener('opened', (event) => {

    });

    OneSignal.User.addEmail('your_user_email@example.com');
    OneSignal.User.addTag('user_type', 'premium');

  }, []);

  useEffect(() => {
    if (showUpdateModal) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [showUpdateModal]);

  const checkAndRequestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {

        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      const { status } = await checkNotifications();
      if (status !== 'granted') {
        const { status: newStatus } = await requestNotifications(['alert', 'sound']);

      }
    }
  };

  const checkForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate();
      if (res?.isNeeded) {
        setShowUpdateModal(true);
      } else {
        setShowUpdateModal(false);
      }
    } catch (error) {

    }
  };

  const handleUpdate = async () => {
    try {
      // await Linking.openURL("https://play.google.com/store/apps/details?id=com.Abhi24");
      await Linking.openURL("https://play.google.com/store/apps/details?id=com.Abhi24&pcampaignid=web_share");

    } catch (error) {
      console.error('Failed to open Play Store:', error);
    } finally {
      // Force close app after redirecting
      BackHandler.exitApp();
    }
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={{ flex: 1 }}>
            <NetworkStatusBanner />
            <RootNavigation />
            <CustomModal
              visible={showUpdateModal}
              title="Update Available"
              message="A new version of the app is available. Please update to continue using all features."
              confirmText="Update Now"
              onConfirm={handleUpdate}
              cancelText=""
            />
            <Toast />
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
