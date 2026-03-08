import { IconSearch, IconPlus, IconTrash, IconSettings } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

export default function ComponentLibrary() {
  return (
    <div className="flex flex-col h-screen">
      <header className="h-10 border-b flex items-center px-4 shrink-0">
        <h1 className="text-sm font-semibold">Component Library</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Buttons */}
        <Section title="Button">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Section>

        <Section title="Button Sizes">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><IconPlus /></Button>
          <Button size="icon-xs"><IconPlus /></Button>
          <Button size="icon-sm"><IconPlus /></Button>
          <Button size="icon-lg"><IconPlus /></Button>
        </Section>

        <Section title="Button with Icons">
          <Button><IconPlus data-icon="inline-start" /> New Deck</Button>
          <Button variant="outline"><IconSearch data-icon="inline-start" /> Search</Button>
          <Button variant="destructive"><IconTrash data-icon="inline-start" /> Delete</Button>
          <Button disabled>Disabled</Button>
        </Section>

        {/* Badges */}
        <Section title="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Section>

        {/* Input */}
        <Section title="Input">
          <div className="w-full max-w-sm space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="input-default">Default Input</Label>
              <Input id="input-default" placeholder="Type something..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="input-disabled">Disabled Input</Label>
              <Input id="input-disabled" placeholder="Disabled" disabled />
            </div>
          </div>
        </Section>

        {/* Input Group */}
        <Section title="Input Group">
          <div className="w-full max-w-sm space-y-3">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText><IconSearch /></InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="Search..." />
            </InputGroup>

            <InputGroup>
              <InputGroupInput placeholder="With button..." />
              <InputGroupAddon align="inline-end">
                <InputGroupButton>
                  <IconSettings />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </Section>

        {/* Textarea */}
        <Section title="Textarea">
          <div className="w-full max-w-sm space-y-1.5">
            <Label htmlFor="textarea-default">Description</Label>
            <Textarea id="textarea-default" placeholder="Enter a description..." />
          </div>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>This is a tooltip</TooltipContent>
          </Tooltip>
        </Section>
      </main>
    </div>
  )
}
