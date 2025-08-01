import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconAlignLeft,
  IconCards,
  IconCube3dSphere,
  IconDeviceFloppy,
  IconFilter,
  IconLayoutAlignRight,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLayoutList,
  IconLayoutRows,
  IconList,
  IconPlus,
  IconTable,
  IconX,
} from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { useDeck, useDeckPath } from "@/queries/deck-queries";
import { useCards, useCreateCard } from "@/queries/card-queries";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cards({ id }: { id: string }) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"list" | "grid" | "table">("list");
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
    <main className="w-full bg-muted border-t h-full relative">
      <div className="absolute p-2 w-full">
        {/* Cards header */}
        <div className="flex items-center gap-1">
          <Input
            className="bg-background !h-7 w-52"
            placeholder="Search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          {/* <div>
            <Button
              size="icon"
              variant="outline"
              className={cn("rounded-r-none", view === "list" && "bg-accent")}
              onClick={() => setView("list")}
            >
              <IconLayoutList className="size-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className={cn(
                "rounded-none border-l-0",
                view === "grid" && "bg-accent",
              )}
              onClick={() => setView("grid")}
            >
              <IconLayoutGrid className="size-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className={cn(
                "rounded-l-none border-l-0",
                view === "table" && "bg-accent",
              )}
              onClick={() => setView("table")}
            >
              <IconTable className="size-4" />
            </Button>
          </div> */}

          {!isPending && !isError && (
            <div className="text-sm p-1">{cards?.length || 0}</div>
          )}

          {/* <Button size="icon" variant="outline" className="ml-auto">
            <IconFilter className="size-4" />
          </Button> */}

          <Button
            variant="outline"
            onClick={() => setShowCreateCard(true)}
            className="ml-auto"
          >
            <IconPlus className="size-4" />
            New Card
          </Button>
        </div>
      </div>

      <div className="w-full h-full overflow-auto pt-12 p-2">
        <div className="flex flex-col gap-2 mx-auto max-w-lg">
          {/* Create card */}
          {showCreateCard && (
            <form
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
              <div className="p-2 border-b border-dashed">
                <Textarea
                  ref={frontRef}
                  name="front"
                  placeholder="Front"
                  autoFocus
                />
              </div>
              <div className="p-2 border-b">
                <Textarea ref={backRef} name="back" placeholder="Back" />
              </div>
              <div className="p-1 flex items-center gap-1 bg-muted/50">
                <Button className="" size="sm" variant="ghost">
                  <IconCube3dSphere className="size-4" />
                  Basic
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto bg-transparent"
                  onClick={(e) => {
                    handleCancel(
                      e as unknown as React.MouseEvent<HTMLButtonElement>,
                    );
                  }}
                >
                  <IconX className="size-4" />
                  Cancel
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  className="bg-transparent"
                >
                  <IconDeviceFloppy className="size-4" />
                  Save
                </Button>
              </div>
            </form>
          )}

          {/* Cards List */}
          {!isPending &&
            !isError &&
            cards.map((card) => (
              <div className="border rounded-md max-w-lg bg-background">
                <div className="p-2 border-b border-dashed">
                  <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
                    <IconAlignLeft className="size-3" />
                    Front
                  </div>
                  {card.front}
                </div>
                <div className="p-2">
                  <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
                    <IconAlignLeft className="size-3" />
                    Back
                  </div>
                  {card.back}
                </div>
                <div className="bg-muted/50 border-t p-1 flex items-center justify-between">
                  <Button className="" size="sm" variant="ghost">
                    <IconCube3dSphere className="size-4" />
                    Basic
                  </Button>
                </div>
              </div>
            ))}

          {isPending &&
            Array.from({ length: 5 }).map(() => (
              <Skeleton className="w-lg h-36" />
            ))}

          {/* No cards message */}
          {!showCreateCard && cards?.length === 0 && (
            <div className="text-muted-foreground">No cards in this deck</div>
          )}
        </div>
      </div>
    </main>
  );
}
