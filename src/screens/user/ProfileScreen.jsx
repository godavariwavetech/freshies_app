import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../components/CustomStatusBar';


const UserProfileScreen = () => {
  const navigation = useNavigation();
  const { customerId, mobileNumber, referralCode, username, address } = useSelector(state => state.Auth);

  const [editMode, setEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);

  const handleSave = () => {
    // Save logic (dispatch to Redux or API call)
    setEditMode(false);
    // Dispatch an update if needed
  };

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#8655d2" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile Info */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://skiblue.co.uk/wp-content/uploads/2015/06/dummy-profile.png' }}
            style={styles.profileImage}
          />
          {!editMode ? (
            <Text style={styles.profileName}>{username}</Text>
          ) : (
            <TextInput
              style={styles.input}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Enter your name"
            />
          )}
          <Text style={styles.profileEmail}>{mobileNumber}</Text>
        </View>

        {/* Address */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SelectServiceFromLocation')}
          style={styles.infoRow}
        >
          <MaterialIcons name="location-on" size={22} color="#8655d2" />
          <Text style={styles.infoText}>{address || 'Tap to select address'}</Text>
          <Icon name="chevron-forward" size={20} color="#aaa" />
        </TouchableOpacity>

        {/* Referral */}
        <View style={styles.infoRow}>
          <MaterialIcons name="card-giftcard" size={22} color="#8655d2" />
          <Text style={styles.infoText}>Referral Code: {referralCode || '-'}</Text>
        </View>

        {/* Edit/Save Button */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={editMode ? handleSave : () => setEditMode(true)}
          >
            <Text style={styles.editButtonText}>{editMode ? 'Save Changes' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;


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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#8655d2',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
