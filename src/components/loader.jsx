import React from "react";
import { ActivityIndicator, View } from "react-native";
const Loader =({size="small",color="#D32F2F"}) => {
    return(
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
           <ActivityIndicator size={size} color={color} />
        </View>
       
    )
}
export default Loader;