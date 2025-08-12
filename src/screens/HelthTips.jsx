import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import FocusAwareStatusBar from '../components/CustomStatusBar';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelthTips = ({ navigation }) => {
  const [Qualityfaqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const fetchFAQs = async () => {
   
    try {
      const response = await axios.get('https://api.abhi24.in/public_app/gethealthtips'); // Replace with your real API
      
      if (response.status === 200) {
        setFaqs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const toggleExpand = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };

  return (
    <View style={styles.container}>
         <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HelthTips</Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8655d2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Qualityfaqs.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.faqHeader}>
                  <Text style={styles.question}>{item.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
                {isExpanded && <Text style={styles.answer}>{item.answer}</Text>}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default HelthTips;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: "#8655d2"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: "white"
  },
  scrollContainer: {
    padding: 12,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  answer: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
