import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatDate } from "@/lib/utils";
import {
  useDeleteCard,
  useDuplicateCard,
  useResetCardHistory,
  useUpdateCard,
} from "@/queries/card-queries";
import { useCardReviews } from "@/queries/review-queries";
import {
  IconAlignLeft,
  IconArrowsMove,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconCube,
  IconDots,
  IconEdit,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { CardsRow } from "src/lib/schema";

type CardProps = {
  card: CardsRow;
  setShowMove: (card: CardsRow) => void;
  isEditing?: boolean;
  onBeginEdit?: (cardId: string) => void;
  onEndEdit?: () => void;
};

type CardFooterProps = {
  card: CardsRow;
};

export function Card({
  card,
  setShowMove,
  isEditing = false,
  onBeginEdit,
  onEndEdit,
}: CardProps) {
  const { mutateAsync: deleteCard } = useDeleteCard();
  const { mutateAsync: resetCardHistory } = useResetCardHistory();
  const { mutateAsync: duplicateCard } = useDuplicateCard();
  const { mutateAsync: updateCard } = useUpdateCard();

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // When entering edit mode, focus the front textarea and move caret to end
  useEffect(() => {
    if (isEditing && frontRef.current) {
      const el = frontRef.current;
      // Defer to ensure element is mounted and focus sticks
      requestAnimationFrame(() => {
        el.focus();
        const length = el.value.length;
        try {
          el.setSelectionRange(length, length);
        } catch {
          // noop for older browsers
        }
      });
    }
  }, [isEditing]);

  const handleDelete = async () => {
    await deleteCard(card.id);
  };

  const handleResetHistory = async () => {
    await resetCardHistory(card.id);
  };

  const handleDuplicate = async () => {
    await duplicateCard(card.id);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!frontRef.current || !backRef.current) return;
    const front = frontRef.current.value;
    const back = backRef.current.value;
    await updateCard({ cardId: card.id, front, back });
    onEndEdit?.();
  };

  const handleCancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onEndEdit?.();
  };

  return (
    <div className="border rounded-md max-w-xl bg-background overflow-hidden relative group h-full flex flex-col">
      {/* Hover actions */}
      <div
        className={cn(
          "absolute top-2 right-2 flex gap-1 p-0.5 rounded-sm bg-background transition-opacity border",
          isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          isEditing && "hidden",
        )}
      >
        <Button
          className="rounded-sm"
          variant="ghost"
          size="icon-sm"
          icon={<IconTrash />}
          onClick={handleDelete}
        />
        <Button
          className="rounded-sm"
          variant="ghost"
          size="icon-sm"
          icon={<IconEdit />}
          onClick={() => (isEditing ? onEndEdit?.() : onBeginEdit?.(card.id))}
        />
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              className="rounded-sm"
              variant="ghost"
              size="icon-sm"
              icon={<IconDots />}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handleResetHistory}
            >
              <IconRefresh />
              Reset history
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={() => setShowMove(card)}
            >
              <IconArrowsMove />
              Move to
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handleDuplicate}
            >
              <IconCopy />
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isEditing ? (
        <form
          onKeyDown={(e) => {
            if (e.metaKey && e.key === "Enter") {
              handleSaveEdit(e as unknown as React.FormEvent<HTMLFormElement>);
            }
            if (e.key === "Escape") {
              handleCancelEdit(
                e as unknown as React.MouseEvent<HTMLButtonElement>,
              );
            }
          }}
          className="bg-background"
          onSubmit={handleSaveEdit}
        >
          <div className="p-2 flex flex-col gap-1">
            <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
              <IconAlignLeft className="size-3" />
              Front
            </div>
            <Textarea
              className="!ring-0 border-none p-0"
              ref={frontRef}
              name="front"
              placeholder="Type here..."
              defaultValue={card.front}
              autoFocus
            />
          </div>
          <div className="p-2 flex flex-col gap-1 border-t border-dashed">
            <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
              <IconAlignLeft className="size-3" />
              Back
            </div>
            <Textarea
              className="!ring-0 border-none p-0"
              ref={backRef}
              name="back"
              placeholder="Type here..."
              defaultValue={card.back}
            />
          </div>

          <div className="bg-background-dark border-t p-1 flex items-center gap-1">
            <Button
              className="hover:bg-muted gap-1 text-muted-foreground"
              size="sm"
              variant="ghost"
              icon={<IconCube className="size-3.5" />}
              type="button"
            >
              Basic
            </Button>

            <Button
              className="ml-auto"
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              size="sm"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="p-2 flex flex-col gap-1 grow">
            <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
              Front
            </div>
            {card.front.length > 0 ? (
              <div className="whitespace-pre-wrap break-words">
                {card.front}
              </div>
            ) : (
              <span className="text-muted-foreground">Empty</span>
            )}
          </div>
          <div className="p-2 flex flex-col gap-1  border-t border-dashed grow">
            <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
              Back
            </div>
            {card.back.length > 0 ? (
              <div className="whitespace-pre-wrap break-words">{card.back}</div>
            ) : (
              <span className="text-muted-foreground">Empty</span>
            )}
          </div>
          {/* <CardFooter card={card} /> */}
        </>
      )}
    </div>
  );
}

export function CardFooter({ card }: CardFooterProps) {
  const [open, setOpen] = useState(false);
  const { data: reviews, isLoading } = useCardReviews(card.id);

  const handleOpen = (newOpen: boolean) => {
    if (reviews && reviews.length > 0) {
      setOpen(newOpen);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getButtonText = () => {
    // TODO: @loading
    if (isLoading) return "Loading...";
    if (!reviews || reviews.length === 0) return "No reviews";
    if (card.lastReview) {
      return formatDate(new Date(card.lastReview));
    }
    return "No reviews";
  };

  return (
    <>
      <div className="bg-background-dark border-t p-1 flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger>
            <Button
              className="hover:bg-muted gap-1 text-muted-foreground"
              size="sm"
              variant="ghost"
              icon={<IconCube className="size-3.5" />}
            >
              Basic
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <div> This card uses the Basic template </div>
              <div className="text-muted-foreground">
                Click to edit the template
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip open={open ? false : undefined}>
          <TooltipTrigger>
            <Popover open={open} onOpenChange={handleOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-xs hover:bg-muted text-muted-foreground"
                  disabled={isLoading}
                  onClick={() => handleOpen(!open)}
                >
                  {getButtonText()}
                  {reviews &&
                    reviews.length > 0 &&
                    (open ? (
                      <IconChevronUp className="size-3" />
                    ) : (
                      <IconChevronDown className="size-3" />
                    ))}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="p-2 text-xs w-auto flex flex-col gap-1"
                align="end"
              >
                {reviews &&
                  reviews.map((review, i) => (
                    <div className="flex gap-1">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={cn(
                            "size-4 bg-muted rounded-full",
                            review.rating === "hard" && "bg-red-100",
                            review.rating === "good" && "bg-amber-100",
                            review.rating === "easy" && "bg-green-100",
                          )}
                        />
                        {i !== reviews.length - 1 && (
                          <div className="w-1 h-7 bg-muted rounded-[4px]" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm">{review.rating}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatDate(new Date(review.createdAt))}
                        </div>
                      </div>
                    </div>
                  ))}
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            {reviews && reviews.length > 0 && card.lastReview ? (
              <div>
                Last reviewed{" "}
                {formatDate(new Date(card.lastReview || ""), false)}
              </div>
            ) : (
              <div>This card has no reviews</div>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
