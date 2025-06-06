// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   ScrollView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const { width } = Dimensions.get('window');

// const productsData = [
//   {
//     id: '1',
//     name: 'Fresh Chicken Breast',
//     quantity: '500 GM',
//     price: '₹250.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Chicken',
//   },
//   {
//     id: '2',
//     name: 'Chicken Drumsticks',
//     quantity: '1 KG',
//     price: '₹450.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Chicken',
//   },
//   {
//     id: '3',
//     name: 'Mutton Leg Piece',
//     quantity: '500 GM',
//     price: '₹600.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Mutton',
//   },
//   {
//     id: '4',
//     name: 'Mutton Curry Cut',
//     quantity: '1 KG',
//     price: '₹1100.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Mutton',
//   },
//   {
//     id: '5',
//     name: 'Rohu Fish',
//     quantity: '1 KG',
//     price: '₹300.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Fish',
//   },
//   {
//     id: '6',
//     name: 'Pomfret Fish',
//     quantity: '500 GM',
//     price: '₹500.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Fish',
//   },
//   {
//     id: '7',
//     name: 'Tiger Prawns',
//     quantity: '500 GM',
//     price: '₹700.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Prawn',
//   },
//   {
//     id: '8',
//     name: 'White Prawns',
//     quantity: '250 GM',
//     price: '₹350.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Prawn',
//   },
//   {
//     id: '9',
//     name: 'Salmon Fillet',
//     quantity: '500 GM',
//     price: '₹900.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Seafood',
//   },
//   {
//     id: '10',
//     name: 'Crab Meat',
//     quantity: '500 GM',
//     price: '₹600.00',
//     image: require('../../daddy/tabassets/keema.png'),
//     category: 'Seafood',
//   },
// ];

// const ProductsPage = ({ navigation }) => {
//   const [selectedTab, setSelectedTab] = useState('Chicken');
//   const tabs = ['Chicken', 'Mutton', 'Fish', 'Prawn', 'Seafood'];

//   const filteredProducts = productsData.filter(
//     (product) => product.category === selectedTab
//   );

