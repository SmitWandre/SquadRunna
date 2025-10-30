import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export default function SquadLeaderboardTab({ squadId }: { squadId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["squadLeaderboard", squadId],
    queryFn: async () => {
      const res = await api.get(`/squads/${squadId}/leaderboard/`);
      return res.data;
    },
  });

  if (isLoading) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Squad Leaderboard</Text>
      {data.members.map((m: any, idx: number) => (
        <View key={idx} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{m.display_name}</Text>
            <Text style={styles.username}>@{m.username}</Text>
            <Text style={styles.streak}>
              🔥 Streak: {m.current_streak_weeks}w (best {m.longest_streak_weeks}w)
            </Text>
          </View>
          <View style={styles.pointsCol}>
            <Text style={styles.points}>{m.total_points}</Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { color: "#fff", padding: 16 },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#374151",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  name: { color: "#fff", fontWeight: "600", fontSize: 15 },
  username: { color: "#d1d5db", fontSize: 12 },
  streak: { color: "#fb923c", fontSize: 12, marginTop: 2 },
  pointsCol: { alignItems: "flex-end", justifyContent: "center" },
  points: { color: "#818cf8", fontSize: 20, fontWeight: "700" },
  pointsLabel: { color: "#9ca3af", fontSize: 10, textTransform: "uppercase" },
});
