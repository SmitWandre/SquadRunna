import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import SquadScreen from "../screens/SquadScreen";
import SquadBrowseScreen from "../screens/SquadBrowseScreen";
import ShopScreen from "../screens/ShopScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1f2937" },
        headerTintColor: "#fff",
        contentStyle: { backgroundColor: "#0f172a" },
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="Squad"
        component={SquadScreen}
        options={({ route }: any) => ({
          title: route.params?.squadName || "Squad",
        })}
      />
    </Stack.Navigator>
  );
}

function SquadsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1f2937" },
        headerTintColor: "#fff",
        contentStyle: { backgroundColor: "#0f172a" },
      }}
    >
      <Stack.Screen
        name="SquadBrowse"
        component={SquadBrowseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SquadDetail"
        component={SquadScreen}
        options={({ route }: any) => ({
          title: route.params?.squadName || "Squad",
        })}
      />
    </Stack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1f2937" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#1f2937", borderTopColor: "#374151" },
        tabBarActiveTintColor: "#818cf8",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIconStyle: { display: "none" },
        headerTitleStyle: { color: "#fff" },
        headerTitleAlign: "center",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          title: "Home",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Home</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Squads"
        component={SquadsStack}
        options={{
          title: "Squads",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Squads</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          title: "Shop",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Shop</Text>
          ),
        }}
      />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardScreen}
        options={{
          title: "Leaderboard",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Leaders</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Profile</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
