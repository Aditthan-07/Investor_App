import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const VersionBadge = () => (
  <View style={styles.container}>
    <Text style={styles.text}>FinSight AI v1.0.0 (Build 1) • Internal Release</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 11,
    color: "#6B7280",
    letterSpacing: 0.5,
  },
});
