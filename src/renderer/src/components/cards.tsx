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
import { useCards, useCreateCard } from "@/queries/card-queries";
import {
  IconAlignLeft,
  IconCube3dSphere,
  IconDeviceFloppy,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

export default function Cards({ id }: { id: string }) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [filter, setFilter] = useState("");
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);

  const { data: cards, isPending, isError } = useCards(id, filter);
  const { mutateAsync: createCard } = useCreateCard();

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
    <main className="w-full bg-background-dark border-t h-full relative">
      <div className="absolute p-2 w-full">
        {/* Cards header */}
        <div className="flex items-center gap-2">
          <Input
            icon={<IconSearch className="size-4" />}
            className="bg-background !h-7 w-52 rounded-full"
            placeholder="Search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          {!isPending && !isError && (
            <Tooltip>
              <TooltipTrigger>
                <div className="bg-muted w-fit px-2 rounded-md text-sm text-muted-foreground">
                  {cards.length || 0}
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
            onClick={() => setShowCreateCard(true)}
            className="ml-auto"
            icon={<IconPlus />}
          >
            New card
          </Button>
        </div>
      </div>

      <div className="w-full h-full overflow-auto pt-12 p-2">
        <div className="flex flex-col gap-2 mx-auto max-w-lg">
          {/* Create card */}
          <AnimatePresence>
            {showCreateCard && (
              <motion.form
                onKeyDown={(e) => {
                  if (e.metaKey && e.key === "Enter") {
                    handleSave(e);
                  }
                  if (e.key === "Escape") {
                    handleCancel(
                      e as unknown as React.MouseEvent<HTMLButtonElement>,
                    );
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
                <div className="p-1 flex items-center gap-1 bg-background-dark border-t">
                  <Button size="sm" variant="ghost" icon={<IconCube3dSphere />}>
                    Basic
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-auto"
                    onClick={(e) => {
                      handleCancel(
                        e as unknown as React.MouseEvent<HTMLButtonElement>,
                      );
                    }}
                    icon={<IconX />}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" icon={<IconDeviceFloppy />}>
                    Save
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Cards List */}
          {!isPending &&
            !isError &&
            cards.map((card) => <Card key={card.id} card={card} />)}

          {isPending &&
            Array.from({ length: 5 }).map(() => (
              <Skeleton className="w-lg h-36" />
            ))}

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
        </div>
      </div>
    </main>
  );
}
