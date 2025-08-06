import { DeckPicker } from "@/components/deck-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDeck } from "@/queries/deck-queries";
import { IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export default function NewDeckDialog({
  open,
  onClose,
  id,
}: {
  open: boolean;
  onClose: () => void;
  id: string | null;
}) {
  const [location, setLocation] = useState<string | null>(id);
  const newDeckNameRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createDeck } = useCreateDeck();

  useEffect(() => {
    setLocation(id);
  }, [id]);

  const handleCreateDeck = async () => {
    onClose();
    const name = newDeckNameRef.current?.value.trim();
    if (!name) {
      return;
    }
    await createDeck({ name, parentId: location });
    newDeckNameRef.current!.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>New deck</DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </DialogHeader>
        <div className="p-4 flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateDeck();
            }}
          >
            <div className="flex flex-col gap-1">
              <Label>Name</Label>
              <Input ref={newDeckNameRef} placeholder="Deck Name" autoFocus />
            </div>
          </form>

          <div className="flex flex-col gap-1">
            <Label>Location</Label>
            <DeckPicker id={location} setId={setLocation} collapsible />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleCreateDeck}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
