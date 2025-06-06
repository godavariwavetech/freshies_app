import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#6A48D2" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      <ScrollView style={{ padding: 20, paddingBottom: 100 }}>
        <Text style={styles.effectiveDate}>Effective Date: 4/3/2025</Text>
        <Text style={styles.content}>
          Welcome to Local Daddy! Your privacy is important to us. This Privacy Policy explains how Local Daddy ("we," "our," or "us") collects, uses, shares, and protects your information when you use our mobile application and services.
        </Text>

        <Text style={styles.subtitle}>1. Information We Collect</Text>
        <Text style={styles.subsectionTitle}>a. Information You Provide</Text>
        <Text style={styles.content}>
          • Personal details like name, email, phone number, and address{"\n"}
          • Payment details (handled securely by third-party processors){"\n"}
          • Communications and support requests
        </Text>

        <Text style={styles.subsectionTitle}>b. Information Collected Automatically</Text>
        <Text style={styles.content}>
          • Location data for restaurant options and delivery{"\n"}
          • Device information (IP address, OS version, usage data){"\n"}
          • Cookies and similar technologies for analytics
        </Text>

        <Text style={styles.subtitle}>2. How We Use Your Information</Text>
        <Text style={styles.content}>
          • Provide and personalize services{"\n"}
          • Process orders and payments{"\n"}
          • Improve user experience and support{"\n"}
          • Prevent fraud and enhance security{"\n"}
          • Send promotions (with consent)
        </Text>

        <Text style={styles.subtitle}>3. Sharing Your Information</Text>
        <Text style={styles.content}>
          • Partner restaurants and delivery personnel{"\n"}
          • Payment processors for transactions{"\n"}
          • Service providers for analytics and security{"\n"}
          • Authorities when legally required{"\n\n"}
          <Text style={styles.bold}>We do not sell your personal information.</Text>
        </Text>

        <Text style={styles.subtitle}>4. Your Choices and Rights</Text>
        <Text style={styles.content}>
          • Update account information anytime{"\n"}
          • Opt-out of marketing communications{"\n"}
          • Request data access or deletion
        </Text>

        <Text style={styles.subtitle}>5. Data Security</Text>
        <Text style={styles.content}>
          We implement strict security measures, though no method is 100% secure. We recommend users take precautions to protect their information.
        </Text>

        <Text style={styles.subtitle}>6. Third-Party Links</Text>
        <Text style={styles.content}>
          Our app may contain third-party links. We are not responsible for their privacy practices.
        </Text>

        <Text style={styles.subtitle}>7. Policy Changes</Text>
        <Text style={styles.content}>
          We may update this policy periodically. Changes will be communicated through our app or website.
        </Text>

        <Text style={styles.subtitle}>8. Contact Us</Text>
        <Text style={[styles.content, { marginBottom: responsiveHeight(10) }]}>
          For questions about this policy:{"\n"}
          Email: localdaddyweb@gmail.com{"\n"}
          Phone: 80747 09926
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 20
  },
  header: {
    backgroundColor: '#6A48D2',
    height: responsiveHeight(15),
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: responsiveHeight(3),
    paddingLeft: responsiveWidth(5)
  },
  backButton: {
    width: responsiveWidth(7),
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  effectiveDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    color: '#6A48D2'
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333'
  },
  content: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 24,
    color: '#666'
  },
  bold: {
    fontWeight: '700',
    color: '#000'
  }
});

export default PrivacyPolicyScreen;
