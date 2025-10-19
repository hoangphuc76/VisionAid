import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";
import { db, onValue, ref, remove, set } from "../firebaseConfig";

type LocationType = { latitude: number; longitude: number };

type Props = {
  userId?: string;
  otherUserIds?: string[];
};

/**
 * Helper: haversine distance (meters)
 */
function haversineMeters(a: LatLng, b: LatLng) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // earth radius in meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

/**
 * Decode encoded polyline (Google) -> array of LatLng
 */
function decodePolyline(encoded: string): LatLng[] {
  const path: LatLng[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    path.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return path;
}

/**
 * Fetch route from Google Directions API (requires API key)
 * Returns { coords, distanceMeters } or throws.
 */
async function fetchGoogleRoute(origin: LatLng, dest: LatLng, apiKey: string, mode = "walking") {
  const originStr = `${origin.latitude},${origin.longitude}`;
  const destStr = `${dest.latitude},${dest.longitude}`;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    originStr
  )}&destination=${encodeURIComponent(destStr)}&mode=${mode}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== "OK" || !json.routes || !json.routes.length) {
    throw new Error(`Directions API error: ${json.status}`);
  }
  const route = json.routes[0];
  // try to get leg distance (meters)
  const leg = route.legs && route.legs[0];
  const distanceMeters = leg && leg.distance && typeof leg.distance.value === "number" ? leg.distance.value : 0;
  // decode overview_polyline (general path)
  const poly = route.overview_polyline && route.overview_polyline.points;
  const coords = poly ? decodePolyline(poly) : [];
  return { coords, distanceMeters };
}

export default function MapScreen({ userId = "userA", otherUserIds = ["userB"] }: Props) {
  const [myLocation, setMyLocation] = useState<LocationType | null>(null);
  const [otherLocations, setOtherLocations] = useState<Record<string, LocationType>>({});
  const [routes, setRoutes] = useState<
    Record<string, { coords: LatLng[]; distanceMeters: number }>
  >({});
  const mapRef = useRef<MapView | null>(null);

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    let firebaseUnsubs: Array<() => void> = [];
    let locationSubscription: any = null;

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

      // 4️⃣ Lắng nghe vị trí của nhiều người khác
      const ids = (otherUserIds || []).filter(Boolean);
      ids.forEach((id) => {
        const otherRef = ref(db, `locations/${id}`);
        const unsub = onValue(otherRef, (snapshot) => {
          const val = snapshot.val();
          setOtherLocations((prev) => {
            const next = { ...prev };
            if (val && val.lat != null && val.lng != null) {
              next[id] = { latitude: val.lat, longitude: val.lng };
            } else {
              delete next[id];
            }
            return next;
          });
        });
        // onValue returns an unsubscribe function (listener)
        firebaseUnsubs.push(unsub);
      });

      // 5️⃣ Cập nhật định kỳ vị trí (nếu user di chuyển)
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 1 },
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setMyLocation({ latitude, longitude });
          console.log("Updating location:", latitude, longitude);
          try {
            await set(ref(db, `locations/${userId}`), {
              lat: latitude,
              lng: longitude,
              ts: Date.now(),
            });
          } catch (e) {
            // optional: handle write error
            console.warn("Failed to write location:", e);
          }
        }
      );
    })();

    // 6️⃣ Dọn dữ liệu khi rời khỏi màn
    return () => {
      try {
        remove(ref(db, `locations/${userId}`));
      } catch (e) {
        console.warn("Failed to remove location on exit:", e);
      }

      // unsubscribe tất cả firebase listeners
      firebaseUnsubs.forEach((u) => {
        try {
          u();
        } catch {}
      });
      // clear otherLocations
      setOtherLocations({});

      // stop location watcher
      if (locationSubscription && typeof locationSubscription.remove === "function") {
        try {
          locationSubscription.remove();
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function computeRoutes() {
      if (!myLocation) return;
      const entries = Object.entries(otherLocations);
      const nextRoutes: Record<string, { coords: LatLng[]; distanceMeters: number }> = {};

      await Promise.all(
        entries.map(async ([id, loc]) => {
          try {
            if (GOOGLE_MAPS_API_KEY) {
              // try Google Directions
              const { coords, distanceMeters } = await fetchGoogleRoute(
                { latitude: myLocation.latitude, longitude: myLocation.longitude },
                { latitude: loc.latitude, longitude: loc.longitude },
                GOOGLE_MAPS_API_KEY,
                "walking"
              );
              if (!cancelled) nextRoutes[id] = { coords, distanceMeters };
            } else {
              // fallback: straight line + haversine distance
              const coords = [
                { latitude: myLocation.latitude, longitude: myLocation.longitude },
                { latitude: loc.latitude, longitude: loc.longitude },
              ];
              const distanceMeters = Math.round(haversineMeters(coords[0], coords[1]));
              if (!cancelled) nextRoutes[id] = { coords, distanceMeters };
            }
          } catch (e) {
            // if directions fail, fallback to straight line
            const coords = [
              { latitude: myLocation.latitude, longitude: myLocation.longitude },
              { latitude: loc.latitude, longitude: loc.longitude },
            ];
            const distanceMeters = Math.round(haversineMeters(coords[0], coords[1]));
            if (!cancelled) nextRoutes[id] = { coords, distanceMeters };
          }
        })
      );

      if (!cancelled) setRoutes(nextRoutes);
    }

    computeRoutes();

    return () => {
      cancelled = true;
    };
  }, [myLocation, JSON.stringify(otherLocations)]);

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
          {Object.entries(otherLocations).map(([id, loc]) => (
            <Marker key={id} coordinate={loc} title={id} pinColor="blue" />
          ))}

          {/* draw routes */}
          {Object.entries(routes).map(([id, r]) => (
            <React.Fragment key={`route-${id}`}>
              <Polyline coordinates={r.coords} strokeWidth={4} strokeColor="red" geodesic />
              {/* small label: distance */}
              {r.coords.length > 0 && (
                <Marker
                  coordinate={r.coords[Math.floor(r.coords.length / 2)]}
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={false}
                >
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{`${Math.round(r.distanceMeters)} m`}</Text>
                  </View>
                </Marker>
              )}
            </React.Fragment>
          ))}
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
  distanceBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceText: { color: "#fff", fontSize: 12 },
});
