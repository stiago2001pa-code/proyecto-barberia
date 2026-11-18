import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface MetricCardProps {
  label: string
  value: string | number
  detail: string
  icon: LucideIcon
}

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <Card className="gap-0 border-white/8 bg-card/65 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl tabular-nums text-foreground">{value}</p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
