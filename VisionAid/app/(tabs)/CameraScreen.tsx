import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import { apiClient } from "../../src/api";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Bạn cần cấp quyền camera để sử dụng</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    setLoading(true);
    const photoData = await cameraRef.current.takePictureAsync({ base64: true });
    setPhoto(photoData.uri);

    try {
      // Sử dụng apiClient thay vì fetch
      const data = await apiClient.post('/analyze', { 
        image: photoData.base64 
      });

      console.log("✅ Response data:", data);

      if (data.audioUrl) {
        const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl });
        await sound.playAsync();
      } else {
        alert("Không nhận được âm thanh từ server.\n" + JSON.stringify(data));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định khi gửi ảnh đến server";
      console.error("Upload failed:", errorMessage);
      alert(`Lỗi khi gửi ảnh đến server: ${errorMessage}`);
    }
 finally {
  setLoading(false);
}

  };

  return (
    <View style={{ flex: 1 }}>
      {photo ? (
        <Image source={{ uri: photo }} style={{ flex: 1 }} />
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 8 }}>Đang xử lý...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={loading}>
        <Text style={styles.text}>📸 Chụp & Gửi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
  },
  text: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
