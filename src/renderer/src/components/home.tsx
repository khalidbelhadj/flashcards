import { prefetchAllDecks } from "@/lib/utils";
import { useDueCards } from "@/queries/card-queries";
import { useQueryClient } from "@tanstack/react-query";
import Decks from "./decks";

export default function Home() {
  const { data: due } = useDueCards(null);
  const qc = useQueryClient();
  prefetchAllDecks(qc);

  return (
    <div className="w-full h-full flex flex-col items-center py-14 px-3 gap-10 overflow-clip max-h-screen min-h-0">
      <Decks />
    </div>
  );
}
