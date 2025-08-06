import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "src/lib/api-proxy";

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deckId,
      cardId,
      rating,
    }: {
      deckId: string;
      cardId: string;
      rating: "hard" | "good" | "easy";
    }) => {
      return await api.reviews.createReview(deckId, cardId, rating);
    },
    onSuccess: (_, { deckId, cardId }) => {
      // Invalidate card reviews query to refetch reviews
      queryClient.invalidateQueries({ queryKey: ["reviews", "card", cardId] });
      // Invalidate cards query to refetch updated lastReview timestamps
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
    },
  });
}

export function useGetReviews() {
  return useMutation({
    mutationFn: async ({
      deckId,
      cardId,
    }: {
      deckId?: string;
      cardId?: string;
    }) => {
      return await api.reviews.getReviews(deckId, cardId);
    },
  });
}

export function useCardReviews(cardId: string) {
  return useQuery({
    queryKey: ["reviews", "card", cardId],
    queryFn: async () => {
      return await api.reviews.getReviews(undefined, cardId);
    },
    enabled: !!cardId,
  });
}
