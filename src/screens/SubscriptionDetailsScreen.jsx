import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function SubscriptionDetailsScreen({ navigation, route }) {
    const { item } = route.params;
   
    const today = dayjs();  // mock current date
    const startDate = dayjs(item.startDate);
    const upcoming = startDate.isAfter(today) ? startDate : today.add(1, 'day');

    const completedDates = [];
    //   for (let i = 1; i <= 5; i++) {
    //     completedDates.push(today.subtract(i, 'day').format('ddd, DD MMM YYYY'));
    //   }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={wp('6%')} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription Details</Text>

            </View>

            {/* Content */}
            <View style={styles.content}>
                <Image source={{ uri: item.image }} style={styles.image} />

                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <Text style={styles.detail}>Start Date: {item.startDate}</Text>
                <Text style={styles.detail}>Schedule: {item.schedule}</Text>

                {/* Upcoming Delivery */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Upcoming Delivery</Text>
                    <Text style={styles.dateText}>{upcoming.format('ddd, DD MMM YYYY')}</Text>
                </View>

                {/* Completed Deliveries */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Completed Deliveries</Text>

                    {completedDates.length > 0 ? (
                        completedDates.map((d, index) => (
                            <Text key={index} style={styles.dateText}>{d}</Text>
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
});
