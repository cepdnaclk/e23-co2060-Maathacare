import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    // This perfectly hides the top headers and stops the fake bottom tabs from showing up!
    <Stack screenOptions={{ headerShown: false }} />
  );
}
