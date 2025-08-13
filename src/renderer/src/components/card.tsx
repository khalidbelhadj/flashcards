import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
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
import { AnimatePresence, motion } from "framer-motion";
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
    <div className="border rounded-md max-w-lg bg-background overflow-hidden relative group">
      {/* Hover actions */}
      <div
        className={cn(
          "absolute top-2 right-2 flex gap-1 p-0.5 rounded-sm text-muted-foreground bg-background transition-opacity duration-150 border",
          isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          isEditing && "!opacity-0",
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
          className="max-w-lg bg-background"
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
          <div className="p-2 flex flex-col gap-1">
            <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
              <IconAlignLeft className="size-3" />
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
          <div className="p-2 flex flex-col gap-1  border-t border-dashed ">
            <div className="text-xs border rounded-sm w-fit px-1 flex items-center gap-1">
              <IconAlignLeft className="size-3" />
              Back
            </div>
            {card.back.length > 0 ? (
              <div className="whitespace-pre-wrap break-words">{card.back}</div>
            ) : (
              <span className="text-muted-foreground">Empty</span>
            )}
          </div>
          <CardFooter card={card} />
        </>
      )}
    </div>
  );
}

export function CardFooter({ card }: CardFooterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: reviews, isLoading } = useCardReviews(card.id);

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
        <Button
          className="hover:bg-muted gap-1 text-muted-foreground"
          size="sm"
          variant="ghost"
          icon={<IconCube className="size-3.5" />}
        >
          Basic
        </Button>

        <Button
          variant="ghost"
          size="sm"
          // TODO: review this
          className="flex items-center gap-1 text-xs hover:bg-muted text-muted-foreground"
          disabled={isLoading}
          onClick={() => setIsExpanded((p) => !p)}
        >
          {getButtonText()}
          {reviews &&
            reviews.length > 0 &&
            (isExpanded ? (
              <IconChevronUp className="size-3" />
            ) : (
              <IconChevronDown className="size-3" />
            ))}
        </Button>
      </div>
      <AnimatePresence>
        {isExpanded && reviews && reviews.length > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* <div className="text-xs font-medium mb-2">Review History</div> */}
            <div className="space-y-1 max-h-32 overflow-y-auto p-2 border-t">
              {reviews
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        getRatingColor(review.rating),
                        "px-1 py-0 rounded-sm",
                      )}
                    >
                      {review.rating}
                    </Badge>
                    <span className="text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground ml-auto">
                      {formatDate(new Date(review.createdAt))}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
