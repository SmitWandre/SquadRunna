import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export default function CreateSquadModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post("/squads/", {
        name,
        description,
        is_private: isPrivate,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["squads"] });
      onClose();
      setName("");
      setDescription("");
      setIsPrivate(false);
    },
    onError: (error: any) => {
      console.error("Failed to create squad:", error);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) return;
    mutation.mutate();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Create a Squad</Text>
            <Text style={styles.subtitle}>
              Start your own running squad and invite others to join
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Squad Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Morning Runners"
                placeholderTextColor="#6b7280"
                maxLength={50}
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tell others about your squad..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Private Squad</Text>
                <Text style={styles.switchDesc}>
                  Only invited members can join
                </Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: "#374151", true: "#7c3aed" }}
                thumbColor={isPrivate ? "#c4b5fd" : "#9ca3af"}
              />
            </View>

            {mutation.isError && (
              <Text style={styles.errorText}>
                Failed to create squad. Please try again.
              </Text>
            )}

            <TouchableOpacity
              style={[styles.createButton, !name.trim() && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={!name.trim() || mutation.isPending}
            >
              <Text style={styles.createButtonText}>
                {mutation.isPending ? "Creating..." : "Create Squad"}
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
    lineHeight: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#d1d5db",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#4b5563",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchDesc: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  createButton: {
    backgroundColor: "#fc5200",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  createButtonDisabled: {
    backgroundColor: "#4b5563",
  },
  createButtonText: {
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
