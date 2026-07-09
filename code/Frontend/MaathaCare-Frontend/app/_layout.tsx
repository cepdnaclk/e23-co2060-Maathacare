import { Stack } from "expo-router";
import '../locales/i18n'; 

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      {/* 1. Splash Screen loads first */}
      <Stack.Screen name="index" /> 
      
      {/* 2. Then transitions to role selection */}
      <Stack.Screen name="role-selection" options={{ gestureEnabled: false }} /> 
      
      <Stack.Screen name="mother-login" />
      <Stack.Screen name="staff-login" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}