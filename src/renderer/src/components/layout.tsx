import {
  DeckDialogueProvider,
  useDeckDialogue,
} from "@/contexts/deck-dialogue-context";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { DeckSearch } from "./deck-search";
import DeleteDeckDialog from "./delete-deck-dialog";
import MoveDeckDialog from "./move-deck-dialog";
import NewDeckDialog from "./new-deck-dialog";
import RenameDeckDialogue from "./rename-deck-dialog";

Date.now = () => {
  return new Date("2025-08-08").getTime();
};

function DeckDialogues() {
  const { dialogue, closeDialogue } = useDeckDialogue();

  if (!dialogue) return null;

  return (
    <>
      {dialogue.type === "move" && (
        <MoveDeckDialog
          open={dialogue.type === "move"}
          onClose={closeDialogue}
          id={dialogue.id}
          parentId={dialogue.parentId}
        />
      )}
      {dialogue.type === "rename" && (
        <RenameDeckDialogue
          open={dialogue.type === "rename"}
          onClose={closeDialogue}
          id={dialogue.id}
          name={dialogue.name}
        />
      )}
      {dialogue.type === "new" && (
        <NewDeckDialog
          id={dialogue.id}
          open={dialogue.type === "new"}
          onClose={closeDialogue}
        />
      )}
      {dialogue.type === "delete" && (
        <DeleteDeckDialog
          id={dialogue.id}
          open={dialogue.type === "delete"}
          onClose={closeDialogue}
        />
      )}
    </>
  );
}

function Layout() {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { openDialogue } = useDeckDialogue();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "d") {
        e.preventDefault();
        document.documentElement.classList.toggle("dark");
        return;
      }

      if (e.metaKey && e.key === "u") {
        e.preventDefault();
        navigate("/ui");
        return;
      }

      if (e.metaKey && e.key === "p") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
        return;
      }

      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        openDialogue({ type: "new", id: null });
        return;
      }

      if (e.metaKey && e.key === "[") {
        navigate(-1);
        return;
      }

      if (e.metaKey && e.key === "]") {
        navigate(1);
        return;
      }

      if (e.metaKey && e.key === "ArrowUp") {
        alert("TODO: navigate up");
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, openDialogue]);

  return (
    <div className="w-screen h-screen bg-background-dark relative overflow-hidden">
      <DeckSearch open={showSearch} onOpenChange={setShowSearch} />
      <DeckDialogues />
      <Outlet />
    </div>
  );
}

function LayoutWithProvider() {
  return (
    <DeckDialogueProvider>
      <Layout />
    </DeckDialogueProvider>
  );
}

export default LayoutWithProvider;
