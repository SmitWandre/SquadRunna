import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import CreateSquadModal from "../components/CreateSquadModal";

interface Squad {
  id: number;
  name: string;
  description: string;
  member_count: number;
  is_private: boolean;
  total_points: number;
  owner: {
    username: string;
    display_name: string;
  };
}

export default function SquadBrowseScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["squads", "browse", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await api.get(`/squads/browse/?${params.toString()}`);
      return res.data as Squad[];
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (squadId: number) => {
      return await api.post(`/squads/${squadId}/join/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      refetch();
    },
  });

  const renderSquadCard = ({ item }: { item: Squad }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (joinMutation.isPending) return;
        joinMutation.mutate(item.id);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.is_private && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>🔒 Private</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardOwner}>by {item.owner.display_name || item.owner.username}</Text>
      </View>

      {item.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.member_count}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.total_points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => joinMutation.mutate(item.id)}
          disabled={joinMutation.isPending || item.is_private}
        >
          <Text style={styles.joinButtonText}>
            {item.is_private ? "Request to Join" : "Join Squad"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Discover Squads</Text>
            <Text style={styles.subtitle}>Find and join running squads</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search squads..."
          placeholderTextColor="#6b7280"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={data || []}
        renderItem={renderSquadCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fc5200" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? "No squads found" : "No public squads available"}
            </Text>
            <Text style={styles.emptySubtext}>
              {search ? "Try a different search" : "Create one to get started!"}
            </Text>
          </View>
        }
      />

      <CreateSquadModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#1f2937",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  createButton: {
    backgroundColor: "#fc5200",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  privateBadge: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  privateBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardOwner: {
    fontSize: 13,
    color: "#9ca3af",
  },
  cardDescription: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 16,
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fc5200",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardFooter: {
    marginTop: 8,
  },
  joinButton: {
    backgroundColor: "#fc5200",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
});
