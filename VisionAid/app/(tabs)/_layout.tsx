import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable swipe back to ensure our gesture system works
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="main" />
      <Stack.Screen name="register" />
      <Stack.Screen name="CameraScreen" />
      <Stack.Screen name="gps" />
      <Stack.Screen name="premium" />
    </Stack>
  );
}
