import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/actions";

export default async function NotFound() {
  const user = await getCurrent();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.06),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(244,244,245,1)_100%)] px-6 py-16">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(24,24,27,0.03)_0%,_transparent_35%,_rgba(24,24,27,0.05)_100%)]" />

      <section className="relative w-full max-w-2xl rounded-3xl border border-border/70 bg-background/95 p-8 shadow-2xl shadow-black/5 backdrop-blur sm:p-12">
        <div className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Erreur 404
        </div>

        <div className="mt-6 space-y-4">
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Cette page est introuvable.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Le lien que vous avez suivi est peut-être expiré, incomplet ou
            simplement incorrect. Vous pouvez repartir de l&apos;accueil, et si
            vous êtes connecté, revenir directement à votre dashboard.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          {user ? (
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Retour au dashboard</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
