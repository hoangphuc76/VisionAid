import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { gestureService, GestureType } from '../src/services/GestureService';

/**
 * Gesture Test Screen
 * Use this screen to test and debug gesture detection
 * Navigate to: /gesture-test
 */
export default function GestureTestScreen() {
  const [lastGesture, setLastGesture] = useState<GestureType | null>(null);
  const [gestureHistory, setGestureHistory] = useState<Array<{ type: GestureType; time: string }>>([]);
  const [gestureCount, setGestureCount] = useState(0);

  useEffect(() => {
    // Setup gesture callback
    const handleGesture = (gestureType: GestureType) => {
      console.log(`🎯 TEST: Gesture detected - ${gestureType}`);
      
      setLastGesture(gestureType);
      setGestureCount(prev => prev + 1);
      
      // Add to history
      const timestamp = new Date().toLocaleTimeString('vi-VN');
      setGestureHistory(prev => [
        { type: gestureType, time: timestamp },
        ...prev.slice(0, 9), // Keep last 10
      ]);
    };

    gestureService.addCallback(handleGesture);

    return () => {
      gestureService.removeCallback(handleGesture);
    };
  }, []);

  const getGestureEmoji = (type: GestureType): string => {
    switch (type) {
      case 'double-swipe-left': return '👈👈';
      case 'double-swipe-right': return '👉👉';
      case 'double-swipe-up': return '👆👆';
      case 'double-swipe-down': return '👇👇';
      case 'long-press': return '⏱️';
      default: return '❓';
    }
  };

  const getGestureName = (type: GestureType): string => {
    switch (type) {
      case 'double-swipe-left': return 'Vuốt trái 2 lần';
      case 'double-swipe-right': return 'Vuốt phải 2 lần';
      case 'double-swipe-up': return 'Vuốt lên 2 lần';
      case 'double-swipe-down': return 'Vuốt xuống 2 lần';
      case 'long-press': return 'Giữ 2 giây';
      default: return 'Unknown';
    }
  };

  const getGestureColor = (type: GestureType): string => {
    switch (type) {
      case 'double-swipe-left': return '#3b82f6';
      case 'double-swipe-right': return '#10b981';
      case 'double-swipe-up': return '#f59e0b';
      case 'double-swipe-down': return '#8b5cf6';
      case 'long-press': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Gesture Test Lab</Text>
        <Text style={styles.subtitle}>Test và debug gesture detection</Text>
      </View>

      <PanGestureHandler onGestureEvent={gestureService.handlePanGesture}>
        <View style={styles.gestureArea}>
          <Text style={styles.gestureAreaTitle}>Khu vực test gesture</Text>
          <Text style={styles.gestureAreaSubtitle}>Vuốt hoặc giữ ở đây</Text>
          
          {lastGesture && (
            <View style={[styles.lastGestureContainer, { borderColor: getGestureColor(lastGesture) }]}>
              <Text style={styles.gestureEmoji}>{getGestureEmoji(lastGesture)}</Text>
              <Text style={styles.gestureName}>{getGestureName(lastGesture)}</Text>
            </View>
          )}

          {!lastGesture && (
            <Text style={styles.waitingText}>Đang chờ gesture...</Text>
          )}
        </View>
      </PanGestureHandler>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{gestureCount}</Text>
          <Text style={styles.statLabel}>Tổng số gestures</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{gestureHistory.length}</Text>
          <Text style={styles.statLabel}>Lịch sử</Text>
        </View>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>📊 Lịch sử Gestures</Text>
        <ScrollView style={styles.historyList}>
          {gestureHistory.length === 0 && (
            <Text style={styles.emptyText}>Chưa có gesture nào</Text>
          )}
          {gestureHistory.map((item, index) => (
            <View 
              key={`${item.time}-${index}`} 
              style={[styles.historyItem, { borderLeftColor: getGestureColor(item.type) }]}
            >
              <Text style={styles.historyEmoji}>{getGestureEmoji(item.type)}</Text>
              <View style={styles.historyContent}>
                <Text style={styles.historyName}>{getGestureName(item.type)}</Text>
                <Text style={styles.historyTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📖 Hướng dẫn:</Text>
        <Text style={styles.instruction}>• Vuốt nhanh và quyết đoán</Text>
        <Text style={styles.instruction}>• 2 lần vuốt trong vòng 0.6 giây</Text>
        <Text style={styles.instruction}>• Khoảng cách tối thiểu: 50px</Text>
        <Text style={styles.instruction}>• Giữ 2 giây cho long press</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#1f2937',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  gestureArea: {
    margin: 16,
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gestureAreaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  gestureAreaSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  lastGestureContainer: {
    marginTop: 16,
    padding: 20,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: 'center',
  },
  gestureEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  gestureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  waitingText: {
    fontSize: 16,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  historyContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  historyList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  historyEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  instructionsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 13,
    color: '#1e40af',
    marginBottom: 4,
  },
});
