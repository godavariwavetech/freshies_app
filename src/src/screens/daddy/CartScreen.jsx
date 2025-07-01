import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderPick2 from './tabassets/HeaderPick2';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, removeFromCart} from '../../redux/reducers/daddy';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import LinearGradient from 'react-native-linear-gradient';
import CategoryInactive from './tabassets/CategoryInactive';
import CartInactive from './tabassets/CartInactive';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalSearch } from '../../redux/reducers/addressSlice';

const CartScreen = ({navigation,route}) => {
  const {cartItems, totalPrice} = useSelector(state => state.Dashboard);
  const {customerId,location} = useSelector(state => state.Auth);
  const dispatch = useDispatch();
  const timeoutRef = useRef();
  const { globalSearchResults } = useSelector(state => state.address);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    clearTimeout(timeoutRef.current);
    
    if (query.trim()) {
      timeoutRef.current = setTimeout(() => {
        dispatch(globalSearch({ searchText: query }));
      }, 500);
    }
  };

  const filteredCartItems = cartItems.filter(item =>
    globalSearchResults?.some(result => result.item_name === item.item_name) ||
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckout = () => {
    if (!customerId) {
      setShowLoginModal(true);
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
  };

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item));
  };

  const handleCheckoutPress = () => {
    if (!customerId) {
      setShowLoginModal(true);
    } else {
      navigation.navigate('AddressList', {isFromCart: true});
    }
  };


  const emptyScreen = navigateToCategories => {
    return (
      <View style={styles.emptyScreenContainer}>
        <Image
          source={require('../daddy/tabassets/shoppingCart.png')}
          resizeMode="contain"
          style={styles.emptyCartImage}
        />
        <Text style={styles.emptyScreenText}>
          Looks like you haven't added anything yet. Let's fix that!
        </Text>
        <TouchableOpacity
          onPress={navigateToCategories}
          style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Explore Items</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const navigateToCategories = () => {
    navigation.navigate('Categories');
  };

  const renderCartItem = ({item}) => {
    const eachPrice =
      Number(item.selling_price||item.actualitem_price) * Number(item.quantity);
    return (
      <View>
        <View style={styles.cartItem}>
          <Image
            source={{uri: item.item_image}}
            style={styles.foodImage}
          />
          <View style={styles.itemDetails}>
            <HeaderPick2 />
            <Text style={styles.foodName}>{item.item_name}</Text>
            <Text style={styles.foodPrice}>
              ₹ {item.selling_price||item.actualitem_price}
            </Text>
          </View>
          <View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => handleRemoveFromCart(item)}
                style={styles.quantityButton}>
                <AntDesign name="minus" size={16} color="#065E2C" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {item.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => handleAddToCart(item)}
                style={styles.quantityButton}>
                <AntDesign name="plus" size={16} color="#065E2C" />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemTotalPrice}>₹ {eachPrice}</Text>
          </View>
        </View>
        <View style={styles.dottedLineContainer}>
          {Array(20)
            .fill(0)
            .map((_, index) => (
              <View key={index} style={styles.dot} />
            ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
       <StatusBar style="light" backgroundColor="#D32F2F"/>
      {route.params?.isFromRestaurant ? (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={()=>navigation.goBack()}>
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cart</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate('Support')} style={styles.supportButton}>
            <Icon name="support-agent" size={30} color="grey" />
          </TouchableOpacity>
        </View>
      ) : (
        <LinearGradient
        colors={['#D32F2F', '#F7F2F2']}
          style={styles.gradientContainer}>
          <View style={styles.headerContainer}>
            <CartInactive color="#fff" />
            <Text style={styles.headerTitle}>Your Cart</Text>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Search items in cart..."
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <Icon name="search" size={24} color="#A3A3A3" style={styles.searchIcon} />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <MaterialIcons name="close" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      )}

      {/* <View style={styles.savingsBanner}>
        <MaterialCommunityIcons
          name="brightness-percent"
          color="#065E2C"
          size={15}
        />
        <Text style={styles.savingsText}> ₹200 saved from this order</Text>
      </View> */}

      {cartItems.length == 0 ? (
        emptyScreen(navigateToCategories)
      ) : (
        <View style={styles.cartContainer}>
          {/* <View style={styles.savingsBanner}>
            <MaterialCommunityIcons
              name="brightness-percent"
              color="#065E2C"
              size={15}
            />
            <Text style={styles.savingsText}> ₹200 saved from this order</Text>
          </View> */}
          <FlatList
            data={filteredCartItems}
            keyExtractor={item => item.id}
            renderItem={renderCartItem}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            )}
          />

          <View style={styles.bottomContainer}>
            <View style={styles.totalContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.addMoreContainer}>
                <Text style={styles.addMoreText}>+ Add more items</Text>
              </TouchableOpacity>
              <Text style={styles.totalPrice}>₹ {totalPrice}</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.addressText}>
                Please add delivery address to place order
              </Text>
              <TouchableOpacity
                onPress={handleCheckoutPress}
                style={styles.addressButton}>
                <Text style={styles.addressButtonText}>Proceed to checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showLoginModal && (
        <Modal visible={showLoginModal} transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Login Required</Text>
              <Text style={styles.modalText}>
                You need to be logged in to proceed to checkout
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLoginModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setShowLoginModal(false);
                    navigation.navigate('Register1',{isFromCart:true});
                  }}>
                  <Text style={styles.confirmButtonText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#065E2C',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(2),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  supportButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveHeight(3),
  },
  emptyCartImage: {
    width: responsiveWidth(70),
    height: responsiveHeight(40),
  },
  emptyScreenText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
    width: responsiveWidth(75),
    textAlign: 'center',
    lineHeight: 25,
  },
  exploreButton: {
    backgroundColor: '#D32F2F',
    width: responsiveWidth(80),
    paddingVertical: responsiveHeight(2),
    borderRadius: 8,
    marginTop: responsiveHeight(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cartContainer: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    gap: 3,
    justifyContent: 'center',
  },
  itemTotalPrice: {
    color: '#3D3D3D',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 3,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalPrice: {
    fontSize: 18,
    color: '#065E2C',
    fontWeight: '700',
  },
  gradientContainer: {
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: responsiveHeight(5),
    marginLeft: responsiveWidth(5),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    marginHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    height: 48,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 45,
    paddingRight: 40,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 5,
    zIndex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  foodImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
  },
  foodName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    width: '60%',
  },
  foodPrice: {
    fontSize: 16,
    color: '#065E2C',
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#065E2C',
    borderRadius: 6,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 5,
    color: '#065E2C',
  },
  addMoreContainer: {},
  addMoreText: {
    color: '#C3A710',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  addressText: {
    fontSize: 16,
    color: '#3D3D3D',
    marginBottom: 10,
    fontWeight: '400',
  },
  addressButton: {
    backgroundColor: '#D32F2F',
    height: 35,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  dottedLineContainer: {
    flexDirection: 'row',
    marginTop: 5,
    alignSelf: 'center',
  },
  dot: {
    width: 7,
    height: 2,
    backgroundColor: '#D8D8D8',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  savingsBanner: {
    width: responsiveWidth(90),
    alignSelf: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveHeight(1.5),
    borderWidth: 1,
    borderColor: '#065E2C',
    borderRadius: 8,
    gap: 8,
    marginVertical: responsiveHeight(2),
  },
  savingsText: {
    color: '#065E2C',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#D32F2F',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#A3A3A3',
  },
});

export default CartScreen;
