import { Skeleton } from "@/components/ui/skeleton";
import { useDeckPath } from "@/queries/deck-queries";
import { DeckBreadcrumb } from "./deck-breadcrumb";

export default function DeckHeader({ id }: { id: string }) {
  const { data: path, isPending, isError } = useDeckPath(id);

  if (path?.length === 0) {
    throw new Error("TODO");
  }

  return (
    <header className="flex items-center p-3 gap-2 bg-background justify-center">
      {/* <div className="absolute left-20 flex items-center">
        <Button variant="ghost" size="icon-sm" asChild>
          <IconArrowLeft className="text-muted-foreground size-icon-lg" />
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <IconArrowRight className="text-muted-foreground size-icon-lg" />
        </Button>
      </div> */}
      {isError && <div className="text-destructive">Could not get path</div>}

      {isPending && <Skeleton className="h-5 w-24" />}

      {!isPending && !isError && <DeckBreadcrumb path={path} deckId={id} />}
    </header>
  );
}
