// screens/SubscriptionDetailsScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function SubscriptionDetailsScreen({ route, navigation }) {
    const { item } = route.params;
    console.log(item)
    const today = dayjs('2025-06-25'); // mock current date
    const startDate = dayjs(item.startDate);
    const upcoming = startDate.isAfter(today) ? startDate : today.add(1, 'day');

    const completedDates = [];
    for (let i = 1; i <= 5; i++) {
        completedDates.push(today.subtract(i, 'day').format('ddd, DD MMM YYYY'));
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        console.log('Back pressed');
                        navigation.goBack();
                    }}
                >
                     <Icon name="arrow-back" size={wp('6%')} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.absoluteTitle}>Subscription Details</Text>

                <View style={{ width: 22 }} />
            </View>

            <View style={{ paddingHorizontal: 16 }}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.info}>₹{item.price}</Text>
                <Text style={styles.info}>Start Date: {item.startDate}</Text>
                <Text style={styles.info}>Schedule: {item.schedule}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Upcoming Delivery</Text>
                    <Text style={styles.dateText}>{upcoming.format('ddd, DD MMM YYYY')}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Completed Deliveries</Text>
                    {completedDates.map((d, index) => (
                        <Text key={index} style={styles.dateText}>{d}</Text>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', flex: 1 },
    backBtn: { marginBottom: 10, color: "white", backgroundColor: "white" },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#8655d2'
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    absoluteTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
    name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    info: { fontSize: 15, color: '#555', marginBottom: 4 },
    section: { marginTop: 20 },
    sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
    dateText: { fontSize: 14, color: '#444', marginBottom: 4 },
});
