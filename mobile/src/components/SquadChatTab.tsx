import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export default function SquadChatTab({ squadId }: { squadId: number }) {
  const [msg, setMsg] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["squadChat", squadId],
    queryFn: async () => {
      const res = await api.get(`/squads/${squadId}/messages/?page=1`);
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post(`/squads/${squadId}/messages/`, {
        text: msg,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["squadChat", squadId] });
      setMsg("");
    },
  });

  if (isLoading) return <Text style={styles.loading}>Loading chat…</Text>;

  const messages = data.results || data;

  return (
    <View style={styles.wrap}>
      <ScrollView style={styles.chatBox} contentContainerStyle={styles.chatInner}>
        {(messages || []).slice().reverse().map((m: any) => (
          <View key={m.id} style={styles.msgWrap}>
            <Text style={styles.msgHeader}>
              {m.sender?.display_name ?? m.sender?.username}{" "}
              <Text style={styles.msgTs}>
                {new Date(m.timestamp).toLocaleString()}
              </Text>
            </Text>
            <Text style={styles.msgBody}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Type a message…"
          placeholderTextColor="#6b7280"
          value={msg}
          onChangeText={setMsg}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => mutation.mutate()}>
          <Text style={styles.sendTxt}>Send</Text>
        </TouchableOpacity>
      </View>

      {mutation.isError && (
        <Text style={styles.err}>Failed to send</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 12 },
  chatBox: {
    flex: 1,
    backgroundColor: "#1f2937",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#374151",
    maxHeight: 300,
  },
  chatInner: {
    padding: 16,
  },
  msgWrap: {
    marginBottom: 12,
  },
  msgHeader: {
    color: "#818cf8",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  msgTs: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "400",
  },
  msgBody: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  row: { flexDirection: "row", alignItems: "center" },
  input: {
    backgroundColor: "#374151",
    color: "#fff",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendTxt: { color: "#fff", fontWeight: "600" },
  err: { color: "#f87171", fontSize: 14 },
  loading: { color: "#fff", padding: 16 },
});
