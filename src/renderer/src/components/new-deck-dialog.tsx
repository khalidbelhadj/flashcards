import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropsWithChildren, useRef, useState } from "react";
import { useCreateDeck } from "@/queries/deck-queries";

export default function NewDeckDialog({
  children,
  id,
}: PropsWithChildren<{
  id: string | null;
}>) {
  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const newDeckNameRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createDeck } = useCreateDeck();

  const handleCreateDeck = async () => {
    setNewDeckOpen(false);
    const name = newDeckNameRef.current?.value.trim();
    if (!name) {
      return;
    }
    await createDeck({ name, parentId: id });
    newDeckNameRef.current!.value = "";
  };

  return (
    <Dialog open={newDeckOpen} onOpenChange={setNewDeckOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>New Deck</DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateDeck();
          }}
        >
          <Input ref={newDeckNameRef} placeholder="Deck Name" />
        </form>
        <DialogFooter>
          <Button onClick={handleCreateDeck}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
