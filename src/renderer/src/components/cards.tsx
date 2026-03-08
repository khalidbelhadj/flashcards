import { Card } from "@/components/card";
import NonIdealState from "@/components/non-ideal-state";
import NewCardDialog from "@/components/new-card-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import {
  useCards,
} from "@/queries/card-queries";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

export default function Cards({ id }: { id: string }) {
  const [filter, setFilter] = useState("");
  const [newCardOpen, setNewCardOpen] = useState(false);

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
              onClick={async () => {
                const visible = await window.electron.ipcRenderer.invoke("is-new-card-window-visible");
                if (visible) {
                  window.electron.ipcRenderer.invoke("open-new-card-window", id);
                } else {
                  setNewCardOpen(true);
                }
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
                  onSelect={() => {}}
                />
              ))}

            {isPending &&
              Array.from({ length: 5 }).map(() => (
                <Skeleton className="w-lg h-36" />
              ))}
          </div>
        </div>
      </div>

      <NewCardDialog open={newCardOpen} onClose={() => setNewCardOpen(false)} deckId={id} />
    </main>
  );
}
