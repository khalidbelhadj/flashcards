import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResetDeckHistory } from "@/queries/card-queries";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

export default function ResetHistoryDialog({
  open,
  onClose,
  id,
}: {
  open: boolean;
  onClose: () => void;
  id: string;
}) {
  const { mutateAsync: resetDeckHistory } = useResetDeckHistory();
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    await resetDeckHistory(id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Reset review history</DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </DialogHeader>
        <div className="p-2 text-sm text-muted-foreground">
          This will reset all review history for cards in this deck. All cards
          will be treated as new. This action cannot be undone.
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReset} loading={loading}>
            {loading ? "Resetting" : "Reset history"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
