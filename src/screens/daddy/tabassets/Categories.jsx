import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
// Sample data for categories and items
const categories = ['Mutton', 'Chicken', 'Fish & Prawns', 'Grocery', 'Fresh Vegetables'];
const itemsData = {
  Mutton: [
    { id: '1', name: 'Mutton Curry Cut', image: require('../../daddy/tabassets/keema.png') },
    { id: '2', name: 'Mutton Boneless', image: require('../../daddy/tabassets/keema.png') },
    { id: '3', name: 'Mutton Liver', image: require('../../daddy/tabassets/keema.png') },
    { id: '4', name: 'Mutton Heart', image: require('../../daddy/tabassets/keema.png') },
    { id: '5', name: 'Mutton Brain', image: require('../../daddy/tabassets/keema.png') },
    { id: '6', name: 'Mutton Ribs & Chops', image: require('../../daddy/tabassets/keema.png') },
    { id: '7', name: 'Mutton Keema', image: require('../../daddy/tabassets/keema.png') },
  ],
  Chicken: [
    { id: '8', name: 'Chicken Curry Cut', image: require('../../daddy/tabassets/keema.png') },
    { id: '9', name: 'Chicken Boneless', image: require('../../daddy/tabassets/keema.png') },
    { id: '10', name: 'Chicken Liver', image: require('../../daddy/tabassets/keema.png') },
  ],
  'Fish & Prawns': [
    { id: '11', name: 'Fish Fillet', image: require('../../daddy/tabassets/keema.png') },
    { id: '12', name: 'Prawns', image: require('../../daddy/tabassets/keema.png') },
  ],
  Grocery: [
    { id: '13', name: 'Rice', image: require('../../daddy/tabassets/keema.png') },
    { id: '14', name: 'Oil', image: require('../../daddy/tabassets/keema.png') },
  ],
  'Fresh Vegetables': [
    { id: '15', name: 'Tomato', image: require('../../daddy/tabassets/keema.png') },
    { id: '16', name: 'Onion', image: require('../../daddy/tabassets/keema.png') },
  ],
};

const { width } = Dimensions.get('window');
const sidebarWidth = width * 0.4; // 30% of screen width for sidebar
const itemWidth = (width - sidebarWidth - 40) / 2; // Adjust item width based on screen size

const CategoryScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Mutton');

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <StatusBar backgroundColor="#D32F2F" barStyle="light-content" />

      <View style={styles.mainContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content}>
          <FlatList
            data={itemsData[selectedCategory]}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop:30
  },
  sidebar: {
    width: sidebarWidth,
    backgroundColor: '#E8ECEF',
    paddingVertical: 10,
  },
  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedCategoryItem: {
    backgroundColor: '#FFE6EE',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productItem: {
    width: itemWidth,
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: itemWidth - 20,
    height: itemWidth - 20,
    borderRadius: (itemWidth - 20) / 2,
    backgroundColor: '#FFE6EE',
    marginBottom: 5,
  },
  productName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
});
export default CategoryScreen;