import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* headerShown: false artinya kita menyembunyikan header putih bawaan Expo 
        di SEMUA halaman, supaya desain custom kita yang tampil penuh.
      */}
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="register" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="tools" />
      {/* Halaman lain akan otomatis mengikuti aturan screenOptions di atas */}
    </Stack>
  );
}