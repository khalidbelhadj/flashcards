import { Card } from "@/components/card";
import NonIdealState from "@/components/non-ideal-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import {
  useCard,
  useCards,
  useCreateCard,
  useUpdateCard,
} from "@/queries/card-queries";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function Cards({ id }: { id: string }) {
  const [filter, setFilter] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null | "new">(null);

  const { data: cards, isPending, isError } = useCards(id, filter);

  return (
    <main className="w-full bg-background-dark border-t h-full flex">
      {/* Cards section */}
      <div className="flex-1 relative">
        <div className="absolute p-3 w-full z-10">
          {/* Cards header */}
          <div className="flex items-center gap-2">
            <Input
              icon={<IconSearch className="size-4" />}
              className="bg-background w-52 rounded-full"
              placeholder="Search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />

            {!isPending && !isError && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-muted w-fit rounded-md text-sm text-muted-foreground h-7 flex items-center justify-center px-2 min-w-7 border border-muted">
                    {formatNumber(cards.length || 0)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {cards.length === 0
                    ? "No cards"
                    : cards.length === 1
                      ? "1 card"
                      : `${cards.length} cards`}
                </TooltipContent>
              </Tooltip>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setActiveCardId("new");
              }}
              className="ml-auto"
              icon={<IconPlus />}
            >
              New card
            </Button>
          </div>
        </div>

        <div className="w-full h-full overflow-auto pt-14 p-3 cards">
          {/* No cards message */}
          {cards?.length === 0 && (
            <NonIdealState
              title="No cards"
              description={
                filter !== ""
                  ? "No cards match your search"
                  : "Create a new card to get started"
              }
            />
          )}

          {/* Cards List */}
          <div className="flex flex-col gap-3 mx-auto max-w-lg">
            {!isPending &&
              !isError &&
              cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onSelect={(id) =>
                    setActiveCardId((oldId) => (oldId === id ? null : id))
                  }
                />
              ))}

            {isPending &&
              Array.from({ length: 5 }).map(() => (
                <Skeleton className="w-lg h-36" />
              ))}
          </div>
        </div>
      </div>

      {/* Edit card */}
      {activeCardId !== null && (
        <EditCard
          deckId={id}
          key={activeCardId}
          activeCardId={activeCardId}
          setActiveCardId={setActiveCardId}
        />
      )}
    </main>
  );
}

function EditCard({
  deckId,
  activeCardId,
  setActiveCardId,
}: {
  deckId: string;
  activeCardId: string | "new";
  setActiveCardId: (id: string | null) => void;
}) {
  const { data: card } = useCard(activeCardId === "new" ? null : activeCardId);
  const { mutateAsync: updateCard } = useUpdateCard();
  const { mutateAsync: createCard } = useCreateCard();

  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");

  const handleSave = async () => {
    if (activeCardId === "new") {
      const newCardId = await createCard({
        deckId,
        front,
        back,
      });
      setActiveCardId(newCardId);
      return;
    }
    await updateCard({
      cardId: activeCardId,
      front,
      back,
    });
  };

  useEffect(() => {
    setFront(card?.front || "");
    setBack(card?.back || "");
  }, [card]);

  return (
    <div className="bg-background border-l w-lg">
      <div className="p-3 flex items-center">
        <Button
          variant="secondary"
          className="font-mono text-xs px-1 size-fit rounded-sm"
          onClick={() => navigator.clipboard.writeText(card?.id ?? "")}
        >
          {activeCardId}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setActiveCardId(null);
          }}
          className="ml-auto"
          icon={<IconX />}
        >
          Close
        </Button>
      </div>
      <div className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="text-sm rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
            Front
          </div>
          <Textarea
            value={front}
            autoFocus
            onChange={(e) => setFront(e.target.value)}
            key={`back-${activeCardId}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
            Back
          </div>
          <Textarea
            key={`back-${activeCardId}`}
            value={back}
            onChange={(e) => setBack(e.target.value)}
          />
        </div>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
