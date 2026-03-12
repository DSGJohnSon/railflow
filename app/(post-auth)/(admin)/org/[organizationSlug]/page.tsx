import { getCurrent } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import OrganizationSelected from "./organization-selected";

async function Page() {
  const user = await getCurrent();
  if (!user) return redirect("/login");

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-4">
      <OrganizationSelected userId={user.id} />
    </div>
  );
}

export default Page;
