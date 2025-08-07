import { DeckPicker } from "@/components/deck-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMoveCard } from "@/queries/card-queries";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CardsRow } from "src/lib/schema";

export default function MoveCardDialog({
  onClose,
  card,
}: {
  onClose: () => void;
  card: CardsRow | null;
}) {
  const [location, setLocation] = useState<string | null>(card?.deckId ?? null);
  const { mutateAsync: moveCard } = useMoveCard();

  const handleMoveCard = async () => {
    if (!card) return;
    // TODO: error here
    if (!location) return;
    await moveCard({ cardId: card.id, deckId: location });
    onClose();
  };

  useEffect(() => {
    setLocation(card?.deckId ?? null);
  }, [card]);

  return (
    <Dialog open={card !== null} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Move card</DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </DialogHeader>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>Location</Label>
            <DeckPicker
              id={location}
              setId={(id) => setLocation(id)}
              disabled={card ? [card.id] : []}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleMoveCard}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
