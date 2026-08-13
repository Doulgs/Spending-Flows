"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryIcon } from "@/components/categories/category-icon";

const ICON_NAMES = [...iconNames].sort();

export function CategoryIconPicker({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const [search, setSearch] = useState("");
  const matches = useMemo(() => ICON_NAMES.filter((name) => name.toLowerCase().includes(search.toLowerCase())).slice(0, 96), [search]);
  return (
    <Popover>
      <PopoverTrigger asChild><Button type="button" variant="outline" className="h-11 w-full justify-start"><CategoryIcon name={value} className="mr-2 size-4 text-primary" />{value || "Escolher ícone"}</Button></PopoverTrigger>
      <PopoverContent align="start" className="w-[min(360px,calc(100vw-2rem))] p-3">
        <div className="relative mb-3"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar entre 1.700+ ícones..." className="pl-9" /></div>
        <ScrollArea className="h-64"><div className="grid grid-cols-6 gap-1.5 pr-3">{matches.map((name) => <button key={name} type="button" title={name} aria-label={`Ícone ${name}`} onClick={() => onChange(name)} className="flex aspect-square items-center justify-center rounded-lg border border-transparent text-text-muted hover:border-border hover:bg-surface-elevated hover:text-primary"><CategoryIcon name={name} className="size-4"/></button>)}</div>{matches.length === 0 && <p className="py-10 text-center text-xs text-text-muted">Nenhum ícone encontrado.</p>}</ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
