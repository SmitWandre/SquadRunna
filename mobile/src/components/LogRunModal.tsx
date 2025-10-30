import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export default function LogRunModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [distance, setDistance] = useState("");
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [duration, setDuration] = useState("");

  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/runs/", {
        distance: parseFloat(distance),
        unit,
        duration_minutes: parseFloat(duration),
      });
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weeklyRuns"] });
      onClose();
      setDistance("");
      setDuration("");
      setUnit("km");
    },
    onError: (error: any) => {
      console.error("Failed to save run:", error);
      console.error("Error response:", error.response?.data);
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Log a Run</Text>

          <Text style={styles.label}>Distance</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={distance}
            onChangeText={setDistance}
            placeholder="e.g. 5"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Unit (km or mi)</Text>
          <View style={styles.row}>
            {["km", "mi"].map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u as "km" | "mi")}
                style={[
                  styles.unitBtn,
                  unit === u && styles.unitBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.unitTxt,
                    unit === u && styles.unitTxtActive,
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 28.5"
            placeholderTextColor="#6b7280"
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => mutation.mutate()}
          >
            <Text style={styles.saveTxt}>Save Run</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelTxt}>Cancel</Text>
          </TouchableOpacity>

          {mutation.isError && (
            <Text style={styles.errTxt}>Failed to save run</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    color: "#d1d5db",
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
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
  row: {
    flexDirection: "row",
    gap: 8,
  },
  unitBtn: {
    flexDirection: "row",
    backgroundColor: "#374151",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  unitBtnActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  unitTxt: {
    color: "#9ca3af",
    fontWeight: "600",
  },
  unitTxtActive: {
    color: "#fff",
  },
  saveBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveTxt: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  cancelTxt: {
    color: "#9ca3af",
    fontSize: 14,
  },
  errTxt: {
    color: "#f87171",
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});
