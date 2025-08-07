import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "src/lib/api-proxy";

export function useCards(deckId: string, filter?: string) {
  return useQuery({
    queryKey: ["cards", deckId, filter],
    queryFn: async () => {
      console.log("refetching cards");
      const cards = await api.cards.getCards(deckId, filter);
      return cards;
    },
    placeholderData: keepPreviousData,
    refetchInterval: 1 * 1000 * 60, // 1 minute
    structuralSharing: false,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createCard"],
    mutationFn: async ({
      deckId,
      front,
      back,
    }: {
      deckId: string;
      front: string;
      back: string;
    }) => {
      return await api.cards.createCard(deckId, front, back);
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["cards", data] });
      }
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteCard"],
    mutationFn: async (cardId: string) => {
      return await api.cards.deleteCard(cardId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["moveCard"],
    mutationFn: async ({
      cardId,
      deckId,
    }: {
      cardId: string;
      deckId: string;
    }) => {
      return await api.cards.moveCard(cardId, deckId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useResetCardHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["resetCardHistory"],
    mutationFn: async (cardId: string) => {
      return await api.cards.resetCardHistory(cardId);
    },
    onSettled: (_, __, cardId) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useDuplicateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["duplicateCard"],
    mutationFn: async (cardId: string) => {
      return await api.cards.duplicateCard(cardId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}
