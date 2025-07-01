import { SafeAreaView, StyleSheet, View, Image, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setInitial } from '../../redux/reducers/auth'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'

const SplashScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.Auth);
  const { rehydrated } = useSelector(state => state.Auth._persist);
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setInitial())
    if (rehydrated) {
      setTimeout(() => {
        if (!token) {
          navigation.replace('OnboardingScreen');
        }
      }, 500);
    }
  }, [token, rehydrated]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8655d2" barStyle="light-content" />
      <View style={styles.imgContainer}>
        <Image source={require('../daddy/tabassets/voiletsplash.png')} style={{ flex: 1, width: responsiveWidth(100), height: responsiveHeight(100) }} />
      </View>
    </SafeAreaView>
  )
}
export default SplashScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8655d2',
  },
  imgContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text1: {

  }
})