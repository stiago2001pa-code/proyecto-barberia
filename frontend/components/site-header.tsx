"use client"

import { ArrowUpRight, LogOut, Scissors, ShieldAlert, Sparkles, UserCheck, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UsuarioAuth, VistaApp } from "@/lib/api"

interface SiteHeaderProps {
  mode: VistaApp
  user: UsuarioAuth | null
  onModeChange: (mode: VistaApp) => void
  onLogin: () => void
  onLogout: () => void
  onHome: () => void
  onBook: () => void
  apiSession?: boolean
}

export function SiteHeader({
  mode,
  user,
  onModeChange,
  onLogin,
  onLogout,
  onHome,
  onBook,
  apiSession = false,
}: SiteHeaderProps) {
  const roleLabel = user?.rol === "Administrador"
    ? "👑 Administrador"
    : user?.rol === "Barbero"
      ? "✂️ Barbero"
      : "👤 Cliente"

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={onHome}
          className="group flex shrink-0 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3"
          aria-label="Volver a Navaja"
        >
          <span className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 sm:size-10">
            <Scissors className="size-4 sm:size-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg tracking-[0.12em] text-foreground sm:text-xl">NAVAJA</span>
            <span className="mt-1.5 hidden text-[9px] font-medium tracking-[0.25em] text-muted-foreground sm:block">
              CAREPA & APARTADÓ
            </span>
          </span>
        </button>

        {/* Enlaces de navegación pública */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
          <a className="text-sm text-muted-foreground transition-colors hover:text-foreground" href="#barberias">
            Sedes
          </a>
          <a className="text-sm text-muted-foreground transition-colors hover:text-foreground" href="#servicios">
            Servicios
          </a>
          <a className="text-sm text-muted-foreground transition-colors hover:text-foreground" href="#equipo">
            Barberos
          </a>
        </nav>

        {/* Acciones de usuario según autenticación */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            /* USUARIO AUTENTICADO */
            <>
              <div className="hidden items-center gap-2 lg:flex">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-medium">
                  {roleLabel}
                </Badge>
                <span className="text-xs font-medium text-foreground max-w-[130px] truncate">
                  {user.nombre}
                </span>
              </div>

              {/* Botón para alternar entre el Panel que le corresponde y la vista pública */}
              {mode === "public" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-medium"
                  onClick={() => onModeChange(user.rol)}
                >
                  <Sparkles className="size-3.5 mr-1 text-primary" />
                  <span className="hidden sm:inline">
                    {user.rol === "Administrador" ? "Panel Administrador" : user.rol === "Barbero" ? "Mi Agenda" : "Mis Citas"}
                  </span>
                  <span className="sm:hidden">Mi Panel</span>
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={onHome}>
                  <span>Ver Web Pública</span>
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
              )}

              {/* Botón Cerrar Sesión */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline ml-1">Salir</span>
              </Button>
            </>
          ) : (
            /* USUARIO VISITANTE (NO AUTENTICADO) */
            <>
              <Button variant="ghost" size="sm" onClick={onLogin} className="text-foreground">
                <UserRound data-icon="inline-start" className="size-4" />
                Iniciar sesión
              </Button>
              <Button className="shrink-0 px-2.5 sm:px-3" size="sm" onClick={onBook}>
                <span className="hidden sm:inline">Reservar cita</span>
                <span className="sm:hidden">Reservar</span>
                <ArrowUpRight data-icon="inline-end" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Barra móvil inferior informativa */}
      <div className="flex items-center justify-between px-4 border-t border-white/5 py-1.5 md:hidden text-xs text-muted-foreground">
        {user ? (
          <>
            <span className="truncate">{roleLabel}: <strong className="text-foreground">{user.nombre}</strong></span>
            <button type="button" onClick={onLogout} className="text-destructive font-medium ml-2 shrink-0">
              Cerrar sesión
            </button>
          </>
        ) : (
          <div className="w-full text-center">
            <button type="button" onClick={onLogin} className="hover:text-foreground">
              ¿Ya tienes cuenta? <span className="text-primary font-medium underline">Inicia sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
