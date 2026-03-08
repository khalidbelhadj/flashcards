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
import { useRenameDeck } from "@/queries/deck-queries";
import { IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";

export default function RenameDeckDialogue({
  open,
  onClose,
  id,
  name,
}: {
  open: boolean;
  onClose: () => void;
  id: string | null;
  name: string;
}) {
  const { mutateAsync: renameDeck } = useRenameDeck();
  const renameRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleRenameSave = async () => {
    if (!id) return;
    const newName = renameRef.current?.value.trim();
    if (!newName) {
      alert("Deck name is required");
      return;
    }
    setLoading(true);
    await renameDeck({ id, name: newName });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} onOpenAutoFocus={(e) => { e.preventDefault(); renameRef.current?.focus(); }}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Rename deck</DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </DialogHeader>
        <form
          className="p-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleRenameSave();
          }}
        >
          <div className="flex flex-col gap-1">
            <Label>New Name</Label>
            <Input
              autoFocus
              ref={renameRef}
              defaultValue={name}
              placeholder="Deck Name"
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleRenameSave} loading={loading}>
            {loading ? "Saving" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
