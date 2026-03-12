import { getCurrent } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import SelectOrganizations from "@/features/organizations/components/select-organization";

async function Page() {
  const user = await getCurrent();
  if (!user) redirect("/login");

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-4">
      <div className="flex flex-col items-center gap-1">
        <h1 className="font-medium text-xl">Organisations</h1>
        <p className="text-sm text-center">Sélectionner une organisation</p>
      </div>
      <div>
        <SelectOrganizations userId={user.id} />
      </div>
    </div>
  );
}

export default Page;
