import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { getItems } from '../../services/services';

const GroceriesScreen = ({ route }) => {
  const { category_id, subcategory_id, subcategory_name } = route.params;
  
  const [items, setItems] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [category_id, subcategory_id]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const responseData = await getItems(subcategory_id, category_id);
      
      // The API returns a nested array, so we'll process it
      if (Array.isArray(responseData) && responseData.length >= 2) {
        // First array (index 0) contains category/subcategory info
        const categoryDetails = responseData[0];
        setCategoryInfo(categoryDetails);

        // Second array (index 1) contains the actual items
        const itemsList = responseData[1] || [];
        
        // Filter items matching the current category and subcategory
        const filteredItems = itemsList.filter(
          item => 
            item.category_id === category_id && 
            item.sub_category_id === subcategory_id
        );

        setItems(filteredItems);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const renderItemCard = ({ item }) => (
    <TouchableOpacity style={styles.itemCard}>
      <Image 
        source={{ uri: item.item_image }} 
        style={styles.itemImage} 
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.item_name}</Text>
        <Text style={styles.itemDescription}>{item.item_description}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.actualPrice}>₹{item.actual_price}</Text>
          <Text style={styles.sellingPrice}>₹{item.selling_price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Left Side: Subcategory Details */}
      <View style={styles.leftSidebar}>
        <Text style={styles.subcategoryTitle}>{subcategory_name}</Text>
        {categoryInfo && (
          <View style={styles.categoryInfo}>
            <Text>Category: {categoryInfo.category_name}</Text>
          </View>
        )}
      </View>

      {/* Right Side: Items List */}
      <View style={styles.itemsContainer}>
        <FlatList
          data={items}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No items found</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: '25%',
    backgroundColor: '#f0f0f0',
    padding: 10,
    alignItems: 'center',
  },
  subcategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryInfo: {
    alignItems: 'center',
  },
  itemsContainer: {
    flex: 1,
    padding: 10,
  },
  itemCard: {
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 150,
  },
  itemDetails: {
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    color: '#666',
    marginVertical: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actualPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  sellingPrice: {
    color: 'green',
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default GroceriesScreen; 