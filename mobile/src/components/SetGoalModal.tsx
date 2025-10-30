import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export default function SetGoalModal({
  visible,
  onClose,
  squadId,
  squadName,
  currentGoal,
}: {
  visible: boolean;
  onClose: () => void;
  squadId: number;
  squadName: string;
  currentGoal?: number;
}) {
  const [distance, setDistance] = useState(currentGoal?.toString() || "");
  const [unit, setUnit] = useState<"km" | "mi">("km");

  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post(`/squads/${squadId}/goal/`, {
        target_distance: parseFloat(distance),
        unit,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["squads"] });
      qc.invalidateQueries({ queryKey: ["squadGoal", squadId] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Failed to set goal:", error);
    },
  });

  const handleSetGoal = () => {
    if (!distance || parseFloat(distance) <= 0) return;
    mutation.mutate();
  };

  // Suggested goals based on unit
  const suggestions = unit === "km" ? [10, 25, 50, 100] : [5, 15, 30, 60];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎯</Text>
            </View>

            <Text style={styles.title}>Set Weekly Goal</Text>
            <Text style={styles.subtitle}>
              Set a distance goal for {squadName} this week
            </Text>

            <Text style={styles.warning}>
              ⚠️ No goal = points deducted at week end!
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Target Distance</Text>
              <View style={styles.distanceRow}>
                <TextInput
                  style={styles.distanceInput}
                  value={distance}
                  onChangeText={setDistance}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  keyboardType="decimal-pad"
                />
                <View style={styles.unitSelector}>
                  <TouchableOpacity
                    style={[styles.unitButton, unit === "km" && styles.unitButtonActive]}
                    onPress={() => setUnit("km")}
                  >
                    <Text
                      style={[styles.unitText, unit === "km" && styles.unitTextActive]}
                    >
                      km
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.unitButton, unit === "mi" && styles.unitButtonActive]}
                    onPress={() => setUnit("mi")}
                  >
                    <Text
                      style={[styles.unitText, unit === "mi" && styles.unitTextActive]}
                    >
                      mi
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>Quick Select:</Text>
              <View style={styles.suggestionsRow}>
                {suggestions.map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={styles.suggestionChip}
                    onPress={() => setDistance(val.toString())}
                  >
                    <Text style={styles.suggestionText}>
                      {val} {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {mutation.isError && (
              <Text style={styles.errorText}>
                Failed to set goal. Please try again.
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.setButton,
                (!distance || parseFloat(distance) <= 0) && styles.setButtonDisabled,
              ]}
              onPress={handleSetGoal}
              disabled={!distance || parseFloat(distance) <= 0 || mutation.isPending}
            >
              <Text style={styles.setButtonText}>
                {mutation.isPending ? "Setting..." : "Set Goal"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#1f2937",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  warning: {
    backgroundColor: "#451a03",
    borderWidth: 1,
    borderColor: "#ea580c",
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    fontSize: 13,
    color: "#fdba74",
    textAlign: "center",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#d1d5db",
    marginBottom: 12,
  },
  distanceRow: {
    flexDirection: "row",
    gap: 12,
  },
  distanceInput: {
    flex: 1,
    backgroundColor: "#374151",
    borderWidth: 2,
    borderColor: "#4b5563",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  unitSelector: {
    gap: 8,
  },
  unitButton: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#4b5563",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: "center",
  },
  unitButtonActive: {
    backgroundColor: "#fc5200",
    borderColor: "#fc5200",
  },
  unitText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "700",
  },
  unitTextActive: {
    color: "#fff",
  },
  suggestions: {
    marginBottom: 24,
  },
  suggestionsLabel: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 8,
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#4b5563",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionText: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "600",
  },
  setButton: {
    backgroundColor: "#fc5200",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  setButtonDisabled: {
    backgroundColor: "#4b5563",
  },
  setButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#9ca3af",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
});
