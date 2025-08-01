import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { fetchOrderStatus } from '../../../services/services';
import { useFocusEffect } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';



const ViewTrackScreen = ({ navigation, route }) => {
  const { orderDetails } = route.params || {};
  const backgroundColor = "#8655d2";
  const [refreshing, setRefreshing] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(orderDetails);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const updatedData = await fetchOrderStatus(orderDetails?.orderId);

          if (updatedData.status === 200) {
            setCurrentOrderDetails(updatedData.data[0]);
          }
        } catch (error) {
          console.error('Focus Refresh Error:', error);
          Alert.alert('Error', 'Failed to fetch order status.');
        }
      };

      fetchData();
    }, [orderDetails?.orderId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const updatedData = await fetchOrderStatus(orderDetails?.orderId);

      if (updatedData.status === 200) {
        setCurrentOrderDetails(updatedData.data[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh order status.');
      console.error('Refresh Error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [orderDetails?.orderId]);

  const getStatusIndex = (orderStatus) => {
    switch (orderStatus) {
      case 0: return 0; // Order Confirmed
      case 1: return 1; // Shipped
      case 2: return 2; // Out for Delivery
      case 3: return 3; // Delivered
      default: return 0;
    }
  };

  // placed 0, accepted 1, ongoing 2, completed 3, user canceled 4, rejected 5, user not received 6, waiting for payment 7, Delivery boy accepted 8


  const trackingSteps = [
    {
      title: 'Order Confirmed',
      description: '',
      date: currentOrderDetails?.order_date_time || '',
      icon: 'checkmark-circle-outline',
    },
    {
      title: 'Shipped',
      description: 'Your item has arrived at Facility',
      date: currentOrderDetails?.accept_order_date_time || '',
      icon: 'cube-outline',
    },
    {
      title: 'Out For Delivery',
      description: '',
      date: currentOrderDetails?.deliveryboy_pickup_time || '',
      icon: 'bicycle-outline',
    },
    {
      title: 'Delivery',
      description: '',
      date: currentOrderDetails?.order_deliverd_date_time || '',
      icon: 'location-outline',
    }
  ];


  const status = getStatusIndex(currentOrderDetails?.order_status);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdText} numberOfLines={1}>
              {orderDetails?.order_id || 'N/A'}
            </Text>
            {orderDetails?.order_id && (
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(orderDetails.order_id);
                }}
                style={styles.copyIconButton}
              >
                <Ionicons name="copy-outline" size={16} color="#8655d2" />
              </TouchableOpacity>
            )}
          </View>
        </View>


        {/* Timeline */}
        <View style={styles.trackingTimeline}>
          {trackingSteps.map((step, index) => {
            const isCompleted = index < status;
            const isCurrent = index === status;
            const isUpcoming = index > status;

            return (
              <View key={index} style={styles.trackingStep}>
                {/* Left icon and line */}
                <View style={styles.statusIndicatorContainer}>
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={isCompleted || isCurrent ? backgroundColor : '#ccc'}
                    style={{ marginBottom: 5 }}
                  />
                  {index < trackingSteps.length - 1 && (
                    <View
                      style={[
                        styles.connectingLine,
                        {
                          backgroundColor: index < status ? backgroundColor : '#ccc'
                        }
                      ]}
                    />
                  )}
                </View>

                {/* Step content */}
                <View style={styles.stepDetails}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  {step.description ? (
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  ) : null}
                  {step.date ? (
                    <Text style={styles.stepDate}>{step.date}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: responsiveWidth(4),
  },
  scrollContainer: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
  },
  orderIdContainer: {
    backgroundColor: '#f4f4f4',
    padding: responsiveWidth(4),
    borderRadius: 8,
    marginBottom: responsiveHeight(2),
  },
  orderIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackingTimeline: {
    marginTop: responsiveHeight(2),
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(3),
  },
  statusIndicatorContainer: {
    alignItems: 'center',
    marginRight: responsiveWidth(4),
    width: 30,
  },
  connectingLine: {
    width: 2,
    height: responsiveHeight(7),
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  stepDate: {
    fontSize: 12,
    color: '#999',
  },
  orderIdContainer: {
    marginBottom: 12,
    backgroundColor: '#f4f4f4',
    padding: responsiveWidth(4),
    borderRadius: 8,
  },

  orderIdLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },

  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orderIdText: {
    fontSize: 15,
    color: '#000',
    flex: 1,
  },

  copyIconButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },

});

export default ViewTrackScreen;




























