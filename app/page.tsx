import TestToast from "@/components/test-toast";
import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/actions";
import LogoutButton from "@/features/auth/components/logout-button";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrent();

  return (
    <div className="flex min-h-screen items-center justify-center bg-olive-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-olive-50">
            Bienvenue {user?.name} !
          </h1>
          <p className="text-lg leading-8 text-olive-600 dark:text-olive-400">
            Vous êtes connecté.
          </p>
        </div>
        <TestToast />
        <div>{JSON.stringify(user)}</div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard">Accès au dashboard</Link>
          </Button>
          {user ? (
            <LogoutButton />
          ) : (
            <Button asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
