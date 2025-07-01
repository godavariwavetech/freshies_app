import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PicklesSubcategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { subcategories } = route.params;

  const handleSubcategoryPress = (subcategory) => {
    // Navigate to GroceriesScreen with appropriate status
    navigation.navigate('GroceriesScreen', {
      status: subcategory.name === 'Veg Pickles' ? 2 : 1,
      categoryKey: subcategory.name.toLowerCase().replace(' ', '_')
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="white" 
        barStyle="dark-content" 
        translucent={false} 
      />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickles</Text>
      </View>

      <View style={styles.subcategoriesContainer}>
        {subcategories.map((subcategory) => (
          <TouchableOpacity 
            key={subcategory.id} 
            style={styles.subcategoryItem}
            onPress={() => handleSubcategoryPress(subcategory)}
          >
            <Image 
              source={subcategory.image} 
              style={styles.subcategoryImage} 
              resizeMode="contain"
            />
            <Text style={styles.subcategoryName}>{subcategory.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: wp('4%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#000',
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: wp('4%'),
  },
  subcategoryItem: {
    width: (width - wp('12%')) / 2,
    alignItems: 'center',
    marginBottom: hp('2%'),
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: wp('2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subcategoryImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: 10,
    marginBottom: hp('1%'),
  },
  subcategoryName: {
    fontSize: wp('4%'),
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PicklesSubcategoryScreen; 