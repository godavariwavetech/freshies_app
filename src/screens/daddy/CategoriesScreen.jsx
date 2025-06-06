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
  Platform,
} from 'react-native';

// Sample data for categories and items
const categories = ['Groceries', 'Fresh Meat'];

const itemsData = {
  Groceries: [
    { id: '1', name: 'Rice', image: require('../daddy/tabassets/Rice.png') },
    { id: '2', name: 'Seeds', image: require('../daddy/tabassets/Seeds.png') },
    { id: '3', name: 'Oils', image: require('../daddy/tabassets/Oil.png') },
    { id: '4', name: 'Millets', image: require('../daddy/tabassets/Millets.png') },
  ],
  'Fresh Meat': [
    { id: '5', name: 'Chicken', image: require('../daddy/tabassets/keema.png') },
    { id: '6', name: 'Mutton', image: require('../daddy/tabassets/muttoncurry.png') },
    { id: '7', name: 'Fish', image: require('../daddy/tabassets/fish.png') },
    { id: '8', name: 'Prawns', image: require('../daddy/tabassets/prawns.png') },
  ],
};

const { width } = Dimensions.get('window');
const sidebarWidth = width * 0.4; // 40% of screen width for sidebar
const itemWidth = (width - sidebarWidth - 40) / 2; // Adjust item width based on screen size

const CategoryScreen = ({ navigation, route }) => {
  const [selectedCategory, setSelectedCategory] = useState('Fresh Meat');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Chicken');
  const [searchResults, setSearchResults] = useState([]);

  // Check for search results passed from UserHome
  React.useEffect(() => {
    if (route.params?.searchResults) {
      setSearchResults(route.params.searchResults);
      
      // If search results exist, update category and subcategory
      if (route.params.searchResults.length > 0) {
        const firstResult = route.params.searchResults[0];
        setSelectedCategory(firstResult.type);
        setSelectedSubcategory(firstResult.category_name);
      }
    }
  }, [route.params?.searchResults]);

  // Define the background color
  const backgroundColor = '#6A48D2';

  // Render search results or default items
  const dataToRender = searchResults.length > 0 
    ? searchResults.map(result => ({
        id: result.id,
        name: result.category_name,
        image: result.category_image,
        type: result.type
      }))
    : itemsData[selectedCategory];

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        (selectedCategory === item || 
         (searchResults.length > 0 && item === searchResults[0].type)) && 
        [styles.selectedCategoryItem, { backgroundColor: backgroundColor + '20' }],
      ]}
      onPress={() => {
        setSelectedCategory(item);
        // Reset subcategory when changing main category
        setSelectedSubcategory(itemsData[item][0].name);
        // Clear search results
        setSearchResults([]);
      }}
    >
      <Text
        style={[
          styles.categoryText,
          (selectedCategory === item || 
           (searchResults.length > 0 && item === searchResults[0].type)) && 
          [styles.selectedCategoryText, { color: backgroundColor }],
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        (selectedSubcategory === item.name || 
         (searchResults.length > 0 && item.name === searchResults[0].category_name)) && 
        styles.selectedProductItem,
      ]}
      onPress={() => {
        // Set the selected subcategory
        setSelectedSubcategory(item.name);

        // Clear search results
        setSearchResults([]);

        if (item.type === 'Groceries' || selectedCategory === 'Groceries') {
          // Navigate to GroceriesScreen with the selected subcategory
          navigation.navigate('GroceriesScreen', { 
            categoryKey: item.name.toLowerCase() 
          });
        } else if (item.type === 'Fresh Meat' || selectedCategory === 'Fresh Meat') {
          // Navigate to GroceriesScreen with status 1 for meat-related content
          navigation.navigate('GroceriesScreen', { 
            status: 1, 
            categoryKey: item.name.toLowerCase() 
          });
        } else if (item.type === 'Pickles') {
          // Navigate to GroceriesScreen with status 2 for pickles
          navigation.navigate('GroceriesScreen', { 
            status: 2, 
            categoryKey: item.name.toLowerCase() 
          });
        }
      }}
    >
      <Image 
        source={item.image} 
        style={[
          styles.productImage,
          (selectedSubcategory === item.name || 
           (searchResults.length > 0 && item.name === searchResults[0].category_name)) && 
          [styles.selectedProductImage, { borderColor: backgroundColor }],
        ]} 
      />
      <Text 
        style={[
          styles.productName,
          (selectedSubcategory === item.name || 
           (searchResults.length > 0 && item.name === searchResults[0].category_name)) && 
          [styles.selectedProductText, { color: backgroundColor }],
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      {/* Status Bar */}
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />

      <View style={styles.mainContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Main Content */}
        <ScrollView 
          style={[styles.content, { backgroundColor: '#fff' }]} // Set right side background to white
          contentContainerStyle={styles.contentContainer}
        >
          {searchResults.length > 0 && (
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsText}>
                Search Results for "{route.params?.searchQuery}"
              </Text>
              <TouchableOpacity onPress={() => setSearchResults([])}>
                <Text style={styles.clearSearchText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={dataToRender}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
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
  },
  sidebar: {
    width: sidebarWidth,
    backgroundColor: '#E8ECEF',
    paddingVertical: 15,
  },
  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedCategoryItem: {
    backgroundColor: '#6A48D220', // Light green background with 20% opacity
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#6A48D2',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff', // Ensure right side background is white
  },
  contentContainer: {
    flexGrow: 1, // Ensure ScrollView content takes full height
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productItem: {
    width: itemWidth,
    alignItems: 'center',
    marginBottom: 10,
    padding: 5,
    borderRadius: 10,
  },
  productImage: {
    width: itemWidth - 20,
    height: itemWidth - 20,
    borderRadius: (itemWidth - 20) / 2,
    backgroundColor: '#FFEBEE',
    marginBottom: 5,
  },
  selectedProductImage: {
    borderWidth: 2,
    borderColor: '#6A48D2',
  },
  productName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  selectedProductText: {
    color: '#6A48D2',
    fontWeight: 'bold',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  searchResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearSearchText: {
    fontSize: 14,
    color: '#6A48D2',
    fontWeight: 'bold',
  },
});

export default CategoryScreen;