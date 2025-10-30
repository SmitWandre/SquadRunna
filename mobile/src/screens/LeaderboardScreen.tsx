import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export default function LeaderboardScreen() {
  const [selectedTab, setSelectedTab] = useState<"users" | "squads">("users");

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["globalLeaderboard"],
    queryFn: async () => {
      const res = await api.get("/leaderboard/global/");
      return res.data;
    },
  });

  const { data: squadData, isLoading: squadLoading } = useQuery({
    queryKey: ["squadLeaderboard"],
    queryFn: async () => {
      const res = await api.get("/squads/");
      return res.data;
    },
  });

  const isLoading = userLoading || squadLoading;

  if (isLoading)
    return (
      <View style={styles.outer}>
        <Text style={styles.loading}>Loading leaderboard…</Text>
      </View>
    );

  const getRankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const sortedSquads = [...(squadData || [])]
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    .slice(0, 10);

  return (
    <View style={styles.outer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "users" && styles.tabActive]}
            onPress={() => setSelectedTab("users")}
          >
            <Text style={[styles.tabText, selectedTab === "users" && styles.tabTextActive]}>
              Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "squads" && styles.tabActive]}
            onPress={() => setSelectedTab("squads")}
          >
            <Text style={[styles.tabText, selectedTab === "squads" && styles.tabTextActive]}>
              Squads
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        {selectedTab === "users" ? (
          <View style={styles.card}>
            <Text style={styles.title}>🏆 Top Runners</Text>
            {userData?.global_top_10?.map((u: any, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.row,
                  idx < 3 && styles.topThree,
                ]}
              >
                <View style={styles.left}>
                  <Text style={[styles.rank, idx < 3 && styles.rankTop]}>
                    {getRankMedal(idx + 1)}
                  </Text>
                  <View>
                    <Text style={styles.name}>{u.display_name}</Text>
                    <Text style={styles.username}>@{u.username}</Text>
                  </View>
                </View>
                <View style={styles.pointsCol}>
                  <Text style={[styles.points, idx < 3 && styles.pointsTop]}>
                    {u.total_points}
                  </Text>
                  <Text style={styles.pointsLabel}>pts</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>🏆 Top Squads</Text>
            {sortedSquads.map((squad: any, idx: number) => (
              <View
                key={squad.id}
                style={[
                  styles.row,
                  idx < 3 && styles.topThree,
                ]}
              >
                <View style={styles.left}>
                  <Text style={[styles.rank, idx < 3 && styles.rankTop]}>
                    {getRankMedal(idx + 1)}
                  </Text>
                  <View>
                    <Text style={styles.name}>{squad.name}</Text>
                    <Text style={styles.username}>
                      {squad.member_count || 0} members
                    </Text>
                  </View>
                </View>
                <View style={styles.pointsCol}>
                  <Text style={[styles.points, idx < 3 && styles.pointsTop]}>
                    {squad.total_points || 0}
                  </Text>
                  <Text style={styles.pointsLabel}>pts</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    backgroundColor: "#1f2937",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#fc5200",
  },
  tabText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  inner: { padding: 16, paddingBottom: 40 },
  loading: { color: "#fff", padding: 16 },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#374151",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  topThree: {
    borderWidth: 2,
    borderColor: "#fc5200",
    backgroundColor: "#451a03",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  rank: {
    color: "#9ca3af",
    fontWeight: "700",
    width: 36,
    textAlign: "center",
    fontSize: 14,
  },
  rankTop: {
    fontSize: 20,
  },
  name: { color: "#fff", fontWeight: "600", fontSize: 16 },
  username: { color: "#d1d5db", fontSize: 12, marginTop: 2 },
  pointsCol: { alignItems: "flex-end", justifyContent: "center" },
  points: { color: "#818cf8", fontSize: 22, fontWeight: "700" },
  pointsTop: { color: "#fc5200" },
  pointsLabel: {
    color: "#9ca3af",
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 2,
  },
});
