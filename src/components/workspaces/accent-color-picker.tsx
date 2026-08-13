"use client";

import { Check, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACCENT_COLOR_PRESETS, isValidAccentColor, normalizeAccentColor } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AccentColorPicker({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const normalized = normalizeAccentColor(value);
  const valid = isValidAccentColor(value);

  return <div className="space-y-3">
    <div className="flex items-center justify-between"><div><Label>Cor de destaque</Label><p className="mt-1 text-xs text-text-muted">Personaliza ações, foco e navegação deste workspace.</p></div><Palette className="h-4 w-4 text-text-muted" /></div>
    <div className="flex flex-wrap gap-2.5" aria-label="Cores sugeridas">{ACCENT_COLOR_PRESETS.map((color) => {
      const selected = normalized === color.value;
      return <button key={color.value} type="button" title={color.name} aria-label={color.name} aria-pressed={selected} disabled={disabled} onClick={() => onChange(color.value)} className={cn("flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50", selected ? "border-text-primary" : "border-transparent")} style={{ backgroundColor: color.value }}>{selected && <Check className="h-4 w-4 text-white drop-shadow" />}</button>;
    })}</div>
    <div className="grid grid-cols-[48px_1fr] gap-3">
      <label className="relative flex h-11 cursor-pointer overflow-hidden rounded-xl border border-border" title="Escolher uma cor personalizada"><input type="color" className="absolute -inset-2 h-16 w-16 cursor-pointer border-0 bg-transparent" value={normalized} disabled={disabled} onChange={(event) => onChange(event.target.value.toUpperCase())} /><span className="sr-only">Escolher cor personalizada</span></label>
      <Input value={value} disabled={disabled} maxLength={7} aria-invalid={!valid} onChange={(event) => onChange(event.target.value.toUpperCase())} placeholder="#8B5CF6" className="font-mono uppercase" />
    </div>
    {!valid && <p className="text-xs text-destructive">Use o formato hexadecimal completo, por exemplo #8B5CF6.</p>}
  </div>;
}
