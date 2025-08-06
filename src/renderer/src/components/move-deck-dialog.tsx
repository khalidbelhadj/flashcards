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
import { useMoveDeck } from "@/queries/deck-queries";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function MoveDeckDialog({
  open,
  onClose,
  id,
  parentId,
}: {
  open: boolean;
  onClose: () => void;
  id: string | null;
  parentId: string | null;
}) {
  const [location, setLocation] = useState<string | null>(parentId);

  const { mutateAsync: moveDeck } = useMoveDeck();

  const handleMoveDeck = async () => {
    if (!id) return;
    await moveDeck({ id, parentId: location });
    onClose();
  };

  useEffect(() => {
    setLocation(parentId);
  }, [parentId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Move deck</DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </DialogHeader>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>Location</Label>
            <DeckPicker
              id={location}
              setId={setLocation}
              disabled={id ? [id] : []}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleMoveDeck}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
