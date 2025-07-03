import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  BackHandler,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { setLocation, setLocationId, setLocationName } from '../../redux/reducers/auth';
import { getServices } from '../../services/services';
import FocusAwareStatusBar from '../../components/CustomStatusBar';

const { width } = Dimensions.get('window');

const ServicesAvailableScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAreas, setFilteredAreas] = useState([]);
  // const { availableAreas, loading } = useSelector(state => state.Dashboard);
  const [availableAreas, setAvailableAreas] = useState([])
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      const response = await dispatch(getServices());
       // This will contain the payload or error info
      setAvailableAreas(response.payload.data)
      setLoading(false)
    };

    fetchData(); // Call the async function
  }, []);

  useEffect(() => {
    if (availableAreas) {
      setFilteredAreas(availableAreas?.filter(area =>
        area.location_name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery, availableAreas]);

  const handleAreaSelect = (area) => {
    console.log("area",area)
    dispatch(setLocation({ latitude: area.location_latitude, longitude: area.location_latitude }))
    dispatch(setLocationName(area.location_name))
    // dispatch(setLocationId(area.id))
    navigation.navigate("ByOncescreen")
  };

  

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getServices());
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
       <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          {!route?.params?.permissionDenied && <FontAwesome6 name="arrow-left-long" size={20} color="#fff" />}
        </TouchableOpacity>
        <Text style={styles.title}>Available Service Areas</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search service areas..."
          placeholderTextColor="#666"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialIcons name="search" size={24} color="#065E2C" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#065E2C" style={styles.loader} />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#065E2C']}
              tintColor="#065E2C"
            />
          }
          data={filteredAreas}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.areaCard}
              onPress={() => handleAreaSelect(item)}
            >
              <View style={styles.areaInfo}>
                <Text style={styles.areaName}>{item.location_name}</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>
                    <MaterialIcons name="location-pin" size={16} color="#065E2C" />
                    {item.maximum_delivery_service_km} km radius
                  </Text>
                  {/* <Text style={styles.detailText}>
                    <MaterialIcons name="delivery-dining" size={16} color="#065E2C" />
                    Free Delivery
                  </Text> */}
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#065E2C" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={{ uri: 'https://raw.githubusercontent.com/Adarsh-arya/local_daddy_images/main/no_service.png' }}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>No service available in this area</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    // paddingTop: responsiveHeight(2),
  },
  header: {
    backgroundColor: "#8655d2",
    height: responsiveHeight(10),
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: responsiveHeight(3),
    paddingLeft: responsiveWidth(5),
    gap:10
  },
  backButton: {
    width: responsiveWidth(7)
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: "left"
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginHorizontal: responsiveWidth(5),
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 15,
    marginHorizontal: responsiveWidth(5),
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  areaInfo: {
    flex: 1,
    marginRight: 10,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(15),
  },
  emptyImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: responsiveWidth(10),
  },
  loader: {
    marginTop: responsiveHeight(30),
  },
});

export default ServicesAvailableScreen; 