import { getCurrent } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/components/forms/new-login-form";
import { div } from "motion/react-client";
import { redirect } from "next/navigation";

async function Page() {
  const user = await getCurrent();
  if (user) redirect("/workspaces/hello");

  return (
    <div className="w-screen h-screen">
      <LoginForm />
    </div>
  );
}

export default Page;
