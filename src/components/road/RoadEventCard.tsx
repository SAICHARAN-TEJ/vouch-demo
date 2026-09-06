import type { KeyboardEvent } from "react";
import type { RoadEvent, RoadEventStatus } from "@/types";
import { cn } from "@/lib/cn";
import { Icon, HAZARD_ICON } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { ROAD_EVENT_LABEL, ROAD_EVENT_STATUS_LABEL } from "@/config/labels";
import { hazardBg, hazardText, statusTone } from "@/lib/ui";

function barTone(status: RoadEventStatus): "justified" | "info" | "caution" {
  if (status === "confirmed") return "justified";
  if (status === "probable") return "info";
  return "caution";
}

/**
 * Shared card for a road event (hazard). Used on the Map list, the Road Event
 * detail screen and the "shared intelligence" hero beat.
 */
export function RoadEventCard({
  event,
  highlight,
  onClick,
  className,
}: {
  event: RoadEvent;
  highlight?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const clickable = Boolean(onClick);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onClick();
  };

  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      aria-label={clickable ? `${ROAD_EVENT_LABEL[event.type]} details` : undefined}
      className={cn(
        "card p-4 transition",
        clickable && "cursor-pointer hover:bg-white/[0.04]",
        clickable && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        highlight && "ring-1 ring-primary/50 shadow-glow",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5",
            hazardText(event.type),
          )}
        >
          <Icon name={HAZARD_ICON[event.type]} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-content">
              {ROAD_EVENT_LABEL[event.type]}
            </h3>
            <Badge tone={statusTone(event.status)}>
              {ROAD_EVENT_STATUS_LABEL[event.status]}
            </Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon name="Users" className="h-3.5 w-3.5" />
              <span className="tnum">{event.riders}</span> riders
            </span>
            <span className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", hazardBg(event.type))} />
              <span className="tnum">{event.reports}</span> reports
            </span>
          </div>
        </div>
        {clickable && <Icon name="ChevronRight" className="h-5 w-5 shrink-0 text-muted" />}
      </div>

      <div className="mt-3">
        <ConfidenceBar value={event.confidence} tone={barTone(event.status)} />
      </div>
    </div>
  );
}
