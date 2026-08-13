import Image from "next/image";
import { Loader2 } from "lucide-react";

export function PageLoading({ label = "Carregando seus dados..." }: { label?: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background" role="status" aria-label={label}>
      <div className="flex flex-col items-center gap-4">
        <Image src="/favicon/apple-touch-icon.png" width={48} height={48} alt="" className="rounded-xl" priority />
        <Loader2 className="size-5 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </main>
  );
}
