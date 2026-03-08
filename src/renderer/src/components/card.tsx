import {
  useDeleteCard,
  useDuplicateCard,
  useResetCardHistory,
  useUpdateCard,
} from "@/queries/card-queries";
import { useRef } from "react";
import type { CardsRow } from "src/lib/schema";

type CardProps = {
  card: CardsRow;
  onSelect: (id: string) => void;
};

export function Card({ card, onSelect }: CardProps) {
  const { mutateAsync: deleteCard } = useDeleteCard();
  const { mutateAsync: resetCardHistory } = useResetCardHistory();
  const { mutateAsync: duplicateCard } = useDuplicateCard();
  const { mutateAsync: updateCard } = useUpdateCard();

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);

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
    <div
      className="border rounded-md max-w-xl bg-background overflow-hidden relative group h-full flex flex-col hover:border-ring/50 hover:ring-ring/25 hover:ring-[3px] ring-primary/25 cursor-pointer"
      onClick={() => onSelect(card.id)}
    >
      <div className="p-2 flex flex-col gap-1 grow">
        <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
          Front
        </div>
        {card.front.length > 0 ? (
          <div className="whitespace-pre-wrap break-words font-content">{card.front}</div>
        ) : (
          <span className="text-muted-foreground">Empty</span>
        )}
      </div>
      <div className="p-2 flex flex-col gap-1  border-t border-dashed grow">
        <div className="text-xs rounded-sm w-fit px-1.5 flex items-center gap-1 bg-muted text-muted-foreground font-medium">
          Back
        </div>
        {card.back.length > 0 ? (
          <div className="whitespace-pre-wrap break-words font-content">{card.back}</div>
        ) : (
          <span className="text-muted-foreground">Empty</span>
        )}
      </div>
    </div>
  );
}
