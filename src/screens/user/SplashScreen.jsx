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
      <StatusBar backgroundColor="#117943" barStyle="light-content" />
      <View style={styles.imgContainer}>
        <Image
          source={require('../daddy/tabassets/freshieslogo.png')}
          style={{ width: responsiveWidth(72), height: responsiveHeight(20) }}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  )
}
export default SplashScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#117943',
  },
  imgContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text1: {

  }
})