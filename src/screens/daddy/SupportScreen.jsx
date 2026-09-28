import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';


const SupportScreen = ({ navigation }) => {
  const { storeData } = useSelector(state => state.Auth);
  const insets = useSafeAreaInsets();
  const handleCall = () => {
    Linking.openURL(`tel:${storeData?.contact_number}`);
  };

  const handleEmail = () => {
    const email = storeData?.mail_id?.trim();
    const subject = encodeURIComponent("Support");
    const body = encodeURIComponent("Hi, I need assistance with...");
  
    if (email) {
      const mailUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      Linking.openURL(mailUrl).catch(() => {
        Alert.alert("Error", "No email app found or unable to open email client.");
      });
    } else {
      Alert.alert("Error", "No valid email ID found.");
    }
  };

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/${storeData?.contact_number}`);
    
  };

  return (
    <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#117943"/>
      <LinearGradient colors={['#117943', '#117943']} style={[styles.gradientContainer,{paddingTop: insets.top}]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left-long" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity style={styles.contactOption} onPress={handleCall}>
              <MaterialIcons name="phone" size={32} color="#117943" />
              <Text style={styles.contactText}>Call Support Team</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
              <MaterialIcons name="email" size={32} color="#117943" />
              <Text style={styles.contactText}>Send Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption} onPress={handleWhatsApp}>
              <FontAwesome6 name="whatsapp" size={32} color="#117943" />
              <Text style={styles.contactText}>Chat on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientContainer: {
    paddingVertical: responsiveHeight(3),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  backButton: {
    marginRight: responsiveWidth(5),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: responsiveWidth(5),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: responsiveHeight(2),
  },
  contactSection: {
    marginBottom: responsiveHeight(4),
  },
  contactOptions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: responsiveHeight(3),
    paddingHorizontal: responsiveHeight(2),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    gap: responsiveHeight(3),
  },
  contactOption: {
    alignItems: 'center',
    width: '100%',
    padding: responsiveHeight(1.5),
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    gap: 15,
  },
  contactText: {
    fontSize: 16,
    color: '000',
    fontWeight: '700',
  },
});

export default SupportScreen;
