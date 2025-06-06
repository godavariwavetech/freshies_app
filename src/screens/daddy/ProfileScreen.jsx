import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../../components/CustomModal';
import { actionLogout } from '../../redux/reducers/auth';
import { clearCart, getOrders } from '../../redux/reducers/daddy';
import VersionCheck from 'react-native-version-check';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { customerId } = useSelector(state => state.Auth);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userDetails } = useSelector(state => state.address);
  const [orders, setOrders] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  
  // Favorites state
  const [favorites, setFavorites] = useState([]);

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  const getOrdersData = async () => {
    try {
      setIsLoading(true);
      const response = await dispatch(getOrders({ orderId: 0 }));
      response.payload.data.length > 0 && setOrders([response.payload.data[0]]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOrdersData();
  }, []);

  useEffect(() => {
    const getVersion = async () => {
      try {
        const version = await VersionCheck.getCurrentVersion();
        console.log('>>>>>>>>>>>>>>>>MNMNMNMMNMNM', version);
        setAppVersion(version);
      } catch (error) {
        console.log('Error getting app version:', error);
      }
    };
    getVersion();
  }, []);

  const STATUS_MAP = {
    0: 'Order Placed',
    1: 'Order Accepted',
    2: 'Preparing Your Order',
    3: 'Order Completed',
    4: 'Order Cancelled by You',
    5: 'Order Rejected by Restaurant',
    6: 'Order Not Received',
    7: 'Waiting for Payment',
    8: 'Delivery Partner Assigned',
  };

  const getOrderStatus = status => {
    return STATUS_MAP[status] || 'Unknown Status';
  };

  const getStatusColor = status => {
    const colorMap = {
      0: '#6A48D2', // Order Placed - Yellow
      1: '#6A48D2', // Order Accepted - Green
      2: '#6A48D2', // Preparing - Green
      3: '#6A48D2', // Completed - Green
      4: '#FF4B4B', // Cancelled - Red
      5: '#FF4B4B', // Rejected - Red
      6: '#FF4B4B', // Not Received - Red
      7: '#6A48D2', // Waiting Payment - Yellow
      8: '#6A48D2', // Delivery Assigned - Green
    };
    return colorMap[status] || '#666'; // Default gray
  };

  const handleUpdate = async () => {
    try {
      await Linking.openURL(
        'https://play.google.com/store/apps/details?id=com.localdaddy',
      );
    } catch (error) {
      console.log('Play Store error:', error);
    } finally {
      setShowUpdateModal(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(actionLogout());
    dispatch(clearCart());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleCheckForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate();
      if (res.isNeeded) {
        setShowUpdateModal(true);
      } else {
        setUpdateModalVisible(true); // Show "latest version" modal
        setShowUpdateModal(false); // Ensure update modal is hidden
      }
    } catch (error) {
      console.log('Update check failed:', error);
      setUpdateModalVisible(true); // Show error message
      setShowUpdateModal(false);
    }
  };

  // Commented out renderOrder function
  /*
  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: responsiveHeight(0.5),
        }}>
        <Text style={styles.orderId}>Order ID: {item?.order_id}</Text>
        <Text
          style={[
            styles.orderStatus,
            { color: getStatusColor(item?.order_status) },
          ]}>
          {getOrderStatus(item?.order_status)}
        </Text>
      </View>

      <Text style={styles.orderDetails} numberOfLines={1}>
        Delivered to:{' '}
        <Text style={{ fontWeight: '400' }} numberOfLines={1}>
          {item?.delivery_address}
        </Text>
      </Text>

      <Text style={styles.orderDate}>
        {item?.order_date} at {item?.order_time}
      </Text>

      <View style={styles.restaurantInfo}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: responsiveHeight(1),
          }}>
          <Image
            source={require('../daddy/tabassets/restaurant.png')}
            style={styles.restaurantIcon}
          />
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item?.restaurant_name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() =>
            navigation.navigate('ReorderScreen', {
              orderDetails: item,
            })
          }>
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() =>
          navigation.navigate('OrderDetailsScreen', {
            orderDetails: item,
          })
        }>
        <Text style={styles.viewDetailsButtonText}>View Details</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
  */

  const menuItems = [
    {
      id: '1',
      title: 'About Us',
      icon: (
        <MaterialCommunityIcons
          name="information-outline"
          size={24}
          color="#6A48D2"
        />
      ),
      onPress: () => navigation.navigate('AboutUs'),
    },
    {
      id: '2',
      title: 'Address List',
      icon: <Ionicons name="clipboard-outline" size={24} color="#6A48D2" />,
      onPress: () => navigation.navigate('AddressList'),
    },
    {
      id: '3',
      title: 'My Favorites',
      icon: <Icon name="favorite" size={24} color="#6A48D2" />,
      onPress: () => navigation.navigate('MyFavoritesScreen'),
    },
    {
      id: '4',
      title: 'Support',
      icon: <Feather name="user" size={24} color="#6A48D2" />,
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: '5',
      title: 'Give Feedback',
      icon: (
        <MaterialCommunityIcons
          name="card-bulleted-outline"
          size={24}
          color="#6A48D2"
        />
      ),
      onPress: () => navigation.navigate('Feedback'),
    },
    {
      id: '6',
      title: 'Privacy Policy',
      icon: (
        <MaterialCommunityIcons
          name="shield-account"
          size={24}
          color="#6A48D2"
        />
      ),
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: '7',
      title: 'Terms and Conditions',
      icon: (
        <MaterialCommunityIcons
          name="file-document"
          size={24}
          color="#6A48D2"
        />
      ),
      onPress: () => navigation.navigate('TermsConditions'),
    },
    {
      id: '8',
      title: 'Refund Policy',
      icon: (
        <MaterialCommunityIcons
          name="credit-card-refund-outline"
          size={24}
          color="#6A48D2"
        />
      ),
      onPress: () => navigation.navigate('RefundPolicy'),
    },
    {
      id: '9',
      title: 'Check for Updates',
      icon: <MaterialCommunityIcons name="update" size={24} color="#6A48D2" />,
      onPress: handleCheckForUpdate,
    }, {
          id: '10',
          title: 'Logout',
          icon: <Feather name="log-out" size={24} color="#6A48D2" />,
          onPress: () => setLogoutModalVisible(true),
        }
      
  ];

  console.log(orders, '+++++++++++++++++>>>>ORDERS');

  // Render favorites preview
  const renderFavoritesPreview = () => {
    const previewFavorites = favorites.slice(0, 4); // Show first 4 favorites

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          {/* <Text style={styles.sectionTitle}>My Favorites</Text> */}
          {favorites.length > 0 && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('FavoritesScreen')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="chevron-right" size={20} color="#6A48D2" />
            </TouchableOpacity>
          )}
        </View>
        
      
      </View>
    );
  };

  const renderRecentOrder = () => {
    const [recentOrder, setRecentOrder] = useState(null);

    useEffect(() => {
      const fetchRecentOrder = async () => {
        try {
          const ordersJson = await AsyncStorage.getItem('trackOrders');
          const orders = ordersJson ? JSON.parse(ordersJson) : [];
          
          // Get the most recent order (last item in the array)
          if (orders.length > 0) {
            const latestOrder = orders[orders.length - 1];
            setRecentOrder(latestOrder);
          }
        } catch (error) {
          console.error('Error fetching recent order:', error);
        }
      };

      fetchRecentOrder();
    }, []);

    if (!recentOrder) return null;

    return (
      <View style={styles.recentOrderContainer}>
        <View style={styles.recentOrderHeader}>
          <Text style={styles.recentOrderTitle}>Your Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TrackOrder')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentOrder && (
          <TouchableOpacity 
            style={styles.recentOrderItem}
            onPress={() => navigation.navigate('TrackOrder', { 
              orderDetails: recentOrder, 
              status: 0 
            })}
          >
            <View style={styles.recentOrderDetails}>
              <Text style={styles.recentOrderId}>
                Order ID: {recentOrder.orderId}
              </Text>
              <Text style={styles.recentOrderPrice}>
                Total: ₹{recentOrder.totalPrice?.toFixed(2) || 'N/A'}
              </Text>
            </View>
            <View style={styles.recentOrderItemsPreview}>
              {recentOrder.items?.slice(0, 2).map((item, index) => (
                <View key={index} style={styles.recentOrderItemPreview}>
                  <Text style={styles.recentOrderItemName}>
                    {item.name} (x{item.quantity})
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={getOrdersData}
          colors={['#6A48D2']}
        />
      }
    >
      <StatusBar backgroundColor="#6A48D2" barStyle="light-content" />
      
      <LinearGradient
        colors={['#6A48D2', '#F7F2F2']}
        style={styles.gradientContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: responsiveHeight(5),
            marginLeft: responsiveWidth(5),
          }}>
          <Image
            source={{
              uri: 'https://skiblue.co.uk/wp-content/uploads/2015/06/dummy-profile.png',
            }}
            style={{
              width: responsiveWidth(10),
              height: responsiveWidth(10),
              borderRadius: 100,
            }}
          />
          <Text style={styles.profileName}>
            {userDetails?.name || 'Hello User'}
          </Text>
        </View>
      </LinearGradient>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.ordersHeader}>
          <Text style={styles.ordersTitle}>Your Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TrackOrder')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {/* Commented out order section */}
        {/*
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderHistoryScreen')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#6A48D2" />
          ) : orders.length > 0 ? (
            <FlatList
              data={orders}
              renderItem={renderOrder}
              keyExtractor={item => item?.order_id?.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.orderListContainer}
            />
          ) : (
            <Text style={styles.noOrdersText}>No recent orders</Text>
          )}
        </View>
        */}
        <View style={styles.menuOptions}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItemMain}
              onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={[styles.menuText]}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              App Version: {appVersion || '1.0.0'}
            </Text>
          </View>
        </View>
        {/* Favorites Preview Section */}
        {renderFavoritesPreview()}
        {renderRecentOrder()}
      </ScrollView>
      <CustomModal
        visible={updateModalVisible}
        title={showUpdateModal ? 'Update Available' : 'App Updated'}
        message={
          showUpdateModal
            ? 'A new version is available. Please update now!'
            : "You're using the latest version of Local Daddy"
        }
        confirmText="OK"
        onConfirm={() => setUpdateModalVisible(false)}
        showCancel={false}
        cancelText=""
      />
      <CustomModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        confirmText="Logout"
        cancelText="Cancel"
      />
      <CustomModal
        visible={showUpdateModal}
        title="Update Available"
        message="A new version of Local Daddy is available. Please update to continue using all features."
        confirmText="Update Now"
        onConfirm={handleUpdate}
        onCancel={() => setShowUpdateModal(false)}
        cancelText="Later"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'ios' ? 85 : 60, // Add padding for tab bar
  },
  header: { padding: 20, backgroundColor: '#6A48D2', alignItems: 'center' },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  ordersTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAll: { color: '#6A48D2', fontWeight: 'bold' },
  orderCard: {
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    // elevation: 3
  },
  orderId: { fontSize: 14, fontWeight: '500', color: '#3D3D3D' },
  orderStatus: { color: '#6A48D2', fontWeight: '600', fontSize: 14 },
  orderDetails: {
    fontSize: 12,
    color: '#3D3D3D',
    fontWeight: '600',
    width: responsiveWidth(65),
    marginBottom: responsiveHeight(0.3),
  },
  orderDate: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '400',
    marginBottom: responsiveHeight(0.3),
  },
  restaurantInfo: { marginVertical: 0 },
  restaurantName: { fontSize: 16, fontWeight: 'bold' },
  menuItem: { fontSize: 14, color: '#555' },
  price: {
    fontSize: 16,
    color: '#6A48D2',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 10,
  },
  reorderButton: {
    backgroundColor: '#fff',
    // padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A3A3A3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    width: responsiveWidth(38),
    // paddingHorizontal:20
  },
  rateButton: {
    backgroundColor: '#00773F',
    // padding: 5,
    borderRadius: 5,
    width: responsiveWidth(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#A3A3A3', fontWeight: 'bold' },
  menuOptions: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 85 : 60, // Add extra padding to menu options
  },
  menuItemMain: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#A3A3A3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(3),
  },
  menuText: { fontSize: 16, color: '#000', fontWeight: '600', textAlign: 'left' },
  gradientContainer: {
    paddingVertical: 20,
  },
  dottedLineContainer: {
    flexDirection: 'row',
    marginTop: responsiveHeight(2),
    alignSelf: 'center',
  },
  dot: {
    width: 5, // Dot size
    height: 2,
    backgroundColor: '#D8D8D8', // Dot color
    borderRadius: 5, // Makes it circular
    marginHorizontal: 5, // Space between dots
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 20,
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#313131',
    marginTop: 15,
    marginBottom: 5,
  },
  noOrdersSubText: {
    fontSize: 14,
    color: '#A3A3A3',
    textAlign: 'center',
  },
  versionContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 7,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    left: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#6A48D2',
    fontWeight: '500',
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginPrompt: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6A48D2',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  // Favorites section styles
  sectionContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#6A48D2',
    fontSize: 14,
    marginRight: 5,
  },
  emptyFavoritesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyFavoritesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptyFavoritesSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  favoritesScrollView: {
    paddingHorizontal: 5,
  },
  favoriteItemCard: {
    width: 120,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  favoriteItemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  favoriteItemName: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  favoriteItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A48D2',
  },
  recentOrderContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentOrderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recentOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentOrderDetails: {
    flexDirection: 'column',
  },
  recentOrderId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3D3D3D',
  },
  recentOrderPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A48D2',
  },
  recentOrderItemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentOrderItemPreview: {
    padding: 5,
  },
  recentOrderItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    color: '#6A48D2',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;