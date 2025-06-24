import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or 'AntDesign', 'MaterialIcons', etc.
import FocusAwareStatusBar from '../../components/CustomStatusBar';

// Make sure your component receives the 'navigation' prop
const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Custom Header with Back Navigation */}
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Navigates back to the previous screen
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.effectiveDate}>Effective Date: 12/06/2025</Text>

        <Text style={styles.paragraph}>
          At Abhi24, we value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, share, and protect your data when you use our delivery services for food, groceries, and other products.
        </Text>

        {/* Section 1: Information We Collect */}
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>We collect the following types of information:</Text>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>Personal Information:</Text> When you create an account or make a purchase, we collect details such as your name, contact information, and payment details.</Text>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>Order Information:</Text> We collect information about the products you order, delivery address, and payment transactions.</Text>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>Location Data:</Text> We may collect location data for order delivery purposes and to improve our services.</Text>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>Device Information:</Text> We gather details about the device you use to access our services, including IP address and browser type.</Text>
        </View>

        {/* Section 2: How We Use Your Information */}
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use your information for the following purposes:</Text>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bulletPoint}>• To process and deliver your orders efficiently.</Text>
          <Text style={styles.bulletPoint}>• To personalize your shopping experience and recommend relevant products.</Text>
          <Text style={styles.bulletPoint}>• To communicate with you about your orders, promotions, and service updates.</Text>
          <Text style={styles.bulletPoint}>• To improve our services and ensure timely deliveries.</Text>
        </View>

        {/* Section 3: Sharing Your Information */}
        <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>With Service Providers:</Text> We may share your data with third-party providers who assist with payments, delivery, and customer support.</Text>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>For Legal Compliance:</Text> We may disclose your information if required by law or to protect our rights.</Text>
        </View>

        {/* Section 4: Data Security */}
        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures to protect your information, but we cannot guarantee absolute security.
        </Text>

        {/* Section 5: Your Choices and Rights */}
        <Text style={styles.sectionTitle}>5. Your Choices and Rights</Text>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>Access and Correction:</Text> You can access or update your personal information anytime.</Text>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>Opt-Out:</Text> You can opt-out of promotional communications at any time.</Text>
          <Text style={styles.bulletPoint}><Text style={styles.boldText}>Data Deletion:</Text> You may request to delete your account and data, subject to legal requirements.</Text>
        </View>

        {/* Section 6: Cookies */}
        <Text style={styles.sectionTitle}>6. Cookies</Text>
        <Text style={styles.paragraph}>
          We use cookies to enhance your Browse experience and to remember your preferences.
        </Text>

        {/* Section 7: Children's Privacy */}
        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our service is not intended for children under 18. We do not knowingly collect information from minors.
        </Text>

        {/* Section 8: Changes to This Privacy Policy */}
        <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy periodically. Any changes will be posted on this page.
        </Text>
      </View>
    </ScrollView>
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
    paddingVertical: 7,
    paddingHorizontal: 15,
    backgroundColor: '#8655d2',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // shadow properties for a subtle lift on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    // elevation for Android
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
    padding: 5, // Make the touchable area larger
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1, // Allows the title to take up remaining space
  },
  content: {
    padding: 20,
  },
  effectiveDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 10,
  },
  bulletPointContainer: {
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 5,
    marginLeft: 10, // Indent bullet points
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default PrivacyPolicyScreen;