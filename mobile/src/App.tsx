import React, { useEffect } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainTabs from "./navigation/MainTabs";
import { useAuthStore } from "./state/authStore";
import { api } from "./api/client";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function RootNavigator() {
  const { accessToken, refreshToken, loadFromStorage, setProfile, setTokens } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    (async () => {
      await loadFromStorage();
      const currentRefresh = useAuthStore.getState().refreshToken;

      // if we have refresh token but no access token, get a new access token
      if (currentRefresh && !useAuthStore.getState().accessToken) {
        try {
          const res = await api.post("/auth/token/refresh/", {
            refresh: currentRefresh,
          });
          setTokens(res.data.access, currentRefresh);

          // Also fetch profile
          const meRes = await api.get("/auth/me/");
          setProfile({
            id: meRes.data.user_id,
            username: meRes.data.username,
            display_name: meRes.data.display_name,
            total_points: meRes.data.total_points,
          });
        } catch (err) {
          console.error("Failed to refresh token on startup:", err);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    console.log("Auth state changed:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
  }, [accessToken, refreshToken]);

  if (isLoading) {
    return null; // or a loading screen
  }

  const isAuthed = !!accessToken;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1f2937" },
        headerTintColor: "#fff",
        contentStyle: { backgroundColor: "#0f172a" },
        headerTitleStyle: { color: "#fff" },
        headerTitleAlign: "center",
      }}
    >
      {isAuthed ? (
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Register" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={DarkTheme}>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
