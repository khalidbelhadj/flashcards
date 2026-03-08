import type { CardsRow } from "src/lib/schema";
import { useDebugMode, ReviewDebugInfo } from "./review-debug";

type CardProps = {
  card: CardsRow;
  onSelect: (id: string) => void;
};

export function Card({ card, onSelect }: CardProps) {
  const debugMode = useDebugMode();

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
      {debugMode && (
        <div className="border-t px-2 py-1">
          <ReviewDebugInfo card={card} />
        </div>
      )}
    </div>
  );
}
