import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";

function Buttons() {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-2">
        <Button size="lg">Button</Button>
        <Button size="lg" variant="outline">
          Button
        </Button>
        <Button size="lg" variant="ghost">
          Button
        </Button>
        <Button size="lg" variant="link">
          Button
        </Button>
        <Button size="lg" variant="destructive">
          Button
        </Button>
        <Button size="lg" variant="secondary">
          Button
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button icon={<IconPlus />} size="lg">
          Button
        </Button>
        <Button icon={<IconPlus />} size="lg" variant="outline">
          Button
        </Button>
        <Button icon={<IconPlus />} size="lg" variant="ghost">
          Button
        </Button>
        <Button icon={<IconPlus />} size="lg" variant="link">
          Button
        </Button>
        <Button icon={<IconPlus />} size="lg" variant="destructive">
          Button
        </Button>
        <Button icon={<IconPlus />} size="lg" variant="secondary">
          Button
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button icon={<IconPlus />} size="icon-lg"></Button>
        <Button icon={<IconPlus />} size="icon-lg" variant="outline"></Button>
        <Button icon={<IconPlus />} size="icon-lg" variant="ghost"></Button>
        <Button icon={<IconPlus />} size="icon-lg" variant="link"></Button>
        <Button
          icon={<IconPlus />}
          size="icon-lg"
          variant="destructive"
        ></Button>
        <Button icon={<IconPlus />} size="icon-lg" variant="secondary"></Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button>Button</Button>
        <Button variant="outline">Button</Button>
        <Button variant="ghost">Button</Button>
        <Button variant="link">Button</Button>
        <Button variant="destructive">Button</Button>
        <Button variant="secondary">Button</Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button icon={<IconPlus />}>Button</Button>
        <Button icon={<IconPlus />} variant="outline">
          Button
        </Button>
        <Button icon={<IconPlus />} variant="ghost">
          Button
        </Button>
        <Button icon={<IconPlus />} variant="link">
          Button
        </Button>
        <Button icon={<IconPlus />} variant="destructive">
          Button
        </Button>
        <Button icon={<IconPlus />} variant="secondary">
          Button
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button icon={<IconPlus />} size="icon"></Button>
        <Button icon={<IconPlus />} size="icon" variant="outline"></Button>
        <Button icon={<IconPlus />} size="icon" variant="ghost"></Button>
        <Button icon={<IconPlus />} size="icon" variant="link"></Button>
        <Button icon={<IconPlus />} size="icon" variant="destructive"></Button>
        <Button icon={<IconPlus />} size="icon" variant="secondary"></Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button size="sm">Button</Button>
        <Button size="sm" variant="outline">
          Button
        </Button>
        <Button size="sm" variant="ghost">
          Button
        </Button>
        <Button size="sm" variant="link">
          Button
        </Button>
        <Button size="sm" variant="destructive">
          Button
        </Button>
        <Button size="sm" variant="secondary">
          Button
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button icon={<IconPlus />} size="sm">
          Button
        </Button>
        <Button icon={<IconPlus />} size="sm" variant="outline">
          Button
        </Button>
        <Button icon={<IconPlus />} size="sm" variant="ghost">
          Button
        </Button>
        <Button icon={<IconPlus />} size="sm" variant="link">
          Button
        </Button>
        <Button icon={<IconPlus />} size="sm" variant="destructive">
          Button
        </Button>
        <Button icon={<IconPlus />} size="sm" variant="secondary">
          Button
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button icon={<IconPlus />} size="icon-sm"></Button>
        <Button icon={<IconPlus />} size="icon-sm" variant="outline"></Button>
        <Button icon={<IconPlus />} size="icon-sm" variant="ghost"></Button>
        <Button icon={<IconPlus />} size="icon-sm" variant="link"></Button>
        <Button
          icon={<IconPlus />}
          size="icon-sm"
          variant="destructive"
        ></Button>
        <Button icon={<IconPlus />} size="icon-sm" variant="secondary"></Button>
      </div>
    </div>
  );
}

function Inputs() {
  return (
    <div className="flex gap-2">
      <Input />
      <Input icon={<IconSearch />} />
      <Input icon={<IconSearch />} rightElement={<IconX />} />
    </div>
  );
}

export default function UI() {
  return (
    <div className="w-full h-full flex flex-col items-center py-16 gap-10 overflow-clip max-h-screen bg-background">
      <Buttons />
      <Inputs />
    </div>
  );
}
