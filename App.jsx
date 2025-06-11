import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import SplashScreen from 'react-native-splash-screen'
import { getFCMToken } from './src/services/NotificationsService';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { requestNotificationPermission, setupNotificationHandlers } from './src/services/NotificationsService';
import { Alert, Linking, PermissionsAndroid, Platform, View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { checkNotifications, requestNotifications } from 'react-native-permissions';
import VersionCheck from 'react-native-version-check';
import CustomAlert from './src/components/CustomAlert';
import CustomModal from './src/components/CustomModal';
import NetInfo from '@react-native-community/netinfo';
import { setIsNetworkConnected } from './src/redux/reducers/addressSlice';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import RootNavigation from './src/navigation/AppNavigation';



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
      toValue: isConnected ? -50 : 0, // Slide down when disconnected
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
    const checkAndRequestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          console.log("parledhu vachind")
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted');
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        // For iOS
        const { status } = await checkNotifications();
        if (status !== 'granted') {
          const { status: newStatus } = await requestNotifications(['alert', 'sound']);
          console.log('Notification permission status:', newStatus);
        }
      }
    };

    checkAndRequestPermissions();
  }, []);

  useEffect(() => {
    SplashScreen.hide();
    getToken()
  }, [])

  useEffect(() => {
    checkForUpdate();
  }, []);

  const getToken = async () => {
    await getFCMToken()
  }

  const checkForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate();
      if (res?.isNeeded) {
       
        setShowUpdateModal(true);
      } else {
      
        setShowUpdateModal(false);
      }
    } catch (error) {
      console.log("Error checking for updates:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await Linking.openURL("https://play.google.com/store/apps/details?id=com.localdaddy");
    } catch (error) {
      console.log("Play Store link error:", error);
    } finally {
      setShowUpdateModal(false);
    }
  };


  return (
    <Provider store={store}>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          {/* 🔵 Global StatusBar */}
          <StatusBar
            backgroundColor="#4B3395" // Android background
            barStyle="light-content"  // iOS & Android text/icons
            translucent={false}
          />
  
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
    </Provider>
  );
  
};

export default App;
