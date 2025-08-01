import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router";
import {
  IconChevronRight,
  IconCircleDashed,
  IconCube,
  IconPlus,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  useDeck,
  useDeckPath,
  useDecks,
  useRenameDeck,
  useSetLastReviewed,
} from "@/queries/deck-queries";
import { useCards } from "@/queries/card-queries";
import { useRef, useState } from "react";
import NewDeckDialog from "@/components/new-deck-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeckInfo({ id }: { id: string }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    data: deck,
    isPending: isDeckPending,
    isError: isDeckError,
  } = useDeck(id);
  const {
    data: subDecks,
    isPending: isSubdecksPending,
    isError: isSubdecksError,
  } = useDecks(id);
  const { mutateAsync: setLastReviewed } = useSetLastReviewed(id);

  const { mutateAsync: renameDeck } = useRenameDeck();

  const handleRenameSave = async () => {
    if (!deck) return;
    setRenameOpen(false);
    const newName = renameRef.current?.value.trim();
    if (!newName) {
      alert("Deck name is required");
      return;
    }
    await renameDeck({ id: deck.id, name: newName });
  };

  const handleReview = async () => {
    await setLastReviewed(new Date());
    navigate(`/decks/${id}/review`);
  };

  return (
    <div className="flex flex-col gap-3 bg-background z-10">
      <div className="w-full p-5 pt-0 mx-auto">
        <div>
          <div className="flex items-center gap-2">
            {/* Title */}
            {!isDeckPending && !isDeckError && (
              <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="text-base font-bold !p-0 text-foreground"
                  >
                    {deck.name}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>Rename Deck</DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenameSave();
                    }}
                  >
                    <Input
                      ref={renameRef}
                      defaultValue={deck.name}
                      placeholder="Deck Name"
                    />
                  </form>
                  <DialogFooter>
                    <Button type="submit" onClick={handleRenameSave}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {isDeckPending && <Skeleton className="h-7 w-36" />}
            {isDeckError && (
              <div className="h-7 font-medium text-destructive">
                Error: Could not get deck
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <NewDeckDialog id={id}>
                <Button className="" variant="outline">
                  <IconPlus className="size-4" />
                  New Deck
                </Button>
              </NewDeckDialog>
              <Button className="" variant="default" onClick={handleReview}>
                <IconCircleDashed className="size-4" />
                Review
              </Button>
            </div>
          </div>

          {/* Last reviewd */}
          {!isDeckPending && !isDeckError && (
            <div className="text-xs text-muted-foreground">
              {deck.lastReview === null
                ? "No reviews yet"
                : `Last reviewed ${formatDate(new Date(deck.lastReview)).toLowerCase()}`}
            </div>
          )}
        </div>

        {/* Subdecks list */}
        {
          <div className="w-full h-fit flex flex-col gap-2 mt-3">
            <div className="flex items-center gap-2 overflow-auto">
              {isSubdecksPending &&
                Array.from({ length: 3 }).map((_) => (
                  <Skeleton className="min-w-32 w-32 px-2 h-7 rounded-md font-medium flex items-center gap-1"></Skeleton>
                ))}
              {isSubdecksError && (
                <div className="text-sm text-destructive font-medium">
                  Error: Could not get subdecks
                </div>
              )}
              {!isSubdecksPending &&
                !isSubdecksError &&
                subDecks?.map((deck) => (
                  <NavLink
                    to={`/decks/${deck.id}`}
                    className="min-w-32 w-32 px-2 h-7 bg-background border rounded-md font-medium flex items-center gap-1 hover:bg-muted"
                  >
                    <div className="size-4">
                      <IconCube className="size-3.5" />
                    </div>
                    <div className="truncate text-sm">{deck.name}</div>
                  </NavLink>
                ))}
            </div>
          </div>
        }
      </div>
    </div>
  );
}
