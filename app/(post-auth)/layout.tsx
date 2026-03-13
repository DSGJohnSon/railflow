import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrent } from "@/features/auth/actions";
import Modals from "@/components/layout/modals";
import type { SidebarUser } from "@/components/layout/sidebar/types";
import { redirect } from "next/navigation";

interface PostAuthLayoutProps {
  children: React.ReactNode;
}

async function PostAuthLayout({ children }: PostAuthLayoutProps) {
  const user = await getCurrent();
  if (!user) return redirect("/login");

  const sidebarUser: SidebarUser = {
    name: user.name,
    email: user.email,
    image: user.image,
  };

  return (
    <>
      <Modals />
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={sidebarUser} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default PostAuthLayout;
