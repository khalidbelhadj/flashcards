import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import {
  useDeleteCard,
  useDuplicateCard,
  useResetCardHistory,
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
import { useState } from "react";
import type { CardsRow } from "src/lib/schema";

type CardProps = {
  card: CardsRow;
  setShowMove: (card: CardsRow) => void;
};

type CardFooterProps = {
  card: CardsRow;
};

export function Card({ card, setShowMove }: CardProps) {
  const { mutateAsync: deleteCard } = useDeleteCard();
  const { mutateAsync: resetCardHistory } = useResetCardHistory();
  const { mutateAsync: duplicateCard } = useDuplicateCard();

  const handleDelete = async () => {
    await deleteCard(card.id);
  };

  const handleResetHistory = async () => {
    await resetCardHistory(card.id);
  };

  const handleDuplicate = async () => {
    await duplicateCard(card.id);
  };

  return (
    <div className="border rounded-md max-w-lg bg-background overflow-hidden relative group">
      <div className="absolute top-2 right-2 flex gap-1 p-0.5 rounded-sm text-muted-foreground bg-background-dark opacity-0 group-hover:opacity-100  transition-opacity duration-150">
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
        />
        <DropdownMenu>
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
      <CardFooter card={card} />
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
