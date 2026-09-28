import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import debounce from 'lodash.debounce';
import { fetchSearchResults } from '../services/services';
import Icon from 'react-native-vector-icons/Ionicons';
import FocusAwareStatusBar from '../components/CustomStatusBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GlobalSearchScreen = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();

    const fetchResults = async (searchTerm) => {
        setLoading(true);
        const results = await fetchSearchResults(searchTerm);

        setResults(results);
        setLoading(false);
    };

    const debouncedSearch = useCallback(debounce(fetchResults, 500), []);

    useEffect(() => {
        if (query.trim().length >= 3) {
            debouncedSearch(query);
        } else {
            setResults([]); // clear results if less than 3 chars
        }
    }, [query]);

    const handleSelectItem = (item) => {
        let params = {
          item_id: '',
          subcategory_id: '',
          subcategory_name: '',
          category_id: '',
          subtotal_category_id: '',
        };
      
        switch (item.search_type) {
          case '1': // Item
            params.item_id = item.id;
            break;
          case '2': // Subcategory
            params.subcategory_id = item.id;
            break;
          case '3': // Category
            params.subtotal_category_id = item.id; // use this for type 3
            break;
          default:
            console.warn('Unknown search type:', item.search_type);
            return;
        }
      
        navigation.navigate('GroceriesScreen', params);
      };
      

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleSelectItem(item)} style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
            <Image source={{ uri: item.search_image }} style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10 }} />
            <View>
                <Text style={{ fontSize: 16 }}>{item.search_text}</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>{item.search_tagline}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <FocusAwareStatusBar barStyle="light-content" backgroundColor="#117943" />
            {/* Header with Back Button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#ddd',paddingTop: insets.top, backgroundColor: '#117943', }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 12, color: "white" }}>Search</Text>
            </View>

            {/* Search Field & Results */}
            <View style={{ flex: 1, padding: 10 }}>
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    placeholder="Search for meat, groceries & pickles"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 10,
                    }}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#117943" />
                ) : query.trim().length < 3 ? (
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Icon name="information-circle-outline" size={48} color="#ccc" />
                        <Text style={{ fontSize: 16, color: '#888', marginTop: 10 }}>
                            Type at least 3 characters
                        </Text>
                    </View>
                ) : results.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Icon name="search-outline" size={48} color="#ccc" />
                        <Text style={{ fontSize: 16, color: '#888', marginTop: 10 }}>
                            No items found
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                    />
                )}
            </View>
        </View>

    );
};

export default GlobalSearchScreen;
