import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { useCardReviews } from "@/queries/review-queries";
import {
  IconAlignLeft,
  IconChevronDown,
  IconChevronUp,
  IconCube3dSphere,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { CardsRow } from "src/lib/schema";

interface CardProps {
  card: CardsRow;
}

export function Card({ card }: CardProps) {
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
    <div className="border rounded-md max-w-lg bg-background overflow-hidden">
      <div className="p-2 border-b border-dashed flex flex-col gap-1">
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
      <div className="p-2 flex flex-col gap-1">
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
      <div className="bg-background-dark border-t p-1 flex items-center justify-between">
        <Button
          className="hover:bg-muted text-xs gap-1"
          size="sm"
          variant="ghost"
          icon={<IconCube3dSphere className="size-icon-sm" />}
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
            transition={{ duration: 0.2 }}
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
    </div>
  );
}
