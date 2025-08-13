import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { DeckSearch } from "./deck-search";

Date.now = () => {
  return new Date("2025-08-08").getTime();
};

export default function Layout() {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "u") {
        e.preventDefault();
        navigate("/ui");
        return;
      }

      if (e.metaKey && e.key === "p") {
        e.preventDefault();
        setShowSearch(true);
        return;
      }

      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        alert("TODO: new deck");
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
  }, []);

  return (
    <div className="w-screen h-screen bg-background-dark relative overflow-hidden">
      <DeckSearch open={showSearch} onOpenChange={setShowSearch} />
      <Outlet />
    </div>
  );
}
