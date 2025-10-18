import React from "react";
import { useLocalSearchParams } from "expo-router";
import MapScreen from "../../src/screen/MapScreen";

export default function MapRoute() {
  const params = useLocalSearchParams();
  const userId = (params.userId as string) ?? "userA";
  const otherUserId = (params.otherUserId as string) ?? "userB";

  return <MapScreen userId={userId} otherUserId={otherUserId} />;
}