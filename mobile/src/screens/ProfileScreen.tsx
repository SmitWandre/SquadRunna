import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuthStore } from "../state/authStore";

export default function ProfileScreen() {
  const { profile, logout } = useAuthStore();
  const qc = useQueryClient();

  const { data: myBadges } = useQuery({
    queryKey: ["myBadges"],
    queryFn: async () => {
      const res = await api.get("/shop/my-badges/");
      return res.data;
    },
  });

  const { data: squadsData } = useQuery({
    queryKey: ["mySquads"],
    queryFn: async () => {
      const res = await api.get("/squads/");
      return res.data;
    },
  });

  const { data: summaryData } = useQuery({
    queryKey: ["weeklySummary"],
    queryFn: async () => {
      const res = await api.get("/squads/me/weekly-summary/");
      return res.data;
    },
  });

  const { data: runsData } = useQuery({
    queryKey: ["weeklyRuns"],
    queryFn: async () => {
      const res = await api.get("/runs/weekly/");
      return res.data;
    },
  });

  const totalPoints = squadsData?.reduce((sum: number, s: any) => sum + (s.total_points || 0), 0) || 0;
  const totalSquads = squadsData?.length || 0;
  const totalRuns = runsData?.runs?.length || 0;
  const totalDistance = runsData?.total_distance_km || 0;
  const totalStreaks = summaryData?.summary?.reduce((sum: number, s: any) => sum + s.current_streak_weeks, 0) || 0;

  const equipMutation = useMutation({
    mutationFn: async (badgeId: number) => {
      const response = await api.post(`/shop/badges/${badgeId}/equip/`);
      return response;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBadges"] });
      Alert.alert("Success!", "Badge equipped!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error?.response?.data?.error || "Failed to equip badge");
    },
  });

  const equippedBadge = myBadges?.find((ub: any) => ub.is_equipped);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "#94a3b8";
      case "rare": return "#60a5fa";
      case "epic": return "#a78bfa";
      case "legendary": return "#fbbf24";
      default: return "#9ca3af";
    }
  };

  return (
    <View style={styles.outer}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {equippedBadge ? equippedBadge.badge.icon : "👤"}
              </Text>
            </View>
            {equippedBadge && (
              <Text style={[styles.equippedBadgeLabel, { color: getRarityColor(equippedBadge.badge.rarity) }]}>
                {equippedBadge.badge.name}
              </Text>
            )}
          </View>
          <Text style={styles.profileName}>
            {profile?.display_name || profile?.username || "Runner"}
          </Text>
          <Text style={styles.profileUsername}>@{profile?.username}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSquads}</Text>
            <Text style={styles.statLabel}>Squads</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRuns}</Text>
            <Text style={styles.statLabel}>Runs This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>km This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalStreaks}</Text>
            <Text style={styles.statLabel}>Active Streaks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myBadges?.length || 0}</Text>
            <Text style={styles.statLabel}>Badges Owned</Text>
          </View>
        </View>

        {/* My Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Badges</Text>
          {myBadges && myBadges.length > 0 ? (
            <View style={styles.badgesGrid}>
              {myBadges.map((userBadge: any) => (
                <TouchableOpacity
                  key={userBadge.id}
                  style={[
                    styles.badgeItem,
                    userBadge.is_equipped && styles.badgeItemEquipped,
                    { borderColor: getRarityColor(userBadge.badge.rarity) }
                  ]}
                  onPress={() => !userBadge.is_equipped && equipMutation.mutate(userBadge.badge.id)}
                >
                  <Text style={styles.badgeItemIcon}>{userBadge.badge.icon}</Text>
                  <Text style={styles.badgeItemName}>{userBadge.badge.name}</Text>
                  {userBadge.is_equipped && (
                    <Text style={styles.equippedLabel}>✓ Equipped</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No badges yet. Visit the shop to purchase badges!
            </Text>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
          <Text style={styles.logoutTxt}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#0f172a" },
  inner: { padding: 16, paddingBottom: 40, gap: 20 },

  profileHeader: {
    backgroundColor: "#1e1b4b",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4c1d95",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#312e81",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#6366f1",
  },
  avatarText: {
    fontSize: 48,
  },
  equippedBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  profileName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  profileUsername: {
    color: "#a78bfa",
    fontSize: 16,
    fontWeight: "600",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#374151",
  },
  statValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  section: {
    backgroundColor: "#1f2937",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: "#374151",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeItem: {
    width: "30%",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  badgeItemEquipped: {
    backgroundColor: "#1e3a8a",
  },
  badgeItemIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  badgeItemName: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  equippedLabel: {
    color: "#4ade80",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },

  logoutBtn: {
    alignSelf: "center",
    marginTop: 16,
  },
  logoutTxt: {
    color: "#f87171",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
