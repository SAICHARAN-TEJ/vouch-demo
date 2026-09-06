import { Badge } from "@/components/ui/Badge";
import { contextTagLabel } from "@/config/labels";

/** Renders machine context tags (e.g. "pothole_detected") as labelled chips. */
export function ContextTags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <Badge key={t} tone="primary">
          {contextTagLabel(t)}
        </Badge>
      ))}
    </div>
  );
}
