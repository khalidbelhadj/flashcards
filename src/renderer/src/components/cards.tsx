import { Card } from "@/components/card";
import MoveCardDialog from "@/components/move-card-dialog";
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
import { cn, formatNumber } from "@/lib/utils";
import { useCards, useCreateCard } from "@/queries/card-queries";
import {
  IconAlignLeft,
  IconCube,
  IconLayoutGrid,
  IconLayoutRows,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CardsRow } from "src/lib/schema";

type View = "list" | "grid";

export default function Cards({ id }: { id: string }) {
  const [view, setView] = useState<View>("list");
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [moveCard, setMoveCard] = useState<CardsRow | null>(null);
  const [filter, setFilter] = useState("");

  const { data: cards, isPending, isError } = useCards(id, filter);

  // Hide the create card form when the deck changes
  useEffect(() => setShowCreateCard(false), [id]);

  return (
    <main className="w-full bg-background-dark border-t h-full relative">
      <MoveCardDialog onClose={() => setMoveCard(null)} card={moveCard} />
      <div className="absolute p-3 w-full z-10">
        {/* Cards header */}
        <div className="flex items-center gap-2">
          <Input
            icon={<IconSearch className="size-4" />}
            className="bg-background !h-7 w-52 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.1)]"
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

          {/* <div className="flex items-center bg-background border rounded-md text-muted-foreground overflow-clip">
            <Button
              size="icon"
              variant="ghost"
              icon={<IconLayoutGrid />}
              onClick={() => setView("grid")}
              className={cn(
                "hover:text-muted-foreground rounded-none",
                view === "grid" && "bg-muted hover:bg-muted",
              )}
            />
            <Button
              size="icon"
              variant="ghost"
              icon={<IconLayoutRows />}
              onClick={() => setView("list")}
              className={cn(
                "hover:text-muted-foreground rounded-none",
                view === "list" && "bg-muted hover:bg-muted",
              )}
            />
          </div> */}

          <div className="flex items-center bg-background border rounded-lg text-muted-foreground p-0.5 gap-0.5">
            <Button
              size="icon-sm"
              variant="ghost"
              icon={<IconLayoutGrid />}
              onClick={() => setView("grid")}
              className={cn(
                "hover:text-muted-foreground",
                view === "grid" && "bg-muted hover:bg-muted",
              )}
            />
            <Button
              size="icon-sm"
              variant="ghost"
              icon={<IconLayoutRows />}
              onClick={() => setView("list")}
              className={cn(
                "hover:text-muted-foreground",
                view === "list" && "bg-muted hover:bg-muted",
              )}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setEditingCardId(null);
              setShowCreateCard(true);
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
        {!showCreateCard && cards?.length === 0 && (
          <NonIdealState
            title="No cards"
            description={
              filter !== ""
                ? "No cards match your search"
                : "Create a new card to get started"
            }
          />
        )}
        {view === "grid" && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-3 w-full mx-auto justify-center items-center">
            {!isPending &&
              !isError &&
              cards.map((card) => (
                <div className="h-52">
                  <Card
                    key={card.id}
                    card={card}
                    setShowMove={setMoveCard}
                    isEditing={editingCardId === card.id}
                    onBeginEdit={(cid) => {
                      setShowCreateCard(false);
                      setEditingCardId(cid);
                    }}
                    onEndEdit={() => setEditingCardId(null)}
                  />
                </div>
              ))}
          </div>
        )}
        {view === "list" && (
          <div className="flex flex-col gap-3 mx-auto max-w-lg">
            {/* Create card */}
            <AnimatePresence>
              {showCreateCard && (
                <CreateCard id={id} setShowCreateCard={setShowCreateCard} />
              )}
            </AnimatePresence>

            {/* Cards List */}
            {!isPending &&
              !isError &&
              cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  setShowMove={setMoveCard}
                  isEditing={editingCardId === card.id}
                  onBeginEdit={(cid) => {
                    setShowCreateCard(false);
                    setEditingCardId(cid);
                  }}
                  onEndEdit={() => setEditingCardId(null)}
                />
              ))}

            {isPending &&
              Array.from({ length: 5 }).map(() => (
                <Skeleton className="w-lg h-36" />
              ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CreateCard({
  id,
  setShowCreateCard,
}: {
  id: string;
  setShowCreateCard: (show: boolean) => void;
}) {
  const { mutateAsync: createCard } = useCreateCard();

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (frontRef.current === null || backRef.current === null) return;

    const front = frontRef.current.value;
    const back = backRef.current.value;

    createCard({ deckId: id, front, back });
    frontRef.current.value = "";
    backRef.current.value = "";
    frontRef.current.focus();
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowCreateCard(false);
  };
  return (
    <motion.form
      onKeyDown={(e) => {
        if (e.metaKey && e.key === "Enter") {
          handleSave(e);
        }
        if (e.key === "Escape") {
          handleCancel(e as unknown as React.MouseEvent<HTMLButtonElement>);
        }
      }}
      className="border rounded-md max-w-lg bg-background"
      onSubmit={handleSave}
    >
      <div className="p-2 border-b border-dashed flex flex-col gap-1">
        <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
          <IconAlignLeft className="size-3" />
          Front
        </div>
        <Textarea
          className="!ring-0 border-none p-0"
          ref={frontRef}
          name="front"
          placeholder="Type here..."
          autoFocus
        />
      </div>
      <div className="p-2 flex flex-col gap-1">
        <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
          <IconAlignLeft className="size-3" />
          Back
        </div>
        <Textarea
          className="!ring-0 border-none p-0"
          ref={backRef}
          name="back"
          placeholder="Type here..."
        />
      </div>

      <div className="bg-background-dark border-t p-1 flex items-center gap-1">
        <Button
          type="button"
          className="hover:bg-muted gap-1 text-muted-foreground"
          size="sm"
          variant="ghost"
          icon={<IconCube className="size-3.5" />}
        >
          Basic
        </Button>

        <Button
          className="ml-auto"
          type="button"
          variant="outline"
          onClick={handleCancel}
          size="sm"
        >
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Save
        </Button>
      </div>
    </motion.form>
  );
}
