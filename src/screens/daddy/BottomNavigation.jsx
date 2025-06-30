import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, Image, Pressable, Platform, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { tab1 } from './tabassets';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import User from './User';
import HomeSvg from './HomeSvg';
import Categoreis from './Categories';
import Cart from './Cart';
import UserHome from './UserHome';
import CartScreen from './CartScreen';
import BuyOncescreen from '../daddy/tabassets/ByOncescreen'
import HomeInactive from './tabassets/HomeInactive';
import ReorderInactive from './tabassets/ReorderInactive'; // Updated SVG
import CategoryInactive from './tabassets/CategoryInactive';
import CartInactive from './tabassets/CartInactive';
import UserActive from './tabassets/UserActive';
import ReorderScreen from './ReorderScreen';
import ProfileScreen from './ProfileScreen';
import CategoriesScreen from './CategoriesScreen';
import { useDispatch, useSelector } from 'react-redux';
import ProfileSvg from './tabassets/ProfileSvg';
import SubscriptionPage from '../daddy/tabassets/SubscriptionPage';
// import RechargeHistoryScreen from '../daddy/tabassets/RechargeHistoryScreen';
import ProductDetailsScreen from '../daddy/tabassets/ProductDetailsScreen';
import PreviousOrdersScreen from '../PreviousOrdersScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserData } from '../../services/services';
import { setUseDetails } from '../../redux/reducers/auth';
const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.Dashboard);
  const { customerId } = useSelector(state => state.Auth);
 

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const res = await getUserData({ customer_id: customerId });
        console.log("response0000", res.data[0])
        if (res.status === 200 && res.data?.length > 0) {
          
          const user = res.data[0];
          console.log("user0000000000000000000000000000000000000", user)
          dispatch(setUseDetails(user))
        }
      } catch (err) {
        console.log('Error storing userDetails:', err.message);
      }
    };
    getUserProfile();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: props => (
          <Pressable
            {...props}
            android_ripple={null}
            style={({ pressed }) => [
              props.style,
              { opacity: pressed ? 1 : 1 },
            ]}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? <HomeSvg color={'#4B3395'} /> : <HomeInactive />;
          } else if (route.name === 'Reorder') {
            iconName = focused ? (
              <ReorderInactive color={'#4B3395'} />
            ) : (
              <ReorderInactive color={'gray'} />
            );
          } else if (route.name === 'Categories') {
            iconName = focused ? (
              <CategoryInactive color={'#4B3395'} />
            ) : (
              <Categoreis />
            );
          } else if (route.name === 'Cart') {
            iconName = (
              <View>
                {focused ? <CartInactive color={'#4B3395'} /> : <Cart />}
                {cartItems.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItems.length}</Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === 'Profile') {
            iconName = focused ? (
              <ProfileSvg color={'#4B3395'} />
            ) : (
              <ProfileSvg color={'gray'} />
            );
          } else if (route.name === 'PreviousOrdersScreen') {
            iconName = (
              <Ionicons
                name={focused ? 'receipt' : 'receipt-outline'} // example icon
                size={24}
                color={focused ? '#4B3395' : 'gray'}
              />
            );
          }
        
          return iconName;
        },

        tabBarActiveTintColor: '#4B3395',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '400' },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 60,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
        },
        tabBarHideOnKeyboard: true,
        contentStyle: {},
      })}>
      <Tab.Screen
        name="Home"
        component={UserHome}
        options={{
          tabBarLabel: 'Home',
          contentStyle: {},
        }}
      />
      <Tab.Screen
        name="Reorder"
        component={SubscriptionPage}
        options={{
          tabBarLabel: 'Subscriptions',
          contentStyle: {},
        }}
      />
      {/* <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          contentStyle: {},
        }}
      /> */}
      {/* <Tab.Screen
        name="Cart"
        component={BuyOncescreen}
        options={{
          tabBarLabel: 'Cart',
          contentStyle: {},
        }}
      /> */}
      <Tab.Screen
        name="PreviousOrdersScreen"
        component={PreviousOrdersScreen}
        options={{
          tabBarLabel: 'Orders', // shorter label
        }}
      />
       <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          contentStyle: {},
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: "#8655d2",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});