import { Tag } from "lucide-react";
import { DynamicIcon, dynamicIconImports, type IconName } from "lucide-react/dynamic";

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const normalized = normalizeIconName(name);
  if (!normalized) return <Tag className={className} aria-hidden="true" />;
  return <DynamicIcon name={normalized} fallback={() => <Tag className={className} aria-hidden="true" />} className={className} aria-hidden="true" />;
}

function normalizeIconName(name?: string | null): IconName | null {
  if (!name) return null;
  const kebabName = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
  return kebabName in dynamicIconImports ? kebabName as IconName : null;
}
