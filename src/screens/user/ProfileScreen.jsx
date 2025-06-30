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
import deliveryBoy from "../../screens/daddy/tabassets/deliveryBoy.png"


const UserProfileScreen = () => {
  const navigation = useNavigation();
  const { mobileNumber, referralCode, username, address } = useSelector(state => state.Auth);
  const [base64Image, setBase64Image] = useState('');
  const [imageUri, setImageUri] = useState(userData?.profile_image || '');
  const [editMode, setEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);
  const { customerId } = useSelector((state) => state.Auth);
  const [userData, setUserData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('Morning (5.00 AM – 7.30 AM)');
  const [preferences, setPreferences] = useState({
    callBefore: false,
    ringBell: false,
    leaveAtDoorstep: false,
  });

  const getUserProfile = async () => {
    try {
      const res = await getUserData({ customer_id: customerId });
      console.log("response0000", res.data[0])
      if (res.status === 200 && res.data?.length > 0) {
        const user = res.data[0];
        setUserData(user);
        setEditedUsername(user.customer_name || '');
        setSelectedSlot(user?.delivery_time_slot || 'Morning (5.00 AM – 7.30 AM)');
        setPreferences({
          callBefore: user?.call_before_delivery || false,
          ringBell: user?.ring_bell || false,
          leaveAtDoorstep: user?.leave_at_doorstep || false,
        });
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
      imagesData: `data:image/jpeg;base64,${base64Image}`,
      profile_image: userData?.profile_image,
      address: address,
      call_before_delivery: preferences.callBefore,
      ring_bell: preferences.ringBell,
      leave_at_doorstep: preferences.leaveAtDoorstep,
    };
   console.log("pyaloefefdd", payload)
    try {
      const res = await updateUserProfile(payload);
      console.log("0000000000000", res)
      setEditMode(false);
      getUserProfile();
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
 
  const handleUsernameChange = (text) => {
    if (!editMode) setEditMode(true);
    setEditedUsername(text);
  };

  const togglePreference = (key) => {
    if (!editMode) setEditMode(true);
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
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
                uri: userData?.profile_image || imageUri || 'https://skiblue.co.uk/wp-content/uploads/2015/06/dummy-profile.png',
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

        {/* Account & Preferences Section */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => navigation.navigate('SelectServiceFromLocation')}
          >
            <View>
              <Text style={styles.cardTitle}>Address</Text>
              <Text style={styles.cardSub}>{address || 'Tap to select address'}</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#aaa" />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.cardRow}
            onPress={() => {
              if (!editMode) setEditMode(true);
              setSelectedSlot('Morning (5.00 AM – 7.30 AM)'); // You can change this to show a picker
            }}
          >
            <View>
              <Text style={styles.cardTitle}>Delivery Time Slot</Text>
              <Text style={styles.cardSub}>{selectedSlot}</Text>
            </View>
          </TouchableOpacity> */}

        </View>

        {/* Banner */}
        <View style={styles.bannerBox}>
          <Text style={styles.bannerText}>
            Help our delivery partner with your customized delivery preferences
          </Text>
          <Image
            source={deliveryBoy}
            style={styles.bannerImage}
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Delivery Preferences</Text>
        <View style={styles.preferenceRow}>
          {/* Call before delivery */}
          <TouchableOpacity
            style={styles.prefCard}
            onPress={() => editMode && togglePreference('callBefore')}
            activeOpacity={editMode ? 0.7 : 1}
          >
            <Icon name="call-outline" size={26} color="#8655d2" />
            <Text style={styles.prefText}>Call before delivery</Text>
            <MaterialIcons
              name={preferences.callBefore ? 'toggle-on' : 'toggle-off'}
              size={36}
              color={preferences.callBefore ? '#8655d2' : '#ccc'}
            />
          </TouchableOpacity>

          {/* Ring the bell */}
          <TouchableOpacity
            style={styles.prefCard}
            onPress={() => editMode && togglePreference('ringBell')}
            activeOpacity={editMode ? 0.7 : 1}
          >
            <Icon name="notifications-outline" size={26} color="#8655d2" />
            <Text style={styles.prefText}>Ring the bell</Text>
            <MaterialIcons
              name={preferences.ringBell ? 'toggle-on' : 'toggle-off'}
              size={36}
              color={preferences.ringBell ? '#8655d2' : '#ccc'}
            />
          </TouchableOpacity>

          {/* Leave at doorstep */}
          <TouchableOpacity
            style={styles.prefCard}
            onPress={() => editMode && togglePreference('leaveAtDoorstep')}
            activeOpacity={editMode ? 0.7 : 1}
          >
            <Icon name="home-outline" size={26} color="#8655d2" />
            <Text style={styles.prefText}>Leave at doorstep</Text>
            <MaterialIcons
              name={preferences.leaveAtDoorstep ? 'toggle-on' : 'toggle-off'}
              size={36}
              color={preferences.leaveAtDoorstep ? '#8655d2' : '#ccc'}
            />
          </TouchableOpacity>
        </View>



        {/* Edit/Save Button */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={[
              styles.editButton,
              editMode && styles.editButtonActive, // add highlighted style if editMode
            ]}
            onPress={editMode ? handleSave : () => setEditMode(true)}
          >
            <Text style={styles.editButtonText}>
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </Text>
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#8655d2',
    elevation: 2,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 5,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  prefCard: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 8,
  },
  prefText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
  },

  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  profileEmail: {
    fontSize: 13,
    color: '#888',
  },
  editButtonActive: {
    backgroundColor: '#6f40c5',
    shadowColor: '#8655d2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#8655d2',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  editButtonActive: {
    backgroundColor: '#6f40c5', // slightly different from default
    shadowColor: '#8655d2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 7,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderBottomWidth: 0.5,
    // borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  cardSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    maxWidth: 240,
  },

  bannerBox: {
    backgroundColor: '#FFF6DC',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingRight: 6,
  },
  bannerImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  sectionTitle: {
    marginTop: 18,
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    paddingLeft: 4,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  prefCard: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  prefText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    color: '#333',
  },
});
