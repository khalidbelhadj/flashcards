import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "src/lib/api-proxy";

export function useDecks(parentId: string | null) {
  return useQuery({
    queryKey: ["decks", parentId],
    queryFn: async () => {
      return await api.decks.getDecks(parentId);
    },
  });
}

export function useDecksRecursive(parentId: string | null) {
  return useQuery({
    queryKey: ["decks-recursive", parentId],
    queryFn: async () => {
      return await api.decks.getDecksRecursive(parentId);
    },
  });
}

export function useDeck(id: string) {
  return useQuery({
    queryKey: ["deck", id],
    queryFn: async () => {
      return await api.decks.getById(id);
    },
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createDeck"],
    mutationFn: async ({
      name,
      parentId,
    }: {
      name: string;
      parentId: string | null;
    }) => {
      await api.decks.createDeck(name, parentId);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
      await queryClient.invalidateQueries({ queryKey: ["decks-recursive"] });
    },
  });
}

export function useDeckPath(id: string | null) {
  return useQuery({
    queryKey: ["path", id],
    queryFn: async () => {
      if (id === null) return [];
      return await api.decks.getPathTo(id);
    },
  });
}

export function useRenameDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["renameDeck"],
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await api.decks.renameDeck(id, name);
    },
    onSettled: async (id) => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
      await queryClient.invalidateQueries({ queryKey: ["decks-recursive"] });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: ["deck", id] });
        await queryClient.invalidateQueries({
          queryKey: ["decks-recursive", id],
        });
      }
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteDeck"],
    mutationFn: async (id: string) => {
      await api.decks.deleteDeck(id);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
      await queryClient.invalidateQueries({ queryKey: ["decks-recursive"] });
    },
  });
}

export function useSetLastReviewed(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["setLastReviewed", id],
    mutationFn: async (date: Date) => {
      await api.decks.setLastReviewed(id, date.toISOString());
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
      await queryClient.invalidateQueries({ queryKey: ["decks-recursive"] });
    },
  });
}

export function useAllDecks() {
  return useQuery({
    queryKey: ["decks", "all"],
    queryFn: async () => {
      return await api.decks.getDecksRecursive(null);
    },
  });
}

export function useMoveDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["moveDeck"],
    mutationFn: async ({
      id,
      parentId,
    }: {
      id: string;
      parentId: string | null;
    }) => {
      await api.decks.moveDeck(id, parentId);
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
      await queryClient.invalidateQueries({ queryKey: ["decks-recursive"] });
      await queryClient.invalidateQueries({ queryKey: ["path", id] });
    },
  });
}
