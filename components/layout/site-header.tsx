"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Loading03Icon,
  PlazaIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { useCreateOrganizationModal } from "@/features/organizations/hooks/use-create-organization-modal";
import { useGetMyOrganizations } from "@/features/organizations/api/use-get-user-organizations";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 w-full rounded-t-lg bg-white border border-olive-100 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2" />
        <CustomBreadcrumb />
      </div>
    </header>
  );
}

function CustomBreadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: organizations, isLoading: isLoadingOrganizations } =
    useGetMyOrganizations();

  const { setIsOpen: setIsOpenCreateOrganizationModal } =
    useCreateOrganizationModal();

  //PAGE DASHBOARD
  if (pathname === "/dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  //CAS DE LA VUE ADMIN
  if (pathname.split("/")[1] === "org" && pathname.split("/").length >= 3) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              {isLoadingOrganizations ? (
                <DropdownMenuTrigger className="pointer-events-none" asChild>
                  <button className="flex items-center gap-1 hover:bg-olive-50 px-2 py-1 rounded-md cursor-pointer">
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={14}
                      className="animate-spin"
                    />
                    Chargement...
                  </button>
                </DropdownMenuTrigger>
              ) : (
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 hover:bg-olive-50 px-2 py-1 rounded-md cursor-pointer">
                    <HugeiconsIcon icon={PlazaIcon} size={14} />
                    {pathname.split("/")[2]}
                    <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                  </button>
                </DropdownMenuTrigger>
              )}
              <DropdownMenuContent align="start" className="w-full">
                <DropdownMenuLabel className="font-semibold text-olive-950">
                  Mes organisations
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Administrateur (
                    {
                      organizations?.data.filter((org: { role: string }) => org.role === "OWNER")
                        .length
                    }
                    )
                  </DropdownMenuLabel>
                  {organizations?.data
                    .filter((org: { role: string }) => org.role === "OWNER")
                    .map((org: { id: string; slug: string; name: string }) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => {
                          router.push(`/org/${org.slug}`);
                        }}
                        className="hover:bg-olive-50 cursor-pointer"
                      >
                        <HugeiconsIcon icon={PlazaIcon} size={14} />
                        {org.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Membre (
                    {
                      organizations?.data.filter((org: { role: string }) => org.role !== "OWNER")
                        .length
                    }
                    )
                  </DropdownMenuLabel>
                  {organizations?.data
                    .filter((org: { role: string }) => org.role !== "OWNER")
                    .map((org: { id: string; slug: string; name: string }) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => {
                          router.push(`/org/${org.slug}`);
                        }}
                        className="hover:bg-olive-50 cursor-pointer"
                      >
                        <HugeiconsIcon icon={PlazaIcon} size={14} />
                        {org.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpenCreateOrganizationModal(true);
                    }}
                    className="hover:bg-olive-50 cursor-pointer"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={14} />
                    Créer une organisation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return <>BREADCRUMB PAS ENCORE GÉRÉ</>;
}
