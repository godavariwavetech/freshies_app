import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteSubscriptionOrder, getSubscriptionOrders, toggleSubscriptionStatus } from '../../../services/services';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';


const MySubscriptionScreen = ({ navigation, route }) => {
  const backgroundColor = '#8655d2';
  const [subscriptions, setSubscriptions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [actionType, setActionType] = useState('resume');
  const { customerId } = useSelector(state => state.Auth);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSubscribedProductsFromAPI();
  }, [route.params]);

  // Refresh data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSubscribedProductsFromAPI();
    }, [customerId])
  );

  const loadSubscribedProductsFromAPI = async () => {
    try {
      setRefreshing(true);
      const response = await getSubscriptionOrders({ customer_id: customerId });
      console.log("subscription orders", response);
      if (response?.status === 200 && Array.isArray(response.data)) {
        // Format data to match your local UI expectations if needed
        
        const subscriptions = response.data.map(item => ({
          id: item.id,
          name: item.item_name,
          category: item.sub_category_name,
          weight: item.quantity_type ?? '', // fallback if null
          frequency: item.subscription_type,
          image: item.item_image, // Add image if available in API
          status: item.subscription_status === 0 ? 'active' : item.subscription_status === 2 ? 'insufficient_wallet' : 'paused', // 0 = active, 1 = paused, 2 = insufficient wallet
          brand: '', // Add brand if available
          price: item.selling_price,
          orderDate: item.orderdate,
          startDate: item.startdate,
          orderId: item.order_id, // Add order_id to the mapping
        }));

        // Sort by orderDate (most recent first)
        // Parse DD-MM-YYYY format correctly
        const parseDate = (dateString) => {
          if (!dateString) return new Date(0); // Return epoch date for invalid dates
          const [day, month, year] = dateString.split('-');
          return new Date(year, month - 1, day); // month is 0-indexed in Date
        };

        const sortedSubscriptions = subscriptions.sort((a, b) => {
          const dateA = parseDate(a.orderDate);
          const dateB = parseDate(b.orderDate);
          return dateB - dateA; // Descending order (newest first)
        });

        setSubscriptions(sortedSubscriptions);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const handleDeleteSubscription = async (item) => {
    try {
      const res = await deleteSubscriptionOrder(item.id);
 
      if (res.status === 200 && res.data.affectedRows > 0) {
        setSubscriptions(prev => prev.filter(sub => sub.id !== item.id));
        Toast.show({ type: 'success', text1: 'Subscription deleted!' });
      } else {
        Toast.show({ type: 'error', text1: 'Delete failed. Item might not exist.' });
      }
    } catch (error) {
      console.error('API delete error:', error);
      Toast.show({ type: 'error', text1: 'Failed to delete subscription.' });
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Handle Resume/Pause toggle
  const handleToggleStatus = (item) => {
    if (item.status === 'insufficient_wallet') {
      // Navigate to wallet screen or show wallet top-up option
      Toast.show({
        type: 'info',
        text1: 'Insufficient Wallet Balance',
        text2: 'Please add money to your wallet to resume subscription',
      });
      // You can navigate to wallet screen here
      // navigation.navigate('Wallet');
      return;
    }
    setSelectedSubscription(item);
    setActionType(item.status === 'paused' ? 'resume' : 'pause');
    setModalVisible(true);
  };

  // Confirm Resume/Pause action
  const confirmAction = async () => {
    try {
      const isResume = actionType === 'resume';
      const res = await toggleSubscriptionStatus(selectedSubscription.id, isResume);

      if (res.status === 200 || res.status === 202) {
        const updatedStatus = isResume ? 'resumed' : 'paused';
        // Update state
        const updatedSubscriptions = subscriptions.map((sub) =>
          sub.id === selectedSubscription.id ? { ...sub, status: updatedStatus } : sub
        );
        setSubscriptions(updatedSubscriptions);
        Toast.show({
          type: 'success',
          text1: isResume ? 'Subscription resumed!' : 'Subscription paused!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Action failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Toggle subscription error:', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred.',
      });
    } finally {
      setModalVisible(false);
      setSelectedSubscription(null);
    }
  };

  // Render loading indicator
  const renderLoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={backgroundColor}
        style={styles.loadingIndicator}
      />
      <Text style={styles.loadingText}>Loading Subscriptions...</Text>
    </View>
  );

  // Render each subscription card
  const renderSubscriptionItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('SubscriptionDetails', { item })}>
      <View style={styles.cardContainer}>
        {/* Order ID and Subscription Type Row */}
        <View style={styles.orderIdTopRow}>
          <View style={styles.orderIdSection}>
            <Text style={styles.orderIdLabel}>Order ID:</Text>
            <Text style={styles.orderIdValue}>{item.orderId}</Text>
          </View>
          <View style={styles.frequencyWrapper}>
            <View style={styles.frequencyDot} />
            <Text style={styles.frequencyText}>{item.frequency}</Text>
          </View>
        </View>

        {/* Image and Details Row */}
        <View style={styles.cardContentRow}>
          {/* Image Section */}
          <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

          {/* Details Section */}
          <View style={styles.cardDetails}>

          {/* Category Row */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </View>

          {/* Name and Weight */}
          <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {item.weight && (
            <Text style={styles.cardWeight}>{item.weight}</Text>
          )}
          <Text>
            <Text style={styles.cardWeight}>Start Date: </Text>
            <Text style={{ fontSize: 14, color: '#333' }}>{item.startDate}</Text>
          </Text>
          <Text>
            <Text style={styles.cardWeight}>Order Date: </Text>
            <Text style={{ fontSize: 14, color: '#333' }}>{item.orderDate}</Text>
          </Text>

          {item.brand && (
            <Text style={styles.cardBrand} numberOfLines={1} ellipsizeMode="tail">
              {item.brand}
            </Text>
          )}
          {item.price && (
            <Text style={styles.cardPrice}>₹{item.price.toFixed(2)}</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: backgroundColor }]}
              onPress={() => handleToggleStatus(item)}
            >
              <Icon
                name={item.status === 'paused' ? 'play-arrow' : item.status === 'insufficient_wallet' ? 'account-balance-wallet' : 'pause'}
                size={wp('4%')}
                color={backgroundColor}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: backgroundColor }]}>
                {item.status === 'paused' ? 'Resume' : item.status === 'insufficient_wallet' ? 'Add Wallet' : 'Pause'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: 'red' }]}
              onPress={() => setShowDeleteConfirm(item)} // handle confirm
            >
              <Icon name="delete" size={wp('4%')} color="red" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: 'red' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor,paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.navigate('BottomNavigation', { screen: 'Home' })}>
          <Icon name="arrow-back" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Subscriptions</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      {/* Subscription List */}
      {refreshing ? (
        renderLoadingIndicator()
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderSubscriptionItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={loadSubscribedProductsFromAPI}
          ListEmptyComponent={() => (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>No Subscriptions</Text>
              <Text style={styles.emptyStateSubtitle}>
                You haven't subscribed to any products yet.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.exploreButtonText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>⚠️ Are you sure?</Text>
            <Text style={styles.confirmMessage}>
              This will remove the subscription for "{showDeleteConfirm.name}".
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#ccc' }]}
                onPress={() => setShowDeleteConfirm(null)}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: 'red' }]}
                onPress={() => handleDeleteSubscription(showDeleteConfirm)}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal for Confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {actionType === 'resume' ? 'Resume Subscription' : 'Pause Subscription'}
            </Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to{' '}
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Text>{' '}
              this subscription for {selectedSubscription?.name}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.okButton, { backgroundColor }]}
                onPress={confirmAction}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#8655d2',
    paddingVertical: hp('4%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: hp('2%'),
    padding: wp('3%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardImage: {
    width: wp('24%'),
    height: wp('29%'),
    borderRadius: 8,
    marginRight: wp('3%'),
    backgroundColor: '#f0f0f0',
    alignSelf: 'center', // Vertically center the image
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderIdTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  orderIdSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContentRow: {
    flexDirection: 'row',
  },
  orderIdLabel: {
    fontSize: wp('3.2%'),
    color: '#666',
    fontWeight: '600',
    marginRight: wp('2%'),
  },
  orderIdValue: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  cardCategory: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontWeight: '600',
  },
  frequencyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequencyDot: {
    width: wp('1.5%'),
    height: wp('1.5%'),
    borderRadius: wp('0.75%'),
    backgroundColor: '#D32F2F',
    marginRight: wp('1.5%'),
  },
  frequencyText: {
    fontSize: wp('3.5%'),
    color: '#D32F2F',
    fontWeight: '500',
  },
  cardName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: hp('0.5%'),
  },
  cardWeight: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  cardBrand: {
    fontSize: wp('3.5%'),
    color: '#888',
    marginBottom: hp('0.5%'),
  },
  cardPrice: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: hp('0.5%'),
    marginTop: 4
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8655d2',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    marginHorizontal: wp('1%'),
  },
  buttonIcon: {
    marginRight: wp('1.5%'),
  },
  buttonText: {
    color: '#8655d2',
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('5%'),
    width: wp('80%'),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: hp('2%'),
  },
  modalMessage: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: wp('2%'),
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  okButton: {
    backgroundColor: '#8655d2',
  },
  modalButtonText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#222',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  emptyStateTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('1%'),
  },
  emptyStateSubtitle: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  loadingIndicator: {
    marginBottom: hp('2%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#666',
    fontWeight: '500',
  },
  exploreButton: {
    marginTop: hp('2%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#8655d2',
    borderRadius: 10,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99
  },
  confirmBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d32f2f'
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MySubscriptionScreen;