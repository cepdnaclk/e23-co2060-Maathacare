import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade", 
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ gestureEnabled: false }} 
      /> 
      
      <Stack.Screen name="mother-login" />
      <Stack.Screen name="staff-login" />
      
      <Stack.Screen 
        name="(tabs)" 
        options={{ gestureEnabled: false }} 
      />
    </Stack>
  );
}