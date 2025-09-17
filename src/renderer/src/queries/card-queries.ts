import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "src/lib/api-proxy";
import type { CardsRow } from "src/lib/schema";

export function useCards(deckId: string, filter?: string) {
  return useQuery({
    queryKey: ["cards", deckId, filter],
    queryFn: async () => {
      return await api.cards.getCards(deckId, filter);
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
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

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    unknown,
    { cardId: string; front: string; back: string },
    { previousCardsData: Array<[readonly unknown[], CardsRow[] | undefined]> }
  >({
    mutationKey: ["updateCard"],
    mutationFn: async ({
      cardId,
      front,
      back,
    }: {
      cardId: string;
      front: string;
      back: string;
    }) => {
      return await api.cards.updateCard(cardId, front, back);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["cards"] });

      const previousCardsData = queryClient.getQueriesData<CardsRow[]>({
        queryKey: ["cards"],
      });

      previousCardsData.forEach(([key, oldCards]) => {
        if (!oldCards) return;
        queryClient.setQueryData<CardsRow[]>(
          key,
          oldCards.map((card) =>
            card.id === variables.cardId
              ? {
                  ...card,
                  front: variables.front,
                  back: variables.back,
                  updatedAt: new Date().toISOString(),
                }
              : card,
          ),
        );
      });

      return { previousCardsData };
    },
    onError: (_err, _variables, context) => {
      if (!context) return;
      context.previousCardsData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
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

export function useResetDeckHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["resetDeckHistory"],
    mutationFn: async (deckId: string) => {
      return await api.cards.resetDeckHistory(deckId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "card"] });
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

export function useDueCards(deckId: string | null) {
  return useQuery({
    queryKey: ["cards", deckId, "due"],
    queryFn: async () => {
      return await api.cards.getDueCards(deckId);
    },
    refetchInterval: 1 * 1000 * 60, // 1 minute
    structuralSharing: false,
  });
}
