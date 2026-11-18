import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { RolUsuario } from "@/lib/api"

export interface DashboardNavItem {
  value: string
  label: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  role: RolUsuario
  name: string
  nav: DashboardNavItem[]
  active: string
  onNavigate: (value: string) => void
  title: string
  description: string
  headerAction?: ReactNode
  children: ReactNode
}

const roleCopy: Record<RolUsuario, string> = {
  Administrador: "CENTRO DE CONTROL",
  Barbero: "ESPACIO DEL BARBERO",
  Cliente: "TU ESPACIO NAVAJA",
}

export function DashboardLayout({
  role,
  name,
  nav,
  active,
  onNavigate,
  title,
  description,
  headerAction,
  children,
}: DashboardLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="grid gap-7 lg:grid-cols-[228px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="gap-5 border-white/8 bg-card/75 p-4 shadow-none sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/12 font-display text-lg text-primary">
                {name.trim().charAt(0).toUpperCase() || "N"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                <Badge variant="outline" className="mt-1 border-primary/20 bg-primary/5 text-[10px] font-medium text-primary">
                  {role}
                </Badge>
              </div>
            </div>

            <div className="h-px bg-white/8" aria-hidden="true" />

            <nav aria-label={`Navegación de ${role}`} className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
              {nav.map((item) => {
                const selected = active === item.value
                return (
                  <Button
                    key={item.value}
                    type="button"
                    variant={selected ? "secondary" : "ghost"}
                    size="sm"
                    className={`w-full justify-start text-left ${selected ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground"}`}
                    aria-current={selected ? "page" : undefined}
                    onClick={() => onNavigate(item.value)}
                  >
                    <item.icon data-icon="inline-start" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                )
              })}
            </nav>

            <div className="hidden rounded-xl border border-white/8 bg-background/45 p-3 lg:block">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">{roleCopy[role]}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Tus datos de demostración están listos. La capa API apunta a <span className="font-mono text-foreground/80">localhost:3000</span>.
              </p>
            </div>
          </Card>
        </aside>

        <section className="min-w-0">
          <div className="mb-7 flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-primary">{roleCopy[role]}</p>
              <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
            {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
          </div>
          {children}
        </section>
      </div>
    </main>
  )
}