//   const renderProductItem = ({ item }) => (
//     <View style={styles.productCard}>
//       <Image source={item.image} style={styles.productImage} />
//       <View style={styles.productDetails}>
//         <Text style={styles.productName}>{item.name}</Text>
//         {item.quantity ? (
//           <Text style={styles.productQuantity}>{item.quantity}</Text>
//         ) : null}
//         <Text style={styles.productPrice}>{item.price}</Text>
//         <View style={styles.actionButtons}>
//           <TouchableOpacity style={styles.subscribeButton} onPress={() => {navigation.navigate("SubscriptionPage")}}>
//             <Text style={styles.buttonText}>Subscribe</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.buyButton} onPress={() => {navigation.navigate("ByOncescreen")}}>
//             <Text style={styles.buttonText2}>Buy Once</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={24} color="#000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Meat</Text>
//         </View>
//       </View>
//       <View style={styles.tabsWrapper}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.tabsContainer}
//         >
//           {tabs.map((tab) => (
//             <TouchableOpacity
//               key={tab}
//               onPress={() => setSelectedTab(tab)}
//               style={[styles.tab, { width: width / 3 }]}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   selectedTab === tab && styles.tabTextActive,
//                 ]}
//                 numberOfLines={1}
//                 ellipsizeMode="tail"
//               >
//                 {tab}
//               </Text>
//               {selectedTab === tab && <View style={styles.tabIndicator} />}
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       <FlatList
//         data={filteredProducts}
//         renderItem={renderProductItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.productList}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>
//             No products available in this category.
//           </Text>
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginLeft: 8, // Reduced spacing between icon and text
//   },
//   tabsWrapper: {
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     paddingVertical: 8,
//   },
//   tab: {
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   tabTextActive: {
//     color: '#D32F2F',
//     fontWeight: 'bold',
//   },
//   tabIndicator: {
//     width: 60,
//     height: 3,
//     backgroundColor: '#D32F2F',
//     marginTop: 4,
//     borderRadius: 2,
//   },
//   productList: {
//     padding: 16,
//   },
//   productCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     gap:5
//   },
//   productImage: {
//     width: 100,
//     height: 100,
//     resizeMode: 'contain',
//     marginRight: 16,
//   },
//   productDetails: {
//     flex: 1,
//     justifyContent: 'space-between',
//     flexDirection:"column",
//     gap:10
//   },
//   productName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   productQuantity: {
//     fontSize: 14,
//     color: '#666',
//     // marginVertical: 2, // Reduced from 4 to 2 to decrease spacing
//   },
//   productPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#D32F2F',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     // marginTop: 8,
//   },
//   subscribeButton: {
//     backgroundColor: '#D32F2F',
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginRight: 8,
//   },
//   buyButton: {
//     borderWidth: 1,
//     borderColor: '#D32F2F',
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginRight: 8,
//   },
//   buttonText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   buttonText2: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#D32F2F',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });

// export default ProductsPage;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { responsiveWidth, responsiveHeight } from 'react-native-responsive-dimensions';

const { width, height } = Dimensions.get('window');

const productsData = [
  {
    id: '1',
    name: 'Fresh Chicken Breast',
    quantity: '500 GM',
    price: '₹250.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Chicken',
    sub_category_name: 'Breast',
    sub_category_id: 'chicken_breast',
  },
  {
    id: '2',
    name: 'Chicken Drumsticks',
    quantity: '1 KG',
    price: '₹450.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Chicken',
    sub_category_name: 'Drumsticks',
    sub_category_id: 'chicken_drumsticks',
  },
  {
    id: '3',
    name: 'Mutton Leg Piece',
    quantity: '500 GM',
    price: '₹600.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Mutton',
    sub_category_name: 'Leg',
    sub_category_id: 'mutton_leg',
  },
  {
    id: '4',
    name: 'Mutton Curry Cut',
    quantity: '1 KG',
    price: '₹1100.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Mutton',
    sub_category_name: 'Curry Cut',
    sub_category_id: 'mutton_curry',
  },
  {
    id: '5',
    name: 'Rohu Fish',
    quantity: '1 KG',
    price: '₹300.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Fish',
    sub_category_name: 'Rohu',
    sub_category_id: 'fish_rohu',
  },
  {
    id: '6',
    name: 'Pomfret Fish',
    quantity: '500 GM',
    price: '₹500.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Fish',
    sub_category_name: 'Pomfret',
    sub_category_id: 'fish_pomfret',
  },
  {
    id: '7',
    name: 'Tiger Prawns',
    quantity: '500 GM',
    price: '₹700.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Prawn',
    sub_category_name: 'Tiger',
    sub_category_id: 'prawn_tiger',
  },
  {
    id: '8',
    name: 'White Prawns',
    quantity: '250 GM',
    price: '₹350.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Prawn',
    sub_category_name: 'White',
    sub_category_id: 'prawn_white',
  },
  {
    id: '9',
    name: 'Salmon Fillet',
    quantity: '500 GM',
    price: '₹900.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Seafood',
    sub_category_name: 'Salmon',
    sub_category_id: 'seafood_salmon',
  },
  {
    id: '10',
    name: 'Crab Meat',
    quantity: '500 GM',
    price: '₹600.00',
    image: require('../../daddy/tabassets/keema.png'),
    category: 'Seafood',
    sub_category_name: 'Crab',
    sub_category_id: 'seafood_crab',
  },
];

const ProductsPage = ({ navigation, route }) => {
  // Extract the selected tab from navigation params, default to 'Chicken' if not provided
  const { selectedTab: initialTab = 'Chicken' } = route.params || {};
  
  // Ensure the selectedTab matches one of the tabs, case-insensitive
  const tabs = ['Chicken', 'Mutton', 'Fish', 'Prawn', 'Seafood'];
  const matchedTab = tabs.find(tab => tab.toLowerCase() === initialTab.toLowerCase()) || 'Chicken';
  const [selectedTab, setSelectedTab] = useState(matchedTab);
  
  // State for draggable menu
  const [visible, setVisible] = useState(false);
  const [draggableMenuVisible, setDraggableMenuVisible] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [translateY] = useState(new Animated.Value(100));
  const pan = useRef(new Animated.ValueXY({ x: responsiveWidth(100) - 88, y: responsiveHeight(100) - 138 })).current;

  // PanResponder for draggable menu
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log('PanResponder Grant:', pan.x._value, pan.y._value);
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        console.log('PanResponder Release:', pan.x._value, pan.y._value);
        pan.flattenOffset();
      },
    })
  ).current;

  // Animation functions
  const startAnim = () => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {});
  };

  const stopAnim = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  // Filter products based on selected tab and filterType (subcategory)
  const filteredProductsByTab = productsData.filter(
    (product) => product.category === selectedTab
  );

  const filteredProducts = filterType === 'All'
    ? filteredProductsByTab
    : filteredProductsByTab.filter(
        (product) => product.sub_category_name === filterType
      );

  // Extract unique subcategories for the selected tab
  const restaurantItems = filteredProductsByTab.reduce((acc, item) => {
    if (item.sub_category_name && !acc.find(cat => cat.sub_category_name === item.sub_category_name)) {
      acc.push({
        sub_category_name: item.sub_category_name,
        sub_category_id: item.sub_category_id,
      });
    }
    return acc;
  }, []);

  const handleDraggableMenuAction = (item) => {
    setFilterType(item.sub_category_name);
    setDraggableMenuVisible(false); // Close menu after selection
    stopAnim(); // Trigger closing animation
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={item.image} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.quantity ? (
          <Text style={styles.productQuantity}>{item.quantity}</Text>
        ) : null}
        <Text style={styles.productPrice}>{item.price}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.subscribeButton} onPress={() => navigation.navigate("SubscriptionPage")}>
            <Text style={styles.buttonText}>Subscribe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate("ByOncescreen")}>
            <Text style={styles.buttonText2}>Buy Once</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meat</Text>
        </View>
      </View>
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                setSelectedTab(tab);
                setFilterType('All'); // Reset filter when changing tabs
              }}
              style={[styles.tab, { width: width / 3 }]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tab}
              </Text>
              {selectedTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No products available in this category.
          </Text>
        }
      />

      {/* Draggable Menu */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.draggableMenu, pan.getLayout()]}
      >
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            setDraggableMenuVisible(!draggableMenuVisible);
            if (!draggableMenuVisible) {
              startAnim();
            } else {
              stopAnim();
            }
          }}
        >
          <Text style={styles.menuText}>Menu</Text>
          <FontAwesome6 name="book-bookmark" color="#D32F2F" size={30} />
        </TouchableOpacity>

        {draggableMenuVisible && (
          <Animated.View
            style={[
              styles.menuContent,
              { transform: [{ translateY }] },
            ]}
          >
            <FlatList
              data={[
                { sub_category_name: 'All', sub_category_id: 'all' },
                ...restaurantItems,
              ]}
              keyExtractor={(item) => item.sub_category_id?.toString() || 'all'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleDraggableMenuAction(item)}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      (filterType === item.sub_category_name || item.sub_category_name === 'All') && styles.activeMenuText,
                    ]}
                  >
                    {item.sub_category_name}
                  </Text>
                  {filterType === item.sub_category_name && (
                    <MaterialIcons name="check" size={20} color="#D32F2F" />
                  )}
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  tabTextActive: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  tabIndicator: {
    width: 60,
    height: 3,
    backgroundColor: '#D32F2F',
    marginTop: 4,
    borderRadius: 2,
  },
  productList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    gap: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscribeButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  buyButton: {
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonText2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  // Draggable Menu Styles
  draggableMenu: {
    position: 'absolute',
    zIndex: 1000,
  },
  menuButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 5,
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    maxHeight: height * 0.3,
    width: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  activeMenuText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
});

export default ProductsPage;