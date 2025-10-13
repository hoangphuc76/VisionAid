import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth"; 

export default function MainScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handlePress = (label: string) => {
    if (label === "Camera") {
      router.push("/CameraScreen"); 
    } else {
      Alert.alert(`Bạn đã bấm nút: ${label}`);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(tabs)");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Chào mừng{user?.email ? `, ${user.email}` : ""}!
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#2563EB" }]}
        onPress={() => handlePress("Camera")}
      >
        <Text style={styles.buttonText}>Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#10B981" }]}
        onPress={() => handlePress("GPS")}
      >
        <Text style={styles.buttonText}>Định vị cho người thân</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#F59E0B" }]}
        onPress={() => handlePress("Membership")}
      >
        <Text style={styles.buttonText}>Mua gói thành viên</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5"
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600"
  },
  button: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonText: { fontSize: 28, fontWeight: "bold", color: "#fff" },
});
