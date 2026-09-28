import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // ✅ using vector icons
import FocusAwareStatusBar from '../../components/CustomStatusBar';

const TermsAndConditionsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#117943" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms and Conditions</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>Effective Date: 12/06/2025</Text>

        <Text style={styles.sectionTitle}>1. Use of Service</Text>
        <Text style={styles.text}>
          You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account and for all activities under your account.
        </Text>

        <Text style={styles.sectionTitle}>2. Orders and Payments</Text>
        <Text style={styles.text}>
          All orders placed through our platform must be paid in full using the available payment options. Prices, availability, and delivery times may vary depending on vendors and your location.
        </Text>

        <Text style={styles.sectionTitle}>3. Delivery</Text>
        <Text style={styles.text}>
          We strive to deliver your order accurately and promptly. However, we are not liable for delays or cancellations due to unforeseen circumstances such as weather, traffic, or vendor availability.
        </Text>

        <Text style={styles.sectionTitle}>4. Cancellations and Refunds</Text>
        <Text style={styles.text}>
          Orders can be canceled within a short window after placement. Refunds are issued based on vendor and delivery status. Some perishable or pharmaceutical items may not be eligible for cancellation or return.
        </Text>

        <Text style={styles.sectionTitle}>5. Prohibited Use</Text>
        <Text style={styles.text}>
          You agree not to misuse the platform, including engaging in fraudulent orders, using abusive language with staff, or attempting to disrupt the service.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.text}>
          We are not liable for indirect, incidental, or consequential damages arising from the use of our services. Vendor quality, pricing, and inventory are the responsibility of the respective vendors.
        </Text>

        <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
        <Text style={styles.text}>
          All content on our platform, including logos, text, and visuals, is the property of Abhi24 and may not be copied or used without permission.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these terms from time to time. Continued use of our services after changes are posted means you accept the updated terms.
        </Text>

        <Text style={styles.sectionTitle}>9. Governing Law</Text>
        <Text style={styles.text}>
          These terms are governed by the laws of India. Any disputes shall be resolved in the appropriate courts of this jurisdiction.
        </Text>
      </ScrollView>
    </View>
  );
};

export default TermsAndConditionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#117943',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  date: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
    color: '#222',
  },
  text: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
