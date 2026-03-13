import MyOrganizationList from "@/features/organizations/components/my-organization-list";
import MyProjectsList from "@/features/projects/components/my-projects-list";

async function Page() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Vos organisations</h2>
        <p className="text-muted-foreground">Voici les organisations dont vous êtes membre</p>
        <MyOrganizationList />
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Vos projets</h2>
        <p className="text-muted-foreground">Voici les projets dont vous êtes membre</p>
        <MyProjectsList />
      </div>
    </>
  );
}

export default Page;
