import { prefetchAllDecks } from "@/lib/utils";
import { useDueCards } from "@/queries/card-queries";
import { useQueryClient } from "@tanstack/react-query";
import { IconCards } from "@tabler/icons-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import Decks from "./decks";

export default function Home() {
  const qc = useQueryClient();
  prefetchAllDecks(qc);
  const { data: due } = useDueCards(null);

  return (
    <div className="w-full h-full flex flex-col items-center py-14 px-3 gap-4 overflow-clip max-h-screen min-h-0">
      <Decks />
      {due && due.length > 0 && (
        <Button asChild icon={<IconCards className="size-4" />}>
          <NavLink to="/review">
            Review all
            <span className="ml-1 bg-primary-foreground/20 text-primary-foreground text-xs px-1.5 py-0.5 rounded-sm">
              {due.length}
            </span>
          </NavLink>
        </Button>
      )}
    </div>
  );
}
