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
import { useRef } from "react";

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

  const handleRenameSave = async () => {
    if (!id) return;
    onClose();
    const newName = renameRef.current?.value.trim();
    if (!newName) {
      alert("Deck name is required");
      return;
    }
    await renameDeck({ id, name: newName });
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
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
          <Button type="submit" onClick={handleRenameSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
