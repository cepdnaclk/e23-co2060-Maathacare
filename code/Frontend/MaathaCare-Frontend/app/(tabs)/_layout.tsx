import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the mother is logged in by looking for the token/user data
  useEffect(() => {
    const checkLoginStatus = async () => {
      // 🟢 Changed "user" to "userToken" to match your ProfileScreen logic
      const token = await AsyncStorage.getItem("userToken");
      setIsLoggedIn(!!token); 
    };
    checkLoginStatus();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF69B4", // Your MaathaCare Pink
        headerShown: false,
      }}
    >
      {/* 1. Home - Hide after login because it contains login/register buttons */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          href: isLoggedIn ? null : "/", // 🟢 Hides tab from bar if logged in
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />

      {/* 2. Explore - Keep visible for the weekly milestones */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={28} color={color} />
          ),
        }}
      />

      {/* 3. PHM Profile - Remove this as we want the Mother's Profile instead */}
      <Tabs.Screen
        name="phm-profile"
        options={{
          href: null, // 🔴 Completely removed from bottom bar
        }}
      />

      {/* 4. Mother's Profile - Only show if logged in */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: isLoggedIn ? "/profile" : null, // 🟢 Only show if logged in
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
      />

      {/* 5. Register - Hide after login */}
      <Tabs.Screen
        name="register"
        options={{
          href: null, // 🔴 Removed from bottom bar
        }}
      />

      {/* 6. Dashboard - Hide as per your requirement */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null, // 🔴 Removed from bottom bar
        }}
      />
    </Tabs>
  );
}