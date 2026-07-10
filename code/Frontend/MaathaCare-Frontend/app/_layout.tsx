import { Stack } from "expo-router";
import i18n from "i18next";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../locales/i18n"; // Ensure this import points to your i18n config

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure i18n is fully initialized before showing the app
    if (i18n.isInitialized) {
      setIsReady(true);
    } else {
      i18n.on("initialized", () => setIsReady(true));
    }
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      {/* 1. Splash Screen */}
      <Stack.Screen name="index" />

      {/* 2. Role selection */}
      <Stack.Screen name="role-selection" options={{ gestureEnabled: false }} />

      <Stack.Screen name="mother-login" />
      <Stack.Screen name="staff-login" />

      {/* 3. Main App Tabs */}
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
