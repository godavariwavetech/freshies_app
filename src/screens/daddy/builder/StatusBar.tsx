import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const StatusBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View>
          <Text style={styles.timeText}>9:41</Text>
        </View>
        <Image
          source={{
            uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/cf22995abf0707682c630555b0f7e0023d76ba97?placeholderIfAbsent=true&apiKey=1832ced04f744c8f877e7ae301fc7307",
          }}
          style={styles.leftIcon}
        />
      </View>
      <Image
        source={{
          uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/39f485b75bf74f2c1f46bd74adf92011067299be?placeholderIfAbsent=true&apiKey=1832ced04f744c8f877e7ae301fc7307",
        }}
        style={styles.rightIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontWeight: "500",
  },
  leftIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  rightIcon: {
    width: 64,
    height: 16,
  },
});

export default StatusBar;
