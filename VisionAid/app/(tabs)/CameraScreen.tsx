import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { apiClient } from "../../src/api";

export default function CameraScreen() {
  const router = useRouter();
  // ✅ TẤT CẢ HOOKS PHẢI Ở TRÊN CÙNG, TRƯỚC BẤT KỲ RETURN NÀO
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const soundRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // ✅ Cleanup useEffect phải ở đây, TRƯỚC các conditional returns
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // ❌ CHỈ SAU KHI TẤT CẢ HOOKS MỚI ĐƯỢC RETURN
  if (!permission) return <View />;
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Bạn cần cấp quyền camera để sử dụng</Text>
        <TouchableOpacity style={styles.iosButton} onPress={requestPermission}>
          <Text style={styles.text}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    setAnalysisResult(null);
    
    try {
      const photoData = await cameraRef.current.takePictureAsync({ base64: false });
      setPhoto(photoData.uri);
      
      const data = await apiClient.analyzeImage({
        uri: photoData.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      console.log('Analysis result:', data);

      if (data.success) {
        setAnalysisResult(data);
        
        if (data.audioUrl) {
          await playAudio(data.audioUrl);
        }
      } else {
        alert("Phân tích thất bại: " + (data.error || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định khi gửi ảnh đến server";
      alert(`Lỗi khi gửi ảnh đến server: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (audioUrl) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Không thể phát âm thanh: ' + error.message);
    }
  };

  const handleRetake = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPhoto(null);
    setAnalysisResult(null);
  };

  const handleReplayAudio = () => {
    if (analysisResult?.audioUrl) {
      playAudio(analysisResult.audioUrl);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {photo ? (
        <View style={{ flex: 1 }}>
          <Image source={{ uri: photo }} style={{ flex: 1 }} />
          
          {analysisResult && (
            <View style={styles.resultContainer}>
              <ScrollView style={styles.resultScroll}>
                <Text style={styles.resultTitle}>Kết quả phân tích:</Text>
                <Text style={styles.resultText}>{analysisResult.textResult}</Text>
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.replayButton}
                onPress={handleReplayAudio}
                activeOpacity={0.7}
              >
                <Text style={styles.replayIcon}>🔊</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {photo && (
        <TouchableOpacity style={styles.previewThumb} onPress={handleRetake}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          <Text style={styles.retakeText}>Chụp lại</Text>
        </TouchableOpacity>
      )}

      {!photo && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePhoto}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={styles.innerCircle} />
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 8, fontSize: 16 }}>Đang xử lý...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  iosButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
  },
  text: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backIcon: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  previewThumb: {
    position: "absolute",
    bottom: 40,
    left: 30,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    width: 54,
    height: 54,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: 54, height: 54, resizeMode: "cover" },
  retakeText: {
    position: 'absolute',
    bottom: 2,
    fontSize: 8,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 6,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 20,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
    zIndex: 10,
  },
  resultScroll: {
    maxHeight: 140,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  replayButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.8)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replayIcon: {
    fontSize: 18,
  },
});
