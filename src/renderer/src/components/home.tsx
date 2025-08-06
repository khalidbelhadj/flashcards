import Decks from "./decks";
export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center py-16 gap-10 overflow-clip max-h-screen">
      <Decks />
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
