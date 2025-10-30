import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import { api } from "../api/client";
import { useAuthStore } from "../state/authStore";

export default function LoginScreen({ navigation }: any) {
  const { setTokens, setProfile, loadFromStorage } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  async function handleLogin() {
    try {
      setErr(null);
      const res = await api.post("/auth/login/", { username, password });
      setTokens(res.data.access, res.data.refresh);
      setProfile({
        id: res.data.user_id,
        username: res.data.username,
        display_name: res.data.display_name,
        total_points: res.data.total_points,
      });
      // Navigation will happen automatically via conditional rendering in App.tsx
    } catch (e: any) {
      setErr("Invalid username or password");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>SquadRun</Text>
        <Text style={styles.subtitle}>Log in</Text>

        <TextField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="runner123"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        {err && <Text style={styles.err}>{err}</Text>}

        <PrimaryButton title="Sign In" onPress={handleLogin} />

        <Text
          style={styles.link}
          onPress={() => navigation.navigate("Register")}
        >
          Need an account? Register →
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#0f172a",
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
    color: "#818cf8",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  err: {
    color: "#f87171",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  link: {
    color: "#818cf8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
  },
});
