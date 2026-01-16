import { Stack } from "expo-router";
import BottomNav from "../components/BottomNav";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="register" />
        <Stack.Screen name="attendance" />
        <Stack.Screen name="tools" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="daily-report" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="approvals" />
        <Stack.Screen name="materials" />
        <Stack.Screen name="add-project" />
        <Stack.Screen name="project-detail" />
        <Stack.Screen name="project-tools" />
      </Stack>
      <BottomNav />
    </View>
  );
}