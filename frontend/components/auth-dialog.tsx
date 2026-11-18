"use client"

import { useState } from "react"
import { ArrowRight, KeyRound, Lock, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { FormInput } from "@/components/form-controls"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (credentials: { correo: string; password: string }) => Promise<void>
  onRegister: (details: { nombre: string; correo: string; telefono: string; password: string }) => Promise<void>
}

export function AuthDialog({
  open,
  onOpenChange,
  onLogin,
  onRegister,
}: AuthDialogProps) {
  const [loginForm, setLoginForm] = useState({ correo: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ nombre: "", correo: "", telefono: "", password: "" })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      await onLogin(loginForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas. Verifica tu correo y contraseña.")
    } finally {
      setPending(false)
    }
  }

  async function submitRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      await onRegister(registerForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible crear la cuenta.")
    } finally {
      setPending(false)
    }
  }

  function fillCredentials(correo: string, pass: string) {
    setLoginForm({ correo, password: pass })
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <p className="text-[10px] font-semibold tracking-[0.22em] text-primary uppercase">
              Acceso Seguro al Sistema
            </p>
          </div>
          <DialogTitle className="font-display text-2xl">Identifícate</DialogTitle>
          <DialogDescription>
            Inicia sesión con tu correo y contraseña. Tu rol determinará los permisos y secciones a las que puedes acceder.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="gap-5">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Crear cuenta (Cliente)</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="flex flex-col gap-5">
            <form onSubmit={submitLogin} className="flex flex-col gap-4">
              <FieldGroup className="gap-4">
                <FormInput
                  id="login-email"
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@barberia.com"
                  required
                  value={loginForm.correo}
                  onChange={(event) => setLoginForm((current) => ({ ...current, correo: event.target.value }))}
                />
                <FormInput
                  id="login-password"
                  label="Contraseña"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                />
              </FieldGroup>

              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Autenticando..." : "Ingresar a mi cuenta"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>

            {/* Guía rápida de credenciales configuradas */}
            <div className="rounded-xl border border-white/8 bg-card/60 p-3.5 text-xs">
              <p className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
                <KeyRound className="size-3.5 text-primary" />
                Cuentas por rol configuradas:
              </p>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin@barberia.com", "admin123")}
                  className="rounded-lg border border-white/10 bg-background/50 p-2 text-left hover:border-primary/50 transition-colors"
                >
                  <span className="font-semibold block text-primary">👑 Admin</span>
                  <span className="text-muted-foreground block truncate">admin@barberia.com</span>
                  <span className="text-[10px] text-muted-foreground">Pass: admin123</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("barbero@barberia.com", "barbero123")}
                  className="rounded-lg border border-white/10 bg-background/50 p-2 text-left hover:border-primary/50 transition-colors"
                >
                  <span className="font-semibold block text-primary">✂️ Barbero</span>
                  <span className="text-muted-foreground block truncate">barbero@barberia.com</span>
                  <span className="text-[10px] text-muted-foreground">Pass: barbero123</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("cliente@barberia.com", "cliente123")}
                  className="rounded-lg border border-white/10 bg-background/50 p-2 text-left hover:border-primary/50 transition-colors"
                >
                  <span className="font-semibold block text-primary">👤 Cliente</span>
                  <span className="text-muted-foreground block truncate">cliente@barberia.com</span>
                  <span className="text-[10px] text-muted-foreground">Pass: cliente123</span>
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="register" className="flex flex-col gap-4">
            <form onSubmit={submitRegister} className="flex flex-col gap-4">
              <FieldGroup className="gap-4">
                <FormInput
                  id="register-name"
                  label="Nombre completo"
                  autoComplete="name"
                  placeholder="Tu nombre y apellido"
                  required
                  value={registerForm.nombre}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, nombre: event.target.value }))}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="register-email"
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    required
                    value={registerForm.correo}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, correo: event.target.value }))}
                  />
                  <FormInput
                    id="register-phone"
                    label="Teléfono"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+57 300 000 0000"
                    required
                    value={registerForm.telefono}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, telefono: event.target.value }))}
                  />
                </div>
                <FormInput
                  id="register-password"
                  label="Contraseña"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                />
              </FieldGroup>
              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {error}
                </div>
              ) : null}
              <p className="text-xs leading-5 text-muted-foreground">
                El registro público crea una cuenta protegida con rol de <strong>Cliente</strong> para reservar y ver tus citas.
              </p>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creando cuenta..." : "Completar Registro"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
