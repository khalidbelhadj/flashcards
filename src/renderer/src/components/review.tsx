import { useCards } from "@/queries/card-queries";
import { useDeck, useDeckPath } from "@/queries/deck-queries";
import { useState } from "react";
import { NavLink, useParams } from "react-router";
import DeckHeader from "./deck-header";
import { Button } from "./ui/button";
import { IconArrowLeft, IconCube3dSphere, IconX } from "@tabler/icons-react";

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

  const { data: cards } = useCards(id);
  const { data: path, isPending, isError } = useDeckPath(id);

  if (deck === undefined || cards === undefined) {
    return <div>Loading...</div>;
  }

  const handleNext = () => {
    setCardIdx((prev) => Math.min(prev + 1, cards.length));
  };

  const handlePrev = () => {
    setCardIdx((prev) => Math.max(prev - 1, 0));
  };

  const handleHard = () => {
    handleNext();
    setShow(false);
  };

  const handleGood = () => {
    handleNext();
    setShow(false);
  };

  const handleEasy = () => {
    handleNext();
    setShow(false);
  };

  const card = cards[cardIdx];

  return (
    <div className="w-full h-full relative">
      <header className="flex items-center p-2 gap-2 pl-20 relative">
        <Button className="" size="sm" variant="outline" asChild>
          <NavLink to={`/decks/${deck.id}`}>
            <IconArrowLeft className="size-4" />
            Exit
          </NavLink>
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
      <main className="w-lg mx-auto pt-16 px-5 ">
        {cardIdx >= cards.length && (
          <div className="flex flex-col items-center">
            <div className="text-muted-foreground text-center p-4">
              No cards to review
            </div>
            <Button asChild>
              <NavLink to={`/decks/${deck.id}`}>Back to deck</NavLink>
            </Button>
          </div>
        )}
        {cardIdx < cards.length && (
          <>
            <div className="border rounded-md max-w-lg bg-background">
              <div className="p-2">{card.front}</div>
              {show && (
                <div className="p-2 border-t border-dashed">{card.back}</div>
              )}
              <div className="bg-muted/50 border-t p-1 flex items-center justify-between">
                <Button className="" size="sm" variant="ghost">
                  <IconCube3dSphere className="size-4" />
                  Basic
                </Button>
              </div>
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
