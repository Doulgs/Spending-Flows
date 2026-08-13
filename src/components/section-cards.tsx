import { ArrowDownRight, ArrowUpRight, Landmark, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SectionCards({ balance, income, expense, net }: { balance: number; income: number; expense: number; net: number }) {
  const cards = [
    { label: "Saldo total", value: balance, caption: "Patrimônio nas contas", icon: Landmark, tone: "text-primary", badge: "Consolidado" },
    { label: "Receitas", value: income, caption: "Entradas no período", icon: ArrowUpRight, tone: "text-emerald-400", badge: "Fluxo positivo" },
    { label: "Despesas", value: expense, caption: "Saídas no período", icon: ArrowDownRight, tone: "text-rose-400", badge: "Monitorar" },
    { label: "Resultado líquido", value: net, caption: net >= 0 ? "Operação saudável" : "Atenção ao caixa", icon: Scale, tone: net >= 0 ? "text-emerald-400" : "text-rose-400", badge: net >= 0 ? "Positivo" : "Negativo" },
  ];
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, caption, icon: Icon, tone, badge }, index) => <Card key={label} className="premium-card group relative overflow-hidden border-white/[0.075] bg-card shadow-none animate-fade-up" style={{ animationDelay: `${index * 55}ms` }}><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"/><CardHeader className="relative"><div className="flex items-center justify-between"><CardDescription>{label}</CardDescription><div className="flex size-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035]"><Icon className={`size-3.5 ${tone}`}/></div></div><CardTitle className="pt-2 text-2xl font-semibold tracking-[-.035em] tabular-nums @[250px]/card:text-3xl">{formatCurrency(value)}</CardTitle></CardHeader><CardFooter className="flex items-end justify-between gap-2"><p className="text-xs text-muted-foreground">{caption}</p><Badge variant="outline" className="shrink-0 border-white/[0.08] bg-white/[0.025] text-[9px] font-medium text-muted-foreground">{badge}</Badge></CardFooter></Card>)}</div>;
}
