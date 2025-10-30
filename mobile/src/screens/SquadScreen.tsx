import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuthStore } from "../state/authStore";
import SquadGoalTab from "../components/SquadGoalTab";
import SquadChatTab from "../components/SquadChatTab";
import SquadLeaderboardTab from "../components/SquadLeaderboardTab";

export default function SquadScreen({ route }: any) {
  const { profile } = useAuthStore();
  const { squadId: routeSquadId, squadName } = route.params || {};
  const [tab, setTab] = useState<"goal" | "chat" | "lb">("goal");

  const { data: squadsData } = useQuery({
    queryKey: ["mySquads"],
    queryFn: async () => {
      const res = await api.get("/squads/");
      return res.data;
    },
  });

  const squad = useMemo(() => {
    if (!squadsData) return null;
    if (routeSquadId) {
      const matchById = squadsData.find((s: any) => s.id === routeSquadId);
      if (matchById) {
        return matchById;
      }
    }
    if (squadName) {
      return squadsData.find((s: any) => s.name === squadName) || null;
    }
    return null;
  }, [squadsData, routeSquadId, squadName]);

  const squadId = routeSquadId ?? squad?.id ?? null;

  // optional: detailed data for header
  const { data: detailData } = useQuery({
    queryKey: ["squadDetail", squadId],
    enabled: !!squadId,
    queryFn: async () => {
      const res = await api.get(`/squads/${squadId}/`);
      return res.data;
    },
  });

  return (
    <ScrollView style={styles.outer} contentContainerStyle={styles.inner}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>
              {detailData?.squad?.name || squadName || "Squad"}
            </Text>
            <Text style={styles.sub}>
              Members: {detailData?.squad?.members?.length || 0}
            </Text>
          </View>
          <Text style={styles.owner}>
            Owner:{" "}
            {detailData?.squad?.owner?.display_name ||
              detailData?.squad?.owner?.username ||
              "?"}
          </Text>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setTab("goal")}
            style={[styles.tabBtn, tab === "goal" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabTxt,
                tab === "goal" && styles.tabTxtActive,
              ]}
            >
              Goal & Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("chat")}
            style={[styles.tabBtn, tab === "chat" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabTxt,
                tab === "chat" && styles.tabTxtActive,
              ]}
            >
              Chat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("lb")}
            style={[styles.tabBtn, tab === "lb" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabTxt,
                tab === "lb" && styles.tabTxtActive,
              ]}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {squadId ? (
        <>
          {tab === "goal" && (
            <SquadGoalTab
              squadId={squadId}
              squadOwnerId={detailData?.squad?.owner?.id}
              currentUserId={profile?.id}
            />
          )}
          {tab === "chat" && <SquadChatTab squadId={squadId} />}
          {tab === "lb" && <SquadLeaderboardTab squadId={squadId} />}
        </>
      ) : (
        <Text style={styles.err}>
          Could not match squad. (Production should navigate by numeric ID.)
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#0f172a" },
  inner: { padding: 16, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  sub: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  owner: { color: "#9ca3af", fontSize: 12, textAlign: "right", maxWidth: "45%" },
  tabsRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  tabBtn: {
    backgroundColor: "#374151",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  tabTxt: { color: "#e5e7eb", fontSize: 13, textAlign: "center" },
  tabTxtActive: { color: "#fff", fontWeight: "600" },
  err: { color: "#f87171", fontSize: 14 },
});
