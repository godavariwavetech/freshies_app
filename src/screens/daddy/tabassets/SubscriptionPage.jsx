import React, { useState, useEffect } from 'react';
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

// Sample data for subscriptions with initial status
const initialSubscriptions = [
  {
    id: '1',
    category: 'Mutton',
    name: 'Mince (Keema)',
    weight: '500gms',
    frequency: 'Alternate days',
    image: require('../../daddy/tabassets/keema.png'),
    status: 'paused',
  },
  {
    id: '2',
    category: 'Mutton',
    name: 'Liver',
    weight: '500gms',
    frequency: 'Daily',
    image: require('../../daddy/tabassets/keema.png'),
    status: 'paused',
  },
  {
    id: '3',
    category: 'Mutton',
    name: 'Boneless',
    weight: '500gms',
    frequency: 'Custom',
    image: require('../../daddy/tabassets/keema.png'),
    status: 'paused',
  },
];

const MySubscriptionScreen = ({ navigation, route }) => {
  const backgroundColor = '#6A48D2';
  const [subscriptions, setSubscriptions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [actionType, setActionType] = useState('resume');
  const [isLoading, setIsLoading] = useState(true);

  // Load subscribed products from AsyncStorage
  useEffect(() => {
    const loadSubscribedProducts = async () => {
      try {
        setIsLoading(true);
        let existingSubscriptions = [];
        const existingSubscriptionsJson = await AsyncStorage.getItem('subscribedProducts');
        if (existingSubscriptionsJson) {
          existingSubscriptions = JSON.parse(existingSubscriptionsJson);
        }

        let newSubscription = null;
        const storedProductJson = await AsyncStorage.getItem('subscribedProduct');
        
        if (storedProductJson) {
          const storedProduct = JSON.parse(storedProductJson);
          
          newSubscription = {
            id: storedProduct.id,
            category: route.params?.getCategories 
              ? route.params.getCategories(storedProduct.category, storedProduct.status)
              : storedProduct.category,
            name: storedProduct.name,
            weight: storedProduct.defaultWeight,
            frequency: 'Select Frequency',
            image: storedProduct.image,
            status: 'paused',
            brand: storedProduct.brand,
            price: storedProduct.price,
          };
        } else if (route.params?.productDetails) {
          const { productDetails, getCategories } = route.params;
          newSubscription = {
            id: productDetails.id,
            category: getCategories(productDetails.category, productDetails.status),
            name: productDetails.name,
            weight: productDetails.defaultWeight,
            frequency: 'Select Frequency',
            image: productDetails.image,
            status: 'paused',
            brand: productDetails.brand,
            price: productDetails.price,
          };
        }

        if (newSubscription) {
          const isAlreadySubscribed = existingSubscriptions.some(
            sub => sub.id === newSubscription.id
          );
          
          if (!isAlreadySubscribed) {
            existingSubscriptions.push(newSubscription);
            
            await AsyncStorage.setItem(
              'subscribedProducts',
              JSON.stringify(existingSubscriptions)
            );

            await AsyncStorage.removeItem('subscribedProduct');
          }
        }

        setSubscriptions(existingSubscriptions);
      } catch (error) {
        console.error('Error loading subscribed products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscribedProducts();
  }, [route.params]);

  // Handle Resume/Pause toggle
  const handleToggleStatus = (item) => {
    setSelectedSubscription(item);
    setActionType(item.status === 'paused' ? 'resume' : 'pause');
    setModalVisible(true);
  };

  // Confirm Resume/Pause action
  const confirmAction = async () => {
    const updatedSubscriptions = subscriptions.map((sub) =>
      sub.id === selectedSubscription.id
        ? { ...sub, status: actionType === 'resume' ? 'resumed' : 'paused' }
        : sub
    );

    setSubscriptions(updatedSubscriptions);
    await AsyncStorage.setItem('subscribedProducts', JSON.stringify(updatedSubscriptions));

    setModalVisible(false);
    setSelectedSubscription(null);
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
    <View style={styles.cardContainer}>
      {/* Image Section */}
      <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

      {/* Details Section */}
      <View style={styles.cardDetails}>
        {/* Category and Frequency Row */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <View style={styles.frequencyWrapper}>
            <View style={styles.frequencyDot} />
            <Text style={styles.frequencyText}>{item.frequency}</Text>
          </View>
        </View>

        {/* Name and Weight */}
        <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.cardWeight}>{item.weight}</Text>
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
              name={item.status === 'paused' ? 'play-arrow' : 'pause'}
              size={wp('4%')}
              color={backgroundColor}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: backgroundColor }]}>
              {item.status === 'paused' ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: backgroundColor }]}
            onPress={() => navigation.navigate('EditSubscribe', { subscription: item })}
          >
            <Icon name="edit" size={wp('4%')} color={backgroundColor} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: backgroundColor }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Subscription</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      {/* Subscription List */}
      {isLoading ? (
        renderLoadingIndicator()
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderSubscriptionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>No Subscriptions</Text>
              <Text style={styles.emptyStateSubtitle}>
                You haven't subscribed to any products yet.
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.exploreButtonText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          )}
        />
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
              Are you sure you want to {actionType} this subscription for{' '}
              {selectedSubscription?.name}?
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
    backgroundColor: '#6A48D2',
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: hp('2%'),
    padding: wp('3%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: 8,
    marginRight: wp('3%'),
    backgroundColor: '#f0f0f0',
    alignSelf: 'center', // Vertically center the image
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
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
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6A48D2',
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
    color: '#6A48D2',
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
    backgroundColor: '#6A48D2',
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
    backgroundColor: '#6A48D2',
    borderRadius: 10,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
});

export default MySubscriptionScreen;