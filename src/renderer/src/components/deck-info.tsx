import NewDeckDialog from "@/components/new-deck-dialog";
import ProjectIcon from "@/components/project-icon";
import RenameDeckDialogue from "@/components/rename-deck-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import { useDeck, useDecks, useSetLastReviewed } from "@/queries/deck-queries";
import { IconCircleDashed, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

export default function DeckInfo({ id }: { id: string }) {
  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
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

  const handleReview = async () => {
    await setLastReviewed(new Date());
    navigate(`/decks/${id}/review`);
  };

  return (
    <div className="flex flex-col gap-3 bg-background z-10">
      <div className="w-full px-5 mx-auto">
        <div>
          <div className="flex items-center gap-2">
            {/* Title */}
            {!isDeckPending && !isDeckError && (
              <>
                <RenameDeckDialogue
                  open={renameOpen}
                  onClose={() => setRenameOpen(false)}
                  id={deck.id}
                  name={deck.name}
                />
                <Button
                  variant="ghost"
                  className="text-base font-medium !p-0 text-foreground gap-1 hover:bg-background hover:text-muted-foreground transition-colors"
                  icon={<ProjectIcon />}
                  onClick={() => setRenameOpen(true)}
                >
                  {deck.name}
                </Button>
              </>
            )}

            {isDeckPending && <Skeleton className="h-7 w-36" />}
            {isDeckError && (
              <div className="h-7 font-medium text-destructive">
                Error: Could not get deck
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <NewDeckDialog
                id={id}
                open={newDeckOpen}
                onClose={() => setNewDeckOpen(false)}
              />
              <Button
                variant="outline"
                onClick={() => setNewDeckOpen(true)}
                icon={<IconPlus />}
              >
                New deck
              </Button>
              <Button
                className=""
                variant="default"
                onClick={handleReview}
                icon={<IconCircleDashed />}
              >
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
        <div
          className={cn(
            "w-full h-fit flex flex-col gap-2 pt-3 pb-5",
            subDecks?.length === 0 && "pt-0",
          )}
        >
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
                  className="min-w-32 w-32 px-2 h-7 bg-background border rounded-md font-medium flex items-center gap-1 hover:bg-accent"
                >
                  <div className="size-4">
                    <ProjectIcon className="size-3.5" />
                  </div>
                  <div className="truncate text-sm">{deck.name}</div>
                </NavLink>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
