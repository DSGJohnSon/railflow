import { getCurrent } from "@/features/auth/actions";
import RegisterForm from "@/features/auth/components/forms/register-form";
import Image from "next/image";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

async function Page({ searchParams }: PageProps) {
  const { redirectTo } = await searchParams;
  const user = await getCurrent();
  if (user) redirect(redirectTo ?? "/dashboard");

  return (
    <div className="w-screen h-screen">
      <div className="absolute top-4 left-4 w-[10svw]">
        <Image
          src="/logo/logo_line.svg"
          alt="Logo Railflow™"
          className="w-full h-full object-contain"
          width={1920}
          height={1080}
        />
      </div>
      <RegisterForm redirectTo={redirectTo} />
    </div>
  );
}

export default Page;
