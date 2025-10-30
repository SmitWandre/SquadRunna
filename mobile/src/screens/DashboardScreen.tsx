import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuthStore } from "../state/authStore";
import LogRunModal from "../components/LogRunModal";
import SetGoalModal from "../components/SetGoalModal";

export default function DashboardScreen({ navigation }: any) {
  const { profile, logout } = useAuthStore();
  const [logOpen, setLogOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<any>(null);

  const { data: summaryData } = useQuery({
    queryKey: ["weeklySummary"],
    queryFn: async () => {
      const res = await api.get("/squads/me/weekly-summary/");
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

  const { data: runsData } = useQuery({
    queryKey: ["weeklyRuns"],
    queryFn: async () => {
      const res = await api.get("/runs/weekly/");
      return res.data;
    },
  });

  const squads = summaryData?.summary || [];

  // Merge squad points data with summary data
  const squadsWithPoints = squads.map((s: any) => {
    const squadDetail = squadsData?.find((sd: any) => sd.id === s.squad_id);
    return { ...s, total_points: squadDetail?.total_points || 0 };
  });

  const handleSetGoal = (squad: any) => {
    setSelectedSquad(squad);
    setGoalModalOpen(true);
  };

  const getProgressPercentage = (progress: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((progress / goal) * 100, 100);
  };

  const getProgressColor = (progress: number, goal: number) => {
    const percentage = getProgressPercentage(progress, goal);
    if (percentage >= 100) return "#4ade80";
    if (percentage >= 70) return "#fbbf24";
    if (goal === 0) return "#ef4444";
    return "#fb923c";
  };

  return (
    <View style={styles.outer}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Header / profile */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.username}>
              {profile?.display_name || profile?.username || "Runner"}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Total Squads</Text>
              <Text style={styles.statValue}>{squads.length}</Text>
            </View>
          </View>
        </View>

        {/* Squads cards */}
        <View style={styles.section}>
          {squadsWithPoints.map((s: any, idx: number) => {
            const progressPercentage = getProgressPercentage(
              s.progress_cur,
              s.goal_cur
            );
            const progressColor = getProgressColor(s.progress_cur, s.goal_cur);
            const hasGoal = s.goal_cur > 0;

            return (
              <View key={idx} style={styles.card}>
                {/* Squad Points Badge */}
                <View style={styles.squadPointsBadge}>
                  <Text style={styles.squadPointsLabel}>Squad Points</Text>
                  <Text style={styles.squadPointsValue}>⭐ {s.total_points}</Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Squad", {
                      squadId: s.squad_id,
                      squadName: s.squad_name,
                    })
                  }
                >
                  <View style={styles.rowSpace}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {s.squad_name}{" "}
                        <Text style={styles.streak}>
                          🔥 {s.current_streak_weeks}w
                        </Text>
                      </Text>
                      <Text style={styles.smallMuted}>
                        Longest {s.longest_streak_weeks}w
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.smallMuted}>Last change</Text>
                      <Text
                        style={[
                          styles.pointsChange,
                          s.points_change_last_closeout >= 0
                            ? styles.positive
                            : styles.negative,
                        ]}
                      >
                        {s.points_change_last_closeout >= 0 ? "+" : ""}
                        {s.points_change_last_closeout}
                      </Text>
                    </View>
                  </View>

                  {!hasGoal && (
                    <View style={styles.noGoalWarning}>
                      <Text style={styles.noGoalText}>
                        ⚠️ No goal set - points will be deducted!
                      </Text>
                    </View>
                  )}

                  {hasGoal && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>
                          {s.progress_cur.toFixed(2)} km / {s.goal_cur.toFixed(2)} km
                        </Text>
                        <Text style={[styles.progressPercentage, { color: progressColor }]}>
                          {progressPercentage.toFixed(0)}%
                        </Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progressPercentage}%`,
                              backgroundColor: progressColor,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.progressStatus,
                          { color: s.achieved ? "#4ade80" : "#9ca3af" },
                        ]}
                      >
                        {s.achieved ? "✅ Goal Achieved!" : "⏳ Keep going!"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.setGoalBtn}
                  onPress={() => handleSetGoal(s)}
                >
                  <Text style={styles.setGoalBtnTxt}>
                    {hasGoal ? "Update Goal" : "Set Goal"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* My Week */}
        <View style={styles.card}>
          <View style={styles.rowSpace}>
            <View>
              <Text style={styles.cardTitle}>My Week</Text>
              <Text style={styles.smallMuted}>
                {runsData?.total_distance_km?.toFixed(2)} km logged
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logBtn}
              onPress={() => setLogOpen(true)}
            >
              <Text style={styles.logBtnTxt}>Log Run</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.runsList}>
            {(runsData?.runs || []).map((r: any) => (
              <View key={r.id} style={styles.runRow}>
                <View>
                  <Text style={styles.runKm}>
                    {r.distance_km.toFixed(2)} km
                  </Text>
                  <Text style={styles.runSub}>{r.duration_minutes} min</Text>
                </View>
                <Text style={styles.runTs}>
                  {new Date(r.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => logout()}
        >
          <Text style={styles.logoutTxt}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <LogRunModal visible={logOpen} onClose={() => setLogOpen(false)} />
      {selectedSquad && (
        <SetGoalModal
          visible={goalModalOpen}
          onClose={() => {
            setGoalModalOpen(false);
            setSelectedSquad(null);
          }}
          squadId={selectedSquad.squad_id}
          squadName={selectedSquad.squad_name}
          currentGoal={selectedSquad.goal_cur}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#0f172a" },
  inner: { padding: 16, paddingBottom: 40, gap: 16 },

  header: {
    backgroundColor: "#1e1b4b",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#4c1d95",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeSection: {
    marginBottom: 12,
  },
  welcomeText: {
    color: "#a78bfa",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  username: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    backgroundColor: "#312e81",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#6366f1",
    minWidth: 100,
    alignItems: "center",
  },
  statLabel: {
    color: "#c4b5fd",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },

  rowSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  muted: { color: "#9ca3af", fontSize: 12 },
  points: { color: "#818cf8", fontSize: 24, fontWeight: "700" },

  section: { gap: 16 },

  card: {
    backgroundColor: "#1f2937",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: "#374151",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    position: "relative",
  },
  squadPointsBadge: {
    position: "absolute",
    top: -12,
    right: 16,
    backgroundColor: "#facc15",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: "#854d0e",
    shadowColor: "#facc15",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  squadPointsLabel: {
    color: "#713f12",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  squadPointsValue: {
    color: "#713f12",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  streak: { color: "#fb923c", fontSize: 14, fontWeight: "600" },
  smallMuted: { color: "#9ca3af", fontSize: 12 },
  pointsChange: { fontSize: 16, fontWeight: "700" },
  positive: { color: "#4ade80" },
  negative: { color: "#f87171" },

  smallText: { color: "#d1d5db", fontSize: 13 },

  noGoalWarning: {
    backgroundColor: "#451a03",
    borderWidth: 1,
    borderColor: "#ea580c",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  noGoalText: {
    color: "#fdba74",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#374151",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressStatus: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },

  setGoalBtn: {
    backgroundColor: "#fc5200",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
  },
  setGoalBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  logBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logBtnTxt: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  runsList: {
    marginTop: 12,
    maxHeight: 200,
  },
  runRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  runKm: { color: "#fff", fontWeight: "600" },
  runSub: { color: "#9ca3af", fontSize: 12 },
  runTs: { color: "#6b7280", fontSize: 11, marginLeft: 8, textAlign: "right", flex: 1 },

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
