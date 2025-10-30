import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useNavigation } from "@react-navigation/native";

interface SquadGoalTabProps {
  squadId: number;
  squadOwnerId?: number;
  currentUserId?: number;
}

export default function SquadGoalTab({ squadId, squadOwnerId, currentUserId }: SquadGoalTabProps) {
  const qc = useQueryClient();
  const navigation = useNavigation();
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState<"km" | "mi">("km");

  const isOwner = squadOwnerId && currentUserId && squadOwnerId === currentUserId;

  // Debug: Log squadId to ensure it's available
  console.log('[SquadGoalTab] squadId:', squadId);
  console.log('[SquadGoalTab] squadOwnerId:', squadOwnerId);
  console.log('[SquadGoalTab] currentUserId:', currentUserId);
  console.log('[SquadGoalTab] isOwner:', isOwner);

  const { data, isLoading } = useQuery({
    queryKey: ["squadGoal", squadId],
    queryFn: async () => {
      const res = await api.get(`/squads/${squadId}/goal/`);
      return res.data;
    },
  });

  // Fetch previous week's goal to calculate potential points
  const { data: prevGoalData } = useQuery({
    queryKey: ["squadGoalPrev", squadId],
    queryFn: async () => {
      try {
        const res = await api.get(`/squads/${squadId}/goal/previous/`);
        return res.data;
      } catch (err) {
        // Previous goal might not exist, return null
        return null;
      }
    },
  });

  // Calculate potential points based on the target input
  const potentialPoints = useMemo(() => {
    if (!target || parseFloat(target) <= 0) return null;

    const currentTarget = parseFloat(target);
    const currentTargetKm = unit === "km" ? currentTarget : currentTarget * 1.60934;
    const previousTargetKm = prevGoalData?.target_distance_km || 0;

    // Points calculation logic from backend
    const basePoints = 50;
    const bonusPoints = currentTargetKm > previousTargetKm ? 20 : 5;
    const achievedPoints = basePoints + bonusPoints;
    const failedPoints = -20;

    return {
      achieved: achievedPoints,
      failed: failedPoints,
      isIncreased: currentTargetKm > previousTargetKm,
    };
  }, [target, unit, prevGoalData]);

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post(`/squads/${squadId}/goal/`, {
        target_distance: parseFloat(target),
        unit,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["squadGoal", squadId] });
      setTarget("");
      setUnit("km");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      console.log(`[LeaveSquad] Attempting to leave squad ${squadId}`);
      try {
        const response = await api.post(`/squads/${squadId}/leave/`);
        console.log('[LeaveSquad] Success:', response.data);
        return response;
      } catch (error: any) {
        console.error('[LeaveSquad] Error:', error);
        console.error('[LeaveSquad] Error response:', error?.response);
        console.error('[LeaveSquad] Error data:', error?.response?.data);
        throw error;
      }
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["mySquads"] });
      qc.invalidateQueries({ queryKey: ["weeklySummary"] });
      const message = res?.data?.message || "Successfully left squad";
      Alert.alert("Success", message, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to leave squad";
      console.error('[LeaveSquad] Final error:', errorMsg);
      Alert.alert("Error", errorMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      console.log(`[DeleteSquad] Attempting to delete squad ${squadId}`);
      try {
        const response = await api.delete(`/squads/${squadId}/delete/`);
        console.log('[DeleteSquad] Success:', response.data);
        return response;
      } catch (error: any) {
        console.error('[DeleteSquad] Error:', error);
        console.error('[DeleteSquad] Error response:', error?.response);
        console.error('[DeleteSquad] Error data:', error?.response?.data);
        throw error;
      }
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["mySquads"] });
      qc.invalidateQueries({ queryKey: ["weeklySummary"] });
      const message = res?.data?.message || "Squad deleted successfully";
      Alert.alert("Success", message, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to delete squad";
      console.error('[DeleteSquad] Final error:', errorMsg);
      Alert.alert("Error", errorMsg);
    },
  });

  if (isLoading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  const goal = data;
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.header}>This Week’s Goal</Text>
        <Text style={styles.big}>
          {goal.target_distance_km?.toFixed(2)} km target
        </Text>
        <Text style={styles.body}>
          Progress: {goal.total_distance_km?.toFixed(2)} km ({goal.percent_complete}%)
        </Text>
        <Text style={styles.body}>
          Achieved: {goal.achieved ? "✅ Yes" : "❌ Not yet"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.header}>Update Goal</Text>
        <Text style={styles.label}>Target distance</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30"
          placeholderTextColor="#6b7280"
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Unit</Text>
        <View style={styles.row}>
          {["km","mi"].map((u)=>(
            <TouchableOpacity
              key={u}
              onPress={()=>setUnit(u as "km"|"mi")}
              style={[styles.unitBtn, unit===u && styles.unitActive]}
            >
              <Text style={[styles.unitTxt, unit===u && styles.unitTxtActive]}>
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {potentialPoints && (
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsHeader}>Potential Points (per member)</Text>
            <Text style={styles.pointsSuccess}>
              ✅ If achieved: +{potentialPoints.achieved} points
              {potentialPoints.isIncreased && " (increased goal bonus!)"}
            </Text>
            <Text style={styles.pointsFail}>
              ❌ If not achieved: {potentialPoints.failed} points
            </Text>
            <Text style={styles.pointsNote}>
              Points are awarded at the end of the week
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => mutation.mutate()}
        >
          <Text style={styles.saveTxt}>Save Goal</Text>
        </TouchableOpacity>

        {mutation.isError && (
          <Text style={styles.err}>Error saving goal</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.header}>Squad Actions</Text>

        {isOwner && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              console.log('[DELETE] Calling mutation directly');
              deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            <Text style={styles.deleteTxt}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Squad"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={() => {
            console.log('[LEAVE] Calling mutation directly');
            leaveMutation.mutate();
          }}
          disabled={leaveMutation.isPending}
        >
          <Text style={styles.leaveTxt}>
            {leaveMutation.isPending ? "Leaving..." : isOwner ? "Leave & Delete Squad" : "Leave Squad"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  header: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  big: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  body: { color: "#d1d5db", fontSize: 14, marginBottom: 2 },
  label: {
    color: "#d1d5db",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#374151",
    color: "#fff",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: { flexDirection: "row", marginTop: 8 },
  unitBtn: {
    backgroundColor: "#374151",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  unitActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  unitTxt: { color: "#9ca3af", fontWeight: "600" },
  unitTxtActive: { color: "#fff" },
  saveBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },
  err: { color: "#f87171", fontSize: 14, marginTop: 8 },
  loading: { color: "#fff", padding: 16 },
  leaveBtn: {
    backgroundColor: "#991b1b",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  leaveTxt: { color: "#fff", fontWeight: "600", fontSize: 16 },
  deleteBtn: {
    backgroundColor: "#7f1d1d",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#dc2626",
  },
  deleteTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  pointsInfo: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  pointsHeader: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  pointsSuccess: {
    color: "#4ade80",
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  pointsFail: {
    color: "#f87171",
    fontSize: 13,
    marginBottom: 8,
  },
  pointsNote: {
    color: "#94a3b8",
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 4,
  },
});
