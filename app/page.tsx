import TestToast from "@/components/test-toast";
import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/actions";
import LogoutButton from "@/features/auth/components/logout-button";
import { redirect } from "next/navigation";
import { toast } from "sonner";


export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Bienvenue {user.name} !
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Vous êtes connecté.
          </p>
        </div>
        <TestToast />
        <div>
          {JSON.stringify(user)}
        </div>
        <div>
          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
