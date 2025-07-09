import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import BottomNavigation from '../screens/daddy/BottomNavigation';
import RestaurantScreen from '../screens/daddy/RestaurantScreen';
import CategorieItems from '../screens/daddy/CategorieItems';
import AddressListScreen from '../screens/daddy/AddressListScreen';
import AddAddressScreen from '../screens/daddy/AddAddressScreen';
import MoreDetailsScreen from '../screens/daddy/MoreDetailsScreen';
import CheckoutScreen from '../screens/daddy/CheckoutScreen';
import SupportScreen from '../screens/daddy/SupportScreen';
import FeedbackScreen from '../screens/daddy/FeedbackScreen';
import OrderSuccessScreen from '../screens/daddy/OrderSuccessScreen';
import OffersScreen from '../screens/daddy/OrderDetailsScreen';
import CouponsScreen from '../screens/daddy/CouponsScreen';
import ServiceLocationsScreen from '../screens/daddy/ServiceLocationsScreen';
import PrivacyPolicyScreen from '../screens/daddy/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/daddy/TermsConditionsScreen';
import SelectServiceFromLocation from '../screens/daddy/SelectServiceFromLocation';
import ServicesAvailableScreen from '../screens/daddy/ServicesAvailableScreen';
import ServiceUnavailableScreen from '../screens/daddy/ServiceUnavailableScreen';
import Register from '../screens/daddy/Register';
import OTPVerification from '../screens/daddy/OTPVerification';
import LocationSelectionScreen from '../screens/daddy/LocationSelectionScreen';
import RefundPolicyScreen from '../screens/daddy/RefundPolicyScreen';
import CategoriesScreen from '../screens/daddy/CategoriesScreen';
import ProductDetailsScreen from '../screens/daddy/tabassets/ProductDetailsScreen';
import ByOncescreen from '../screens/daddy/tabassets/ByOncescreen';
import PlaceOrder from '../screens/daddy/tabassets/PlaceOrder';
import TrackOrder from '../screens/daddy/tabassets/TrackOrder';
import UserHome from '../screens/daddy/UserHome';
import Categories from '../screens/daddy/tabassets/Categories';
import SubscriptionPage from '../screens/daddy/tabassets/SubscriptionPage';
import EditSubscribe from '../screens/daddy/tabassets/EditSubscribe';
import ReorderScreen from '../screens/daddy/ReorderScreen';
import Wlletscreen from '../screens/daddy/tabassets/Wlletscreen';
import ViewTrack from '../screens/daddy/tabassets/ViewTrack';
import FullviewofCategoriesTab from '../screens/daddy/tabassets/FullviewofCategoriesTab';
import RechargeHistoryScreen from '../screens/daddy/tabassets/RechargeHistoryScreen';
import ApplyCuponScreen from '../screens/daddy/tabassets/ApplyCuponScreen';
import CouponDetailsScreen from '../screens/daddy/tabassets/CuponDetails';
import BillingHistory from '../screens/daddy/tabassets/BillingHistory';
import GroceriesScreen from '../screens/daddy/GroceriesScreen';
import MyFavoritesScreen from '../screens/daddy/MyFavoritesScreen';
import AboutUsScreen from '../screens/AboutUs';
import { WalletAPI } from '../services/services';
import { setWalletData } from '../redux/reducers/walletSlice';
import { useDispatch, useSelector } from 'react-redux';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';
import UserProfileScreen from '../screens/user/ProfileScreen';
import ReferAndEarnScreen from '../screens/ReferAndEarnScreen';

const Stack = createStackNavigator();

export default function RentalNavigation() {
  const dispatch = useDispatch();
  const { customerId } = useSelector(state => state.Auth);
 
  useEffect(() => {
    const fetchWallet = async () => {
      const data = await WalletAPI.getWalletAmounts(customerId);
      dispatch(setWalletData(data)); 
    };
    fetchWallet();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='BottomNavigation'>
      <Stack.Screen name='BottomNavigation' component={BottomNavigation} />
      <Stack.Screen name='RestaurantScreen' component={RestaurantScreen} />
      <Stack.Screen name='UserProfileScreen' component={UserProfileScreen} />
      <Stack.Screen name='CategorieItems' component={CategorieItems} />
      <Stack.Screen name='AddressList' component={AddressListScreen} />
      <Stack.Screen name='AddAddress' component={AddAddressScreen} />
      <Stack.Screen name='MoreDetails' component={MoreDetailsScreen} />
      <Stack.Screen name='Checkout' component={CheckoutScreen} />
      <Stack.Screen name='Support' component={SupportScreen} />
      <Stack.Screen name='Feedback' component={FeedbackScreen} />
      <Stack.Screen name='OrderSuccess' component={OrderSuccessScreen} />
      <Stack.Screen name='OffersScreen' component={OffersScreen} />
      <Stack.Screen name='Coupons' component={CouponsScreen} />
      <Stack.Screen name='ServiceLocations' component={ServiceLocationsScreen} />
      <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />
      <Stack.Screen name='TermsConditions' component={TermsConditionsScreen} />
      <Stack.Screen name='SelectServiceFromLocation' component={SelectServiceFromLocation} />
      <Stack.Screen name='ServicesAvailable' component={ServicesAvailableScreen} />
      <Stack.Screen name='ServiceUnavailable' component={ServiceUnavailableScreen} />
      <Stack.Screen name='AboutUsScreen' component={AboutUsScreen} />
      <Stack.Screen name='Register1' component={Register} />
      <Stack.Screen name='OTPVerification1' component={OTPVerification} />
      <Stack.Screen name='RefundPolicy' component={RefundPolicyScreen} />
      <Stack.Screen name='ProductDetailsScreen' component={ProductDetailsScreen} />
      <Stack.Screen name='ByOncescreen' component={ByOncescreen} />
      <Stack.Screen name='PlaceOrder' component={PlaceOrder} />
      <Stack.Screen name='TrackOrder' component={TrackOrder} />
      <Stack.Screen name='UserHome' component={UserHome} />
      <Stack.Screen name='Categories' component={Categories} />
      <Stack.Screen name='SubscriptionPage' component={SubscriptionPage} />
      <Stack.Screen name="SubscriptionDetails" component={SubscriptionDetailsScreen} />
      <Stack.Screen name='EditSubscribe' component={EditSubscribe} />
      <Stack.Screen name='FullviewofCategoriesTab' component={FullviewofCategoriesTab} />
      <Stack.Screen name='Wlletscreen' component={Wlletscreen} />
      <Stack.Screen name='ReorderScreen' component={ReorderScreen} />
      <Stack.Screen name='RechargeHistoryScreen' component={RechargeHistoryScreen} />
      <Stack.Screen name='ApplyCuponScreen' component={ApplyCuponScreen} />
      <Stack.Screen name='CouponDetailsScreen' component={CouponDetailsScreen} />
      <Stack.Screen name='BillingHistory' component={BillingHistory} />
      <Stack.Screen name='GroceriesScreen' component={GroceriesScreen} />
      <Stack.Screen name='ViewTrack' component={ViewTrack} />
      <Stack.Screen name='MyFavoritesScreen' component={MyFavoritesScreen}/>
      <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
      <Stack.Screen name="ReferAndEarnScreen" component={ReferAndEarnScreen} />    
      <Stack.Screen
        name="CategoriesScreen"
        component={CategoriesScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureDirection: 'vertical',
        }}
      />
    </Stack.Navigator>
  )
}