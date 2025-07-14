import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


const keywordList = ['Search for meat', 'Search for groceries', 'Search for pickles'];
const animatedDuration = 800;

const SearchBarWithScrollPlaceholder = ({ navigation, isDarkMode, searchQuery, setSearchQuery }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(translateY, {
        toValue: -20,
        duration: animatedDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        translateY.setValue(20);
        setCurrentIndex((prev) => (prev + 1) % keywordList.length);
        Animated.timing(translateY, {
          toValue: 0,
          duration: animatedDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity
      style={styles.searchContainer}
      activeOpacity={1}
      onPress={() => {
        setSearchQuery('');
        navigation.navigate('GlobalSearchScreen');
      }}
    >

      <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
        {/* <Text style={{ color: isDarkMode ? '#aaaaaa' : '#666666' }}>Search for </Text> */}
        <Animated.Text
          style={{
            color: isDarkMode ? '#aaaaaa' : '#666666',
            // fontWeight: 'bold',
            transform: [{ translateY }],
          }}
        >
          {keywordList[currentIndex]}
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 3,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#000',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    paddingVertical: 0,
  },
});


export default SearchBarWithScrollPlaceholder;
