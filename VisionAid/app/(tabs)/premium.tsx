import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, SafeAreaView, StatusBar, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { PanGestureHandler } from "react-native-gesture-handler";
import { voiceService } from "../../src/services/VoiceServiceAudio";
import { gestureService, GestureType } from "../../src/services/GestureService";

export default function PremiumScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    initializePremiumScreen();
    setupGestureHandlers();
    
    return () => {
      gestureService.removeCallback(handleGesture);
    };
  }, []);

  const initializePremiumScreen = async () => {
    await voiceService.announcePremiumMode();
  };

  const setupGestureHandlers = () => {
    gestureService.addCallback(handleGesture);
  };

  const handleGesture = async (gestureType: GestureType) => {
    switch (gestureType) {
      case 'double-swipe-down':
        await voiceService.announceGestureDetected('home');
        setTimeout(() => {
          router.back();
        }, 500);
        break;
        
      case 'double-swipe-left':
        await voiceService.announceGestureDetected('camera');
        setTimeout(() => {
          router.push("/CameraScreen");
        }, 500);
        break;
        
      case 'double-swipe-right':
        await voiceService.announceGestureDetected('gps');
        setTimeout(() => {
          router.push("/(tabs)/gps");
        }, 500);
        break;
        
      case 'long-press':
        if (selectedPlan) {
          await handleUpgrade(selectedPlan);
        } else {
          await voiceService.speak("Vui lòng chọn gói thành viên trước. Chạm vào một trong các gói bên dưới.");
        }
        break;
        
      default:
        await voiceService.announceGestureNotRecognized();
        break;
    }
  };

  const handleUpgrade = async (plan: string) => {
    await voiceService.speak(`Đang nâng cấp lên gói ${plan}...`);
    
    // Simulate upgrade process
    setTimeout(async () => {
      await voiceService.speak("Nâng cấp thành công! Cảm ơn bạn đã sử dụng VisionAid Premium.");
    }, 2000);
  };

  const selectPlan = async (plan: string, price: string, features: string) => {
    setSelectedPlan(plan);
    await voiceService.speak(`Đã chọn gói ${plan} với giá ${price}. ${features}. Chạm giữ để xác nhận nâng cấp.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <PanGestureHandler onGestureEvent={gestureService.handlePanGesture}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⭐ Premium</Text>
            <Text style={styles.headerSubtitle}>Nâng cấp trải nghiệm VisionAid</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Premium Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.sectionTitle}>Tính năng Premium</Text>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🚀</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Xử lý ảnh nhanh hơn</Text>
                  <Text style={styles.featureDescription}>Phân tích hình ảnh với tốc độ gấp 3 lần</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Độ chính xác cao</Text>
                  <Text style={styles.featureDescription}>AI nâng cao với độ chính xác 99%</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔊</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Nhiều giọng đọc</Text>
                  <Text style={styles.featureDescription}>Lựa chọn từ 10+ giọng đọc khác nhau</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💾</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Lưu trữ không giới hạn</Text>
                  <Text style={styles.featureDescription}>Lưu và quản lý lịch sử phân tích</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📞</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Hỗ trợ 24/7</Text>
                  <Text style={styles.featureDescription}>Hỗ trợ kỹ thuật ưu tiên mọi lúc</Text>
                </View>
              </View>
            </View>

            {/* Pricing Plans */}
            <View style={styles.plansContainer}>
              <Text style={styles.sectionTitle}>Chọn gói phù hợp</Text>
              
              {/* Monthly Plan */}
              <View 
                style={[styles.planCard, selectedPlan === 'Tháng' && styles.selectedPlan]}
                onTouchEnd={() => selectPlan('Tháng', '99.000 đồng mỗi tháng', 'Phù hợp cho người dùng thử nghiệm')}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Gói Tháng</Text>
                  <Text style={styles.planPrice}>99.000đ</Text>
                  <Text style={styles.planPeriod}>/tháng</Text>
                </View>
                <Text style={styles.planDescription}>
                  Phù hợp cho người dùng muốn trải nghiệm
                </Text>
              </View>

              {/* Yearly Plan */}
              <View 
                style={[styles.planCard, styles.popularPlan, selectedPlan === 'Năm' && styles.selectedPlan]}
                onTouchEnd={() => selectPlan('Năm', '990.000 đồng mỗi năm', 'Tiết kiệm 2 tháng so với gói tháng')}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>PHỔ BIẾN</Text>
                </View>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Gói Năm</Text>
                  <Text style={styles.planPrice}>990.000đ</Text>
                  <Text style={styles.planPeriod}>/năm</Text>
                </View>
                <Text style={styles.planDescription}>
                  Tiết kiệm 20% - Phù hợp cho người dùng thường xuyên
                </Text>
              </View>

              {/* Lifetime Plan */}
              <View 
                style={[styles.planCard, selectedPlan === 'Trọn đời' && styles.selectedPlan]}
                onTouchEnd={() => selectPlan('Trọn đời', '2.990.000 đồng một lần', 'Sử dụng vĩnh viễn, không cần gia hạn')}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Gói Trọn Đời</Text>
                  <Text style={styles.planPrice}>2.990.000đ</Text>
                  <Text style={styles.planPeriod}>một lần</Text>
                </View>
                <Text style={styles.planDescription}>
                  Sử dụng vĩnh viễn - Đầu tư dài hạn tốt nhất
                </Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Cách sử dụng:</Text>
              <Text style={styles.instructionItem}>• Chạm vào gói để chọn</Text>
              <Text style={styles.instructionItem}>• Chạm giữ để xác nhận nâng cấp</Text>
              <Text style={styles.instructionItem}>• Vuốt 2 lần xuống: Về trang chính</Text>
              <Text style={styles.instructionItem}>• Vuốt 2 lần trái: Mở Camera</Text>
              <Text style={styles.instructionItem}>• Vuốt 2 lần phải: Mở GPS</Text>
            </View>
          </ScrollView>
        </View>
      </PanGestureHandler>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fef3c7",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  plansContainer: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  selectedPlan: {
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  popularPlan: {
    borderColor: "#f59e0b",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: 20,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  planHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f59e0b",
  },
  planPeriod: {
    fontSize: 14,
    color: "#6b7280",
  },
  planDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  instructionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
});
