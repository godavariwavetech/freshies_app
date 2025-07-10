import React,{useEffect} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import RentalNavigation from './RentalNavigation';
import Register from '../screens/daddy/Register';
import OTPVerification from '../screens/daddy/OTPVerification';
import OnboardingScreen from '../screens/daddy/OnboardingScreen';
import SplashScreen from '../screens/user/SplashScreen';

const Stack = createStackNavigator();
const AuthNavigation = () => {
  const { isLogged } = useSelector(state => state.Auth);
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={'Splashscreen'}>
      <Stack.Screen name="Splashscreen" component={SplashScreen} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} />
    </Stack.Navigator>
  );
};

const MainNavigation = ({ userRole }) => {
  {
    switch (userRole) {
      case 2:
        return <RentalNavigation />;
      default:
        return <></>;
    }
  }
};

const AppNavigation = () => {
  const { token, userRole } = useSelector(state => state.Auth);
  return token ? <MainNavigation userRole={2} /> : <AuthNavigation />;
};

export default AppNavigation;
