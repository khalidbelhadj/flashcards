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
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

  const { mutateAsync: createDeck } = useCreateDeck();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocation(id);
  }, [id]);

  const handleCreateDeck = async () => {
    const name = newDeckNameRef.current?.value.trim();
    if (!name) {
      return;
    }
    setLoading(true);
    const deck = await createDeck({ name, parentId: location });
    if (newDeckNameRef.current) newDeckNameRef.current.value = "";
    onClose();
    navigate(`/decks/${deck.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} onOpenAutoFocus={(e) => { e.preventDefault(); newDeckNameRef.current?.focus(); }}>
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
          <Button onClick={handleCreateDeck} loading={loading}>{loading ? "Creating" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
