import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { applicationCharges } from '../../services/services';

const RefundPolicyScreen = () => {
  const navigation = useNavigation();
  const [policyItems, setPolicyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRefundPolicy = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await applicationCharges();
        console.log("data", data);
        const rawPolicy = data?.[0]?.refund_policy;
        console.log("rawPolicy", rawPolicy);
        if (rawPolicy) {
          const sanitize = (value) =>
            typeof value === 'string'
              // keep \n and \r so paragraphs are preserved; strip other control chars
              ? value.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F]/g, '').trim()
              : value;

          const parsePolicy = (value) => {
            if (typeof value !== 'string') return value;
            try {
              return JSON.parse(sanitize(value));
            } catch {
              return sanitize(value);
            }
          };

          const parsed = parsePolicy(rawPolicy);
          const normalized = (Array.isArray(parsed) ? parsed : [parsed])
            .flatMap(item => {
              if (item == null) return [];
              const cleaned = sanitize(String(item));
              const hasParagraphBreak = /\r?\n\s*\r?\n/.test(cleaned);
              return cleaned
                .split(hasParagraphBreak ? /\r?\n\s*\r?\n/ : /\r?\n+/)
                .map(line => line.trim())
                .filter(Boolean);
            });

          setPolicyItems(normalized);
        } else {
          setPolicyItems([]);
        }
      } catch (err) {
        console.error('Failed to load refund policy', err);
        setError('Unable to load refund policy right now. Please try again.');
        setPolicyItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRefundPolicy();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#117943" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left-long" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Refund Policy</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#117943" />
            <Text style={styles.loadingText}>Loading refund policy...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : policyItems.length ? (
          policyItems.map((item, index) => (
            <View key={`${index}-${item?.slice?.(0, 10) || 'policy'}`} style={styles.policyItem}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.policyText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>Refund policy is not available at the moment.</Text>
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#117943',
    gap: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: responsiveHeight(3),
    paddingLeft: responsiveWidth(5),
  },
  backButton: {
    width: responsiveWidth(7),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: responsiveHeight(4),
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: "left",
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#117943',
    marginRight: 10,
    lineHeight: 20,
  },
  policyText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  emptyState: {
    fontSize: 14,
    color: '#666',
  },
});
export default RefundPolicyScreen;
