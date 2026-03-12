import { getCurrent } from "@/features/auth/actions";
import { RegisterForm } from "@/features/auth/components/forms/register-form";
import { redirect } from "next/navigation";

async function Page() {
  const user = await getCurrent();
  if (user) redirect("/workspaces/hello");

  return <RegisterForm />;
}

export default Page;
