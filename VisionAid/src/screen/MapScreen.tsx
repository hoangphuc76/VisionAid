import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { db, ref, set, onValue, remove } from "../firebaseConfig";

type LocationType = { latitude: number; longitude: number };

export default function MapScreen({ userId = "userA", otherUserId = "userB" }) {
  const [myLocation, setMyLocation] = useState<LocationType | null>(null);
  const [otherLocation, setOtherLocation] = useState<LocationType | null>(null);

  useEffect(() => {
    let listener: any;

    (async () => {
      // 1️⃣ Xin quyền truy cập vị trí
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Cần quyền truy cập vị trí để chia sẻ trên bản đồ.");
        return;
      }

      // 2️⃣ Lấy vị trí hiện tại
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = loc.coords;
      setMyLocation({ latitude, longitude });

      // 3️⃣ Ghi vị trí lên Firebase
      await set(ref(db, `locations/${userId}`), {
        lat: latitude,
        lng: longitude,
        ts: Date.now(),
      });

      // 4️⃣ Lắng nghe vị trí người khác
      const otherRef = ref(db, `locations/${otherUserId}`);
      listener = onValue(otherRef, (snapshot) => {
        const val = snapshot.val();
        if (val && val.lat && val.lng) {
          setOtherLocation({ latitude: val.lat, longitude: val.lng });
        } else {
          setOtherLocation(null);
        }
      });

      // 5️⃣ Cập nhật định kỳ vị trí (nếu user di chuyển)
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setMyLocation({ latitude, longitude });
          await set(ref(db, `locations/${userId}`), {
            lat: latitude,
            lng: longitude,
            ts: Date.now(),
          });
        }
      );
    })();

    // 6️⃣ Dọn dữ liệu khi rời khỏi màn
    return () => {
      remove(ref(db, `locations/${userId}`));
      if (listener) listener();
    };
  }, []);

  return (
    <View style={styles.container}>
      {myLocation ? (
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={{
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={myLocation} title="Bạn" pinColor="red" />
          {otherLocation && (
            <Marker coordinate={otherLocation} title="Người kia" pinColor="blue" />
          )}
        </MapView>
      ) : (
        <View style={styles.center}>
          <Text>Đang lấy vị trí của bạn...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
