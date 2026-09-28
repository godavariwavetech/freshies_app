import React, { useState, useEffect } from 'react';
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
import { getSubCategories, NestedItems } from '../../services/services';
import Toast from 'react-native-toast-message';
import FocusAwareStatusBar from '../../components/CustomStatusBar';

const { width } = Dimensions.get('window');
const sidebarWidth = width * 0.4; // 40% of screen width for sidebar
const itemWidth = (width - sidebarWidth - 40) / 2; // Adjust item width based on screen size

const CategoryScreen = ({ navigation, route }) => {
  const { searchResults: initialSearchResults = [], searchQuery = '' } = route.params || {}; 
  
  const [selectedCategory, setSelectedCategory] = useState('Fresh Meat');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Chicken');
  const [searchResults, setSearchResults] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryId, setSubcategoryId] = useState("")
  const [itemsData, setItemsData] = useState([])

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subCats = await getSubCategories();
        setSubcategoryId(subCats[0].id)
        
        const grouped = subCats.reduce((acc, item) => {
          const category = item.category_name;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {});
        setSubcategories(grouped);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load subcategories',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      }
    };

    fetchSubcategories();
  }, []);


  useEffect(() => {
    const fetchNestedSubcategories = async () => {

      try {
        const subCats = await NestedItems({
          "subcategory_id": subcategoryId
        });
       
        const groupedItems = subCats.data.reduce((acc, item) => {
          if (!acc[item.item_name]) {
            acc[item.item_name] = {
              id: item.id,
              item_name: item.item_name,
              item_image: item.item_image,
              item_description: item.item_description,
              filter_one: item.filter_one,
              unique_id: item.unique_id,
              variants: []
            };
          }

          acc[item.item_name].variants.push({
            id: item.id,
            quantity_type: item.quantity_type,
            actual_price: item.actual_price,
            selling_price: item.selling_price
          });

          return acc;
        }, {});
        const groupedList = Object.values(groupedItems);
        
        setItemsData(groupedList)
        // setSubcategories(filteredSubcategories);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load subcategories',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 50 : 30,
        });
      }

    };
    if (subcategoryId) {
      fetchNestedSubcategories();
    }

  }, [subcategoryId]);



  const backgroundColor = '#117943';

  // Render search results or default items
  const dataToRender = searchResults.length > 0
    ? searchResults.map(result => ({
      id: result.id,
      name: result.category_name,
      image: result.category_image,
      type: result.type
    }))
    : itemsData[selectedCategory];

  const renderGroupedCategory = ({ item }) => (
    <View style={styles.categoriesSidebarGroup}>
      <Text style={styles.categoriesSidebarHeader}>{item.category}</Text>
      {item.subcategories.map(sub => (
        <TouchableOpacity
          key={sub.id}
          style={[
            styles.categoriesSidebarSubItem,
            selectedSubcategory === sub.sub_category_name && [
              styles.categoriesSidebarSubItemSelected,
              { backgroundColor: backgroundColor + '20' },
            ],
          ]}
          onPress={() => {
            setSelectedCategory(item.category);
            setSelectedSubcategory(sub.sub_category_name);
            setSearchResults([]);
            setSubcategoryId(sub.id)
          }}
        >
          <Text
            style={[
              styles.categoriesSidebarSubItemText,
              selectedSubcategory === sub.sub_category_name && {
                color: backgroundColor,
                fontWeight: 'bold',
              },
            ]}
          >
            {sub.sub_category_name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );


  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productItem
      ]}
      onPress={() =>
        navigation.navigate('ProductDetailsScreen', {
          item: {
            ...item,
            subcategory_id: subcategoryId,
            variant: ""
          },
          unique_id: item.unique_id,
          
        })
      }
    >
      <Image
        source={{ uri: item.item_image }}
        style={[
          styles.productImage]}
      />
      <Text
        style={[
          styles.productName]}
      >
        {item.item_name}
      </Text>
    </TouchableOpacity>
  );

  const groupedCategoryData = Object.entries(subcategories).map(([category, subcategories]) => ({
    category,
    subcategories: subcategories.map((sub) => sub)
  }));


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      {/* Status Bar */}
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#117943" />
      <View style={styles.mainContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={groupedCategoryData}
            renderItem={renderGroupedCategory}
            keyExtractor={(item) => item.category}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesSidebar}
          />
        </View>

        {/* Main Content */}

        <View style={{ backgroundColor: "white", flex: 1, padding: 10, overflow: "scroll" }}>
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
            data={itemsData}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
    borderTopWidth: 0.5,
    borderTopColor: '#B0B0B0',
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
    backgroundColor: '#11794320', // Light green background with 20% opacity
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#117943',
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
    backgroundColor: '#FFF',
    marginBottom: 5,
    objectFit: "fill"
  },
  selectedProductImage: {
    borderWidth: 2,
    borderColor: '#117943',
  },
  productName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  selectedProductText: {
    color: '#117943',
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
    color: '#117943',
    fontWeight: 'bold',
  },


  categoriesSidebar: {
    width: sidebarWidth,
    backgroundColor: '#E8ECEF',
    paddingVertical: 15,
  },

  // Group wrapper for a category
  categoriesSidebarGroup: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  // Category title
  categoriesSidebarHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },

  // Subcategory button
  categoriesSidebarSubItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 5,
  },

  // Selected subcategory
  categoriesSidebarSubItemSelected: {
    backgroundColor: '#11794320',
  },

  // Subcategory text
  categoriesSidebarSubItemText: {
    fontSize: 15,
    color: '#333',
  },
});

export default CategoryScreen;