import React from "react";
import { Tabs } from "expo-router";
import { LayoutDashboard, TrendingUp, MessageSquareText } from "lucide-react-native";
import { useApp } from "../../src/context/AppContext";

export default function TabLayout() {
  const { colors } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Executive Desk",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market Pulse",
          tabBarIcon: ({ color }) => (
            <TrendingUp size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI Co-Pilot",
          tabBarIcon: ({ color }) => (
            <MessageSquareText size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
