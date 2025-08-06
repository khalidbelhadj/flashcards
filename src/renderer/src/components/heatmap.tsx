import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const year = 2025;

function getDateFromOffset(baseDate, offset) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offset);
  return date;
}

export default function Heatmap() {
  const [_, setH] = useState(0);
  const days = Array.from({ length: 365 });
  const firstDay = new Date(`${year}-01-01`);

  return (
    <>
      <div className="grid grid-rows-7 grid-flow-col gap-[2px] w-fit">
        {Array.from({ length: firstDay.getDay() }).map(() => (
          <div className="size-[10px] bg-transparent " />
        ))}
        {days.map((_, i) => (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div
                onMouseEnter={() => setH(i)}
                key={i}
                className="size-3 bg-neutral-200 rounded-sm"
              />
            </TooltipTrigger>
            <TooltipContent>
              {getDateFromOffset(firstDay, i).toLocaleDateString("en-UK", {
                dateStyle: "full",
              })}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </>
  );
}
