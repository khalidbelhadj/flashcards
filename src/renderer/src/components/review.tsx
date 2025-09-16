import { useDueCards } from "@/queries/card-queries";
import { useDeck, useDeckPath } from "@/queries/deck-queries";
import { useCreateReview } from "@/queries/review-queries";
import { IconAlignLeft, IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { NavLink, useParams } from "react-router";
import { Button } from "./ui/button";

import { CardFooter } from "@/components/card";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function Review() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("Deck ID is required");

  const [show, setShow] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);

  const { data: deck } = useDeck(id);

  const { data: due } = useDueCards(id);
  const { data: path, isPending, isError } = useDeckPath(id);

  const { mutateAsync: createReview } = useCreateReview();

  if (deck === undefined || due === undefined) {
    return <div>Loading...</div>;
  }

  const handleNext = () => {
    setCardIdx((prev) => Math.min(prev + 1, due.length));
  };

  const handleForgot = async () => {
    const card = due[cardIdx];
    if (card) {
      await createReview({
        deckId: id,
        cardId: card.id,
        rating: "forgot",
      });
    }
    handleNext();
    setShow(false);
  };

  const handleHard = async () => {
    const card = due[cardIdx];
    if (card) {
      await createReview({
        deckId: id,
        cardId: card.id,
        rating: "hard",
      });
    }
    handleNext();
    setShow(false);
  };

  const handleGood = async () => {
    const card = due[cardIdx];
    if (card) {
      await createReview({
        deckId: id,
        cardId: card.id,
        rating: "good",
      });
    }
    handleNext();
    setShow(false);
  };

  const handleEasy = async () => {
    const card = due[cardIdx];
    if (card) {
      await createReview({
        deckId: id,
        cardId: card.id,
        rating: "easy",
      });
    }
    handleNext();
    setShow(false);
  };

  const card = due[cardIdx];

  return (
    <div className="w-full h-full relative">
      <header className="flex items-center p-2 gap-2 pl-20 relative">
        <Button
          className=""
          size="sm"
          variant="outline"
          asChild
          icon={<IconArrowLeft className="size-4" />}
        >
          <NavLink to={`/decks/${deck.id}`}>Exit</NavLink>
        </Button>
        <Breadcrumb className="absolute left-1/2 -translate-x-1/2 ">
          <BreadcrumbList className="flex-nowrap">
            {isError && (
              <div className="text-destructive">Could not get path</div>
            )}

            {isPending && <Skeleton className="h-5 w-24" />}

            {!isPending && !isError && (
              <>
                <BreadcrumbItem>
                  <NavLink to={`/`}>Decks</NavLink>
                </BreadcrumbItem>
                {path.length <= 3 &&
                  path.map((p) => (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem
                        className={cn("", p.id === id && "text-foreground")}
                      >
                        <NavLink to={`/decks/${p.id}`}>{p.name}</NavLink>
                      </BreadcrumbItem>
                    </>
                  ))}

                {path.length > 3 && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem key={id}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <BreadcrumbEllipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuGroup>
                            {path.slice(0, path.length - 2).map((deck) => (
                              <DropdownMenuItem key={deck.id} asChild>
                                <NavLink to={`/decks/${deck.id}`}>
                                  {deck.name}
                                </NavLink>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>

                    {path.slice(-2).map((p) => (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem
                          className={cn("", p.id === id && "text-foreground")}
                        >
                          <NavLink to={`/decks/${p.id}`}>{p.name}</NavLink>
                        </BreadcrumbItem>
                      </>
                    ))}
                  </>
                )}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {due.length > 0 && (
        <div className="flex items-center justify-center p-4 flex-col">
          <div className="text-muted-foreground">
            {cardIdx + 1} / {due.length}
          </div>
          <div className="w-96 bg-neutral-200 border border-neutral-300 h-5 rounded-full overflow-clip">
            <div
              className="bg-success h-full transition-all ease-in-out duration-300"
              style={{
                width: `${(cardIdx / due.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
      {/* <input
        type="range"
        step={1}
        min={0}
        max={maxProgress}
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex items-center justify-center p-4">
        <Button
          onClick={() => {
            setProgress((p) => Math.max(p - 1, 0));
          }}
        >
          -
        </Button>
        <Button
          onClick={() => {
            setProgress((p) => Math.min(p + 1, maxProgress));
          }}
        >
          +
        </Button>
      </div> */}

      <main className="w-lg mx-auto pt-16 px-5 ">
        {cardIdx >= due.length && (
          <div className="flex flex-col items-center">
            <div className="text-muted-foreground text-center p-4">
              No cards to review
            </div>
            <Button asChild>
              <NavLink to={`/decks/${deck.id}`}>Back to deck</NavLink>
            </Button>
          </div>
        )}
        {cardIdx < due.length && (
          <>
            <div className="border rounded-md max-w-lg bg-background overflow-hidden">
              <div className="p-2 flex flex-col gap-1">
                <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
                  <IconAlignLeft className="size-3" />
                  Front
                </div>
                {card.front.length > 0 ? (
                  card.front
                ) : (
                  <span className="text-muted-foreground">Empty</span>
                )}
              </div>
              {show && (
                <div className="p-2 flex flex-col gap-1  border-t border-dashed ">
                  <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
                    <IconAlignLeft className="size-3" />
                    Back
                  </div>
                  {card.back.length > 0 ? (
                    card.back
                  ) : (
                    <span className="text-muted-foreground">Empty</span>
                  )}
                </div>
              )}
              <CardFooter card={card} />
            </div>

            {/* <div className="bg-background rounded-md border p-2">
              <div>{card.front}</div>
              {show && (
                <>
                  <div className=" border-t border-dashed">{card.back}</div>
                </>
              )}
            </div> */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2">
              {!show && <Button onClick={() => setShow(true)}>Show</Button>}
              {show && (
                <div className="flex flex-col gap-1">
                  <Button onClick={() => setShow(false)}>Hide Answer</Button>
                  <div className="flex items-center gap-1">
                    <Button onClick={handleForgot}>Forgot</Button>
                    <Button onClick={handleHard}>Hard</Button>
                    <Button onClick={handleGood}>Good</Button>
                    <Button onClick={handleEasy}>Easy</Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
