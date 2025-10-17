import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlus, IconSearch, IconUserFilled } from "@tabler/icons-react";

function Colours() {
  return (
    <div>
      <h2 className="text-2xl">Colours</h2>
      <div className="flex">
        <div className="size-40 border bg-background font-mono flex items-center justify-center text-xs text-muted-foreground">
          bg-background
        </div>
        <div className="size-40 border bg-background-dark font-mono flex items-center justify-center text-xs text-muted-foreground">
          bg-background-dark
        </div>
        <div className="size-40 border bg-background-darker font-mono flex items-center justify-center text-xs text-muted-foreground">
          bg-background-darker
        </div>
      </div>
      <div className="flex">
        <div className="size-40 border bg-primary font-mono flex items-center justify-center text-xs text-primary-foreground">
          primary
        </div>

        <div className="size-40 border bg-secondary font-mono flex items-center justify-center text-xs text-secondary-foreground">
          secondary
        </div>

        <div className="size-40 border bg-muted font-mono flex items-center justify-center text-xs text-muted-foreground">
          muted
        </div>

        <div className="size-40 border bg-accent font-mono flex items-center justify-center text-xs text-accent-foreground">
          accent
        </div>
      </div>
      <div className="flex">
        <div className="size-40 border bg-destructive font-mono flex items-center justify-center text-xs text-destructive-foreground">
          destructive
        </div>

        <div className="size-40 border bg-success font-mono flex items-center justify-center text-xs text-success-foreground">
          success
        </div>

        <div className="size-40 border bg-warning font-mono flex items-center justify-center text-xs text-warning-foreground">
          warning
        </div>

        <div className="size-40 border bg-info font-mono flex items-center justify-center text-xs text-info-foreground">
          info
        </div>
      </div>
    </div>
  );
}

function Radius() {
  return (
    <div className="flex gap-1">
      <div className="size-32 rounded-xs bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-xs
      </div>
      <div className="size-32 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-sm
      </div>
      <div className="size-32 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-md
      </div>
      <div className="size-32 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-lg
      </div>
      <div className="size-32 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-xl
      </div>
      <div className="size-32 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-2xl
      </div>
      <div className="size-32 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-3xl
      </div>
      <div className="size-32 rounded-4xl bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-4xl
      </div>
      <div className="size-32 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
        rounded-full
      </div>
    </div>
  );
}

function Buttons() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl">Buttons</h2>
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
          <Button
            icon={<IconPlus />}
            size="icon-lg"
            variant="secondary"
          ></Button>
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
          <Button
            icon={<IconPlus />}
            size="icon"
            variant="destructive"
          ></Button>
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
          <Button
            icon={<IconPlus />}
            size="icon-sm"
            variant="secondary"
          ></Button>
        </div>
      </div>
    </div>
  );
}

function Inputs() {
  return (
    <div className="flex gap-2">
      <Input />
      <Input icon={<IconUserFilled />} />
      <Input
        icon={<IconSearch className="size-4" />}
        className="rounded-full"
        placeholder="Search"
      />
    </div>
  );
}

export default function UI() {
  return (
    <div className="w-full h-full flex flex-col items-center py-16 gap-10 overflow-auto max-h-screen bg-background">
      <Colours />
      <Radius />
      <Buttons />
      <Inputs />
    </div>
  );
}
