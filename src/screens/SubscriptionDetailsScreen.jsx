import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSubscriptionDetails } from '../services/services';

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
let wp, hp;
try {
    const responsiveScreen = require('react-native-responsive-screen');
    wp = responsiveScreen.widthPercentageToDP;
    hp = responsiveScreen.heightPercentageToDP;
} catch (e) {
    // Fallback if package is not available
    wp = (percent) => {
        const percentValue = typeof percent === 'string' ? parseFloat(percent.replace('%', '')) : percent;
        return (SCREEN_WIDTH * percentValue) / 100;
    };
    hp = (percent) => {
        const { height: SCREEN_HEIGHT } = Dimensions.get('window');
        const percentValue = typeof percent === 'string' ? parseFloat(percent.replace('%', '')) : percent;
        return (SCREEN_HEIGHT * percentValue) / 100;
    };
}

export default function SubscriptionDetailsScreen({ navigation, route }) {
    const { item } = route?.params || {};
    
    if (!item) {
        return (
            <View style={styles.container}>
                <Text>No subscription item found</Text>
            </View>
        );
    }
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSubscriptionDetails();
    }, []);

    const loadSubscriptionDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getSubscriptionDetails({ order_id: item.id });
            console.log('Subscription Details API Response:', response);
            
            if (response?.status === 200) {
                setSubscriptionData(response.data);
            } else {
                setError('Failed to load subscription details');
            }
        } catch (err) {
            console.error('Error fetching subscription details:', err);
            setError('An error occurred while loading details');
        } finally {
            setLoading(false);
        }
    };

    // Parse subscription data
    const parseDate = (dateString) => {
        if (!dateString) return null;
        // Handle DD-MM-YYYY format
        if (dateString.includes('-') && dateString.length === 10) {
            const [day, month, year] = dateString.split('-');
            return dayjs(`${year}-${month}-${day}`);
        }
        // Handle ISO format
        return dayjs(dateString);
    };

    const upcomingDeliveries = [];
    const completedDeliveries = [];
    
    if (subscriptionData && Array.isArray(subscriptionData)) {
        subscriptionData.forEach((delivery) => {
            // Check for completed deliveries
            if (delivery.delivered_date_time) {
                // Completed delivery - use delivered_date_time (in UTC to avoid timezone conversion)
                const deliveredDate = dayjs.utc(delivery.delivered_date_time);
                console.log('Completed Delivery - delivered_date_time:', delivery.delivered_date_time, 'Formatted:', deliveredDate.format('ddd, DD MMM YYYY'));
                completedDeliveries.push({
                    date: deliveredDate.format('ddd, DD MMM YYYY'),
                    deliveredDateTime: delivery.delivered_date_time,
                    expectedDate: delivery.expected_date,
                    quantity: delivery.received_quantity,
                    amount: delivery.received_item_amount,
                    status: delivery.subscription_order_status,
                });
            }
            
            // Check for upcoming deliveries - check this separately
            // Always show expected dates if they exist
            if (delivery.expected_delivery_date) {
                // Upcoming delivery - use expected_delivery_date (in UTC to avoid timezone conversion)
                const expectedDate = dayjs.utc(delivery.expected_delivery_date);
                console.log('Upcoming Delivery - expected_delivery_date:', delivery.expected_delivery_date, 'Formatted:', expectedDate.format('ddd, DD MMM YYYY'));
                upcomingDeliveries.push({
                    date: expectedDate.format('ddd, DD MMM YYYY'),
                    expectedDate: delivery.expected_date,
                    expectedDeliveryDate: delivery.expected_delivery_date,
                    orderId: delivery.order_id,
                    status: delivery.subscription_order_status,
                });
            } else if (delivery.expected_date) {
                // Fallback to expected_date if expected_delivery_date is not available
                const expectedDate = parseDate(delivery.expected_date);
                if (expectedDate) {
                    console.log('Upcoming Delivery - expected_date:', delivery.expected_date, 'Formatted:', expectedDate.format('ddd, DD MMM YYYY'));
                    upcomingDeliveries.push({
                        date: expectedDate.format('ddd, DD MMM YYYY'),
                        expectedDate: delivery.expected_date,
                        expectedDeliveryDate: null,
                        orderId: delivery.order_id,
                        status: delivery.subscription_order_status,
                    });
                }
            }
        });
        
        // Sort upcoming deliveries by expected_delivery_date (ascending)
        upcomingDeliveries.sort((a, b) => {
            const dateA = a.expectedDeliveryDate ? dayjs.utc(a.expectedDeliveryDate) : parseDate(a.expectedDate) || dayjs();
            const dateB = b.expectedDeliveryDate ? dayjs.utc(b.expectedDeliveryDate) : parseDate(b.expectedDate) || dayjs();
            return dateA - dateB;
        });
        
        // Sort completed deliveries by delivered_date_time (descending - most recent first)
        completedDeliveries.sort((a, b) => {
            const dateA = dayjs.utc(a.deliveredDateTime);
            const dateB = dayjs.utc(b.deliveredDateTime);
            return dateB - dateA;
        });
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, {paddingTop: insets.top}]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={wp('6%')} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Subscription Details</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8655d2" />
                    <Text style={styles.loadingText}>Loading subscription details...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, {paddingTop: insets.top}]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={wp('6%')} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Subscription Details</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadSubscriptionDetails}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Header */}
            <View style={[styles.header, {paddingTop: insets.top}]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={wp('6%')} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription Details</Text>

            </View>

            {/* Content */}
            <View style={styles.content}>
                <Image source={{ uri: item.image }} style={styles.image} />

                <Text style={styles.name}>{item.name}</Text>
                {(item.quantity_type || item.weight) && (
                    <Text style={styles.detail}>Quantity: {item.quantity_type || item.weight}</Text>
                )}
                <Text style={styles.price}>₹{item.price}</Text>
                {(item.orderId || item.order_id) && (
                    <Text style={styles.detail}>Order ID: {item.orderId || item.order_id}</Text>
                )}
                <Text style={styles.detail}>Start Date: {item.startDate}</Text>
                <Text style={styles.detail}>Schedule: {item.frequency || item.schedule}</Text>

                {/* Upcoming Deliveries */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Upcoming Deliveries</Text>
                    {upcomingDeliveries.length > 0 ? (
                        upcomingDeliveries.map((delivery, index) => (
                            <View key={index} style={styles.deliveryCard}>
                                <View style={styles.deliveryRow}>
                                    <Icon name="schedule" size={16} color="#8655d2" style={styles.deliveryIcon} />
                                    <Text style={styles.dateText}>{delivery.date}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.dateText, { fontStyle: 'italic', color: '#999' }]}>
                            No upcoming deliveries scheduled.
                        </Text>
                    )}
                </View>

                {/* Completed Deliveries */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Completed Deliveries</Text>
                    {completedDeliveries.length > 0 ? (
                        completedDeliveries.map((delivery, index) => (
                            <View key={index} style={styles.deliveryCard}>
                                <View style={styles.deliveryRow}>
                                    <Icon name="check-circle" size={16} color="#4caf50" style={styles.deliveryIcon} />
                                    <Text style={styles.dateText}>{delivery.date}</Text>
                                </View>
                                <View style={styles.deliveryInfo}>
                                    <Text style={styles.deliveryDetail}>
                                        Quantity: {delivery.quantity}
                                    </Text>
                                    <Text style={styles.deliveryDetail}>
                                        Amount: ₹{delivery.amount}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.dateText, { fontStyle: 'italic', color: '#999' }]}>
                            No completed deliveries yet.
                        </Text>
                    )}
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    header: {
        backgroundColor: '#8655d2',
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginVertical: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#333',
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#444',
    },
    detail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    dateText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
    },
    deliveryCard: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#8655d2',
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    deliveryIcon: {
        marginRight: 8,
    },
    deliveryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    deliveryDetail: {
        fontSize: 12,
        color: '#666',
    },
    orderIdText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#8655d2',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
