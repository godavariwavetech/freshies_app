import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const ViewTrackScreen = ({ navigation, route }) => {
  const { orderDetails, status } = route.params || {};
  const backgroundColor = status === 1 ? '#D32F2F' : '#6A48D2';

  // Detailed tracking steps
  const trackingSteps = [
    {
      title: 'Order Placed',
      description: 'Your order has been successfully placed',
      date: orderDetails?.orderDate ? new Date(orderDetails.orderDate).toLocaleString() : 'N/A',
      status: 'completed'
    },
    {
      title: 'Order Confirmed',
      description: 'Seller has confirmed your order',
      date: orderDetails?.orderDate ? new Date(orderDetails.orderDate).toLocaleString() : 'N/A',
      status: 'completed'
    },
    {
      title: 'Processing',
      description: 'Your order is being prepared',
      date: 'Estimated: ' + new Date(new Date(orderDetails?.orderDate || Date.now()).getTime() + 24 * 60 * 60 * 1000).toLocaleString(),
      status: 'pending'
    },
    {
      title: 'Shipped',
      description: 'Order has been shipped',
      date: 'Estimated: ' + new Date(new Date(orderDetails?.orderDate || Date.now()).getTime() + 48 * 60 * 60 * 1000).toLocaleString(),
      status: 'pending'
    },
    {
      title: 'Out for Delivery',
      description: 'Your package is on its way',
      date: 'Estimated: ' + new Date(new Date(orderDetails?.orderDate || Date.now()).getTime() + 72 * 60 * 60 * 1000).toLocaleString(),
      status: 'pending'
    },
    {
      title: 'Delivered',
      description: 'Package has been delivered',
      date: 'Estimated: ' + new Date(new Date(orderDetails?.orderDate || Date.now()).getTime() + 96 * 60 * 60 * 1000).toLocaleString(),
      status: 'pending'
    }
  ];

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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Order ID */}
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderIdText}>{orderDetails?.orderId || 'N/A'}</Text>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.trackingTimeline}>
          {trackingSteps.map((step, index) => (
            <View key={index} style={styles.trackingStep}>
              {/* Status Indicator */}
              <View style={styles.statusIndicatorContainer}>
                <View 
                  style={[
                    styles.statusIndicator, 
                    step.status === 'completed' 
                      ? { backgroundColor } 
                      : { borderColor: backgroundColor, borderWidth: 2 }
                  ]}
                />
                {index < trackingSteps.length - 1 && (
                  <View 
                    style={[
                      styles.connectingLine, 
                      step.status === 'completed' 
                        ? { backgroundColor } 
                        : { backgroundColor: '#ccc' }
                    ]} 
                  />
                )}
              </View>

              {/* Step Details */}
              <View style={styles.stepDetails}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            </View>
          ))}
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
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  statusIndicatorContainer: {
    alignItems: 'center',
    marginRight: responsiveWidth(4),
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  connectingLine: {
    width: 2,
    height: responsiveHeight(10),
    position: 'absolute',
    top: 20,
    zIndex: -1,
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  stepDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default ViewTrackScreen; 