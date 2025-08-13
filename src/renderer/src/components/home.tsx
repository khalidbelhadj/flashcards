import { useDueCards } from "@/queries/card-queries";
import Decks from "./decks";
export default function Home() {
  const { data: due } = useDueCards();

  return (
    <div className="w-full h-full flex flex-col items-center py-14 px-3 gap-10 overflow-clip max-h-screen min-h-0">
      <Decks />
      <div>due today: {due?.length}</div>
      {/* <div className="flex flex-col gap-1 w-lg border rounded-md bg-background h-72 overflow-y-auto">
        {due?.slice(0, 30).map((c) => (
          <div className="h-5">
            <div className="truncate">{c.front}</div>
          </div>
        ))}
      </div> */}
      {/* <div className="flex gap-2 items-center justify-center mt-auto">
        <Button variant="outline" icon={<IconSettings />}>
          Settings
        </Button>
        <Button variant="outline" icon={<IconTemplate />}>
          Templates
        </Button>
        <Button variant="outline" icon={<IconChartBar />}>
          Statistics
        </Button>
        <Button variant="outline" icon={<IconCards />}>
          All Cards
        </Button>

        <Button variant="outline" icon={<IconCards />}>
          Review
        </Button>
      </div> */}
    </div>
  );
}
