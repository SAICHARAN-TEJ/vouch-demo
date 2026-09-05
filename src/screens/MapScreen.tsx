import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { VouchMap } from "@/components/map/VouchMap";
import { RoadEventCard } from "@/components/road/RoadEventCard";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Icon } from "@/components/ui/Icon";
import { useRoadEvents } from "@/hooks/queries";
import type { RoadEventType } from "@/types";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { hazardBg } from "@/lib/ui";
const LEGEND: RoadEventType[] = ["pothole", "speed_breaker", "waterlogging", "debris"];
export function MapScreen() { const navigate = useNavigate(); const { data: roadEvents = [], isLoading, error } = useRoadEvents(); const sorted = [...roadEvents].sort((a, b) => b.confidence - a.confidence); const open = (id: string) => navigate(`/road/${id}`); return <div className="flex flex-col"><ScreenHeader title="Road Map" subtitle="Live shared intelligence" right={<SourceBadge />} /><div className="p-4"><div className="relative h-[300px] overflow-hidden rounded-2xl hairline"><VouchMap roadEvents={roadEvents} onSelect={open} className="absolute inset-0" /><div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-wrap gap-x-3 gap-y-1.5 bg-gradient-to-t from-bg/90 to-transparent p-3">{LEGEND.map((t) => <span key={t} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-content"><span className={`h-2 w-2 rounded-full ${hazardBg(t)}`} />{ROAD_EVENT_LABEL[t]}</span>)}</div></div><div className="mt-5 flex items-center justify-between"><h2 className="text-sm font-bold text-content">Reported hazards</h2><span className="inline-flex items-center gap-1 text-xs text-muted"><Icon name="Users" className="h-3.5 w-3.5" />Community-sourced</span></div>{error && <div role="alert" className="mt-3 rounded-xl bg-danger/10 p-3 text-xs text-danger ring-1 ring-inset ring-danger/25">Unable to refresh shared hazards. Showing the last available data.</div>}<div className="mt-2.5 space-y-2.5">{isLoading && <p className="text-sm text-muted">Loading hazards…</p>}{!isLoading && sorted.length === 0 && <p className="text-sm text-muted">No hazards reported yet.</p>}{sorted.map((ev) => <RoadEventCard key={ev.id} event={ev} onClick={() => open(ev.id)} />)}</div></div></div>; }
