import React from "react";
import { useLocalSearchParams } from "expo-router";
import MapScreen from "../../src/screen/MapScreen";

type Params = {
  userId?: string;
  otherUserId?: string | string[];
};

export default function MapRoute() {
  const params = useLocalSearchParams<Params>();
  const userId = params.userId ?? "userA";

  let otherUserIds: string[] = [];

  if (!params.otherUserId) {
    otherUserIds = ["userB"];
  } else if (Array.isArray(params.otherUserId)) {
    otherUserIds = params.otherUserId;
  } else {
    const raw = params.otherUserId;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        otherUserIds = parsed.map(String);
      } else {
        otherUserIds = [String(raw)];
      }
    } catch {
      otherUserIds = raw.includes(",")
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [raw];
    }
  }

  return <MapScreen userId={userId} otherUserIds={otherUserIds} />;
}