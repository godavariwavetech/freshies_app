import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image,TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FocusAwareStatusBar from '../components/CustomStatusBar';

const AboutUsScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
      <View style={styles.header}>
         <TouchableOpacity
          onPress={() => navigation.goBack()} // This will navigate back
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      <Text style={styles.tagline}>Delivering fresh meat, groceries, and organic products.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Philosophy</Text>
        <Text style={styles.paragraph}>
          At Abhi24, we believe that quality food is the foundation of a healthy and happy life. We are a dedicated online delivery service bringing the freshest meat, organic produce, traditional pickles, and other natural food products right to your doorstep.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.paragraph}>
          Our mission is simple: to connect you with clean, honest, and wholesome food — without the hassle. Whether you're looking for hand-cut meats, responsibly sourced groceries, homemade pickles, and handmade soaps, we've got you covered.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Commitment to Quality</Text>
        <Text style={styles.paragraph}>
          We partner with trusted local farmers and homegrown brands to ensure premium quality, hygiene, and sustainability in every product. Our cold chain logistics and careful packaging maintain freshness from our hands to yours.
        </Text>
      </View>

      {/* You can add more sections here, for example:
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What We Offer</Text>
        <Text style={styles.paragraph}>
          - Freshly Cut Meats
          - Organic Fruits & Vegetables
          - Traditional Homemade Pickles
          - Natural & Handmade Soaps
          - And much more!
        </Text>
      </View>
      */}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for choosing Abhi24!</Text>
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
    flexDirection: "row",
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#8655d2', // Light background for the header
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  // logo: {
  //   width: 100, // Adjust size as needed
  //   height: 100, // Adjust size as needed
  //   marginBottom: 10,
  // },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20
    
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
    color: '#555',
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 16,
    color: '#888',
  },
});

export default AboutUsScreen;