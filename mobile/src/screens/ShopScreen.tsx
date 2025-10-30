import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export default function ShopScreen() {
  const qc = useQueryClient();

  const { data: badges } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const res = await api.get("/shop/badges/");
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

  const totalPoints = squadsData?.reduce((sum: number, s: any) => sum + (s.total_points || 0), 0) || 0;

  const purchaseMutation = useMutation({
    mutationFn: async (badgeId: number) => {
      console.log(`[Shop] Purchasing badge ${badgeId}`);
      const response = await api.post(`/shop/badges/${badgeId}/purchase/`);
      console.log('[Shop] Purchase response:', response.data);
      return response;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["badges"] });
      qc.invalidateQueries({ queryKey: ["mySquads"] });
      qc.invalidateQueries({ queryKey: ["myBadges"] });
      Alert.alert("Success!", res?.data?.message || "Badge purchased!");
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to purchase badge";
      console.error('[Shop] Error:', errorMsg);
      Alert.alert("Error", errorMsg);
    },
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "#94a3b8";
      case "rare": return "#60a5fa";
      case "epic": return "#a78bfa";
      case "legendary": return "#fbbf24";
      default: return "#9ca3af";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common": return "#1e293b";
      case "rare": return "#1e3a8a";
      case "epic": return "#4c1d95";
      case "legendary": return "#78350f";
      default: return "#1f2937";
    }
  };

  return (
    <View style={styles.outer}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Badge Shop</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsLabel}>Your Points</Text>
            <Text style={styles.pointsValue}>⭐ {totalPoints}</Text>
          </View>
        </View>

        {/* Badge Grid */}
        <View style={styles.grid}>
          {badges?.map((badge: any) => (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                {
                  backgroundColor: getRarityBg(badge.rarity),
                  borderColor: getRarityColor(badge.rarity)
                }
              ]}
            >
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={[styles.badgeRarity, { color: getRarityColor(badge.rarity) }]}>
                {badge.rarity.toUpperCase()}
              </Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>

              <View style={styles.badgeFooter}>
                <Text style={styles.badgePrice}>⭐ {badge.price}</Text>
                {badge.is_owned ? (
                  <View style={styles.ownedBadge}>
                    <Text style={styles.ownedText}>✓ Owned</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      totalPoints < badge.price && styles.buyButtonDisabled
                    ]}
                    onPress={() => purchaseMutation.mutate(badge.id)}
                    disabled={purchaseMutation.isPending || totalPoints < badge.price}
                  >
                    <Text style={styles.buyButtonText}>
                      {purchaseMutation.isPending ? "..." : "Buy"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#0f172a" },
  inner: { padding: 16, paddingBottom: 40 },

  header: {
    backgroundColor: "#1e1b4b",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4c1d95",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 16,
  },
  pointsBadge: {
    backgroundColor: "#312e81",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  pointsLabel: {
    color: "#c4b5fd",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  pointsValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    alignItems: "center",
    minHeight: 200,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeRarity: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  badgeDescription: {
    color: "#d1d5db",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    flex: 1,
  },
  badgeFooter: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  badgePrice: {
    color: "#fbbf24",
    fontSize: 18,
    fontWeight: "800",
  },
  buyButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    width: "100%",
  },
  buyButtonDisabled: {
    backgroundColor: "#374151",
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  ownedBadge: {
    backgroundColor: "#065f46",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    width: "100%",
  },
  ownedText: {
    color: "#6ee7b7",
    fontWeight: "700",
    textAlign: "center",
  },
});
