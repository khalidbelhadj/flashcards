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
      const cards = await api.cards.getCards(deckId, filter);
      return cards;
    },
    placeholderData: keepPreviousData,
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
