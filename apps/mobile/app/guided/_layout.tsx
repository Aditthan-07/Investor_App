import React from "react";
import { Stack } from "expo-router";
import { useApp } from "../../src/context/AppContext";

export default function GuidedLayout() {
  const { colors } = useApp();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="health" />
      <Stack.Screen name="strategy" />
      <Stack.Screen name="breakdown" />
    </Stack>
  );
}
