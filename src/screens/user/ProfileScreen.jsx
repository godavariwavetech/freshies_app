import React, { useState, useEffect } from 'react';
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
import Clipboard from '@react-native-clipboard/clipboard';
import { getUserData, updateUserProfile } from '../../services/services';
import { launchImageLibrary } from 'react-native-image-picker';


const UserProfileScreen = () => {
  const navigation = useNavigation();
  const { mobileNumber, referralCode, username, address } = useSelector(state => state.Auth);
  const [base64Image, setBase64Image] = useState('');
  const [imageUri, setImageUri] = useState(userData?.profile_image || '');

  const [editMode, setEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);
  const { customerId } = useSelector((state) => state.Auth);
  const [userData, setUserData] = useState(null);

  const getUserProfile = async () => {
    try {
      const res = await getUserData({ customer_id: customerId });
      if (res.status === 200 && res.data?.length > 0) {
        const user = res.data[0];
        setUserData(user);
        setEditedUsername(user.customer_name || '');
      }
    } catch (err) {
      console.log('Error loading profile:', err.message);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const handleSave = async () => {
    const payload = {
      customer_id: customerId,
      customer_name: editedUsername,
      imagesData: base64Image, // if user selected new image
      profile_image: "https://control.abhi24.in/uploaded_images/6969351751024669279.jpeg"
    };
     console.log(payload)
    try {
      const resposne  =  await updateUserProfile(payload);
      console.log(resposne)
      setEditMode(false);
      getUserProfile(); // reload updated data
    } catch (err) {
      console.log('Error updating profile:', err.message);
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true, maxHeight: 600, maxWidth: 600 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.warn('Image picker error:', response.errorMessage);
          return;
        }

        const asset = response.assets?.[0];
        if (asset) {
          setBase64Image(asset.base64);
          setImageUri(asset.uri);
        }
      }
    );
  };

  const copyReferralCode = () => {
    if (referralCode) {
      Clipboard.setString(referralCode);
    }
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
          <TouchableOpacity
            disabled={!editMode}
            onPress={pickImage}
            style={{ borderRadius: 100, overflow: 'hidden' }}
          >
            <Image
              source={{
                uri: imageUri || 'https://skiblue.co.uk/wp-content/uploads/2015/06/dummy-profile.png',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          {!editMode ? (
            <Text style={styles.profileName}>{userData?.customer_name}</Text>
          ) : (
            <TextInput
              style={styles.input}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Enter your name"
            />
          )}
          <Text style={styles.profileEmail}>{userData?.customer_mobile_number}</Text>
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
          <Text style={[styles.infoText, { flex: 1 }]}>
            Referral Code: {referralCode || '-'}
          </Text>
          {referralCode && (
            <TouchableOpacity onPress={copyReferralCode}>
              <MaterialIcons name="content-copy" size={20} color="#8655d2" />
            </TouchableOpacity>
          )}
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
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
