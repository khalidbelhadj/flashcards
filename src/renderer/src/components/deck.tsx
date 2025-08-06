import Cards from "@/components/cards";
import DeckHeader from "@/components/deck-header";
import DeckInfo from "@/components/deck-info";
import { useParams } from "react-router";

export default function Deck() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("Deck ID is required");

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <DeckHeader id={id} />
      <DeckInfo id={id} />
      <div className="grow min-h-0">
        <Cards id={id} />
      </div>
    </div>
  );
}
