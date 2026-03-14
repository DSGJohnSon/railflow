"use client";

//IMPORTS -----------------------------------------

//HOOKS
import { useEffect, useState } from "react";
import { useRegister } from "../../api/use-register";

//FORMS UTILITIES
import { registerSchema } from "../../schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

//COMPONENTS
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

//ICONS
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { OAuthButtons } from "../oauth-buttons";

//CODE OF THE COMPONENT -----------------------------------------

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPendingOAuth, setIsPendingOAuth] = useState(false);

  const [lastUsed, setLastUsed] = useState<
    "email" | "google" | "github" | null
  >(null);

  useEffect(() => {
    const val = localStorage.getItem("railflow_last_used_auth") as
      | "email"
      | "google"
      | "github"
      | null;
    if (val) {
      setTimeout(() => setLastUsed(val), 0);
    }
  }, []);

  const { mutate, isPending } = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof registerSchema>) {
    mutate({
      json: data,
    });
  }

  return (
    <div className="flex gap-4 h-screen w-screen">
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-bold text-center">
              Créez votre compte
            </h1>
            <p className="text-base text-muted-foreground text-center">
              Créez votre compte pour accéder à votre espace.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-center my-4 mb-10"
            >
              Vous avez déjà un compte ?{" "}
              <span className="text-lime-600 underline underline-offset-2">
                Connectez-vous
              </span>
            </Link>
          </div>
          <form
            id="form-login"
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "w-full space-y-4 rounded-xl transition-all duration-300 relative",
            )}
          >
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name" className="text-base">
                    Nom
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    disabled={isPending || isPendingOAuth}
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="off"
                    className="md:text-base/relaxed font-normal  placeholder:text-base h-auto w-full px-4 py-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className="text-base">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    disabled={isPending || isPendingOAuth}
                    aria-invalid={fieldState.invalid}
                    placeholder="example@railflow.co"
                    autoComplete="off"
                    className="md:text-base/relaxed font-normal  placeholder:text-base h-auto w-full px-4 py-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password" className="text-base">
                    Mot de passe
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      disabled={isPending || isPendingOAuth}
                      aria-invalid={fieldState.invalid}
                      placeholder="Mot de passe"
                      autoComplete="off"
                      className="md:text-base/relaxed font-normal  placeholder:text-base h-auto w-full px-4 py-2"
                    />
                    <div
                      className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer h-[70%] aspect-square flex items-center justify-center hover:bg-olive-950/10 rounded-sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <HugeiconsIcon
                          icon={ViewOffIcon}
                          size={14}
                          aria-label="Masquer le mot de passe"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={ViewIcon}
                          size={14}
                          aria-label="Afficher le mot de passe"
                        />
                      )}
                    </div>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </form>
          <Field orientation="horizontal">
            <Button
              type="submit"
              form="form-login"
              disabled={isPending || isPendingOAuth}
              variant="default"
              className="h-auto w-full py-3 text-base my-4 mt-6 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              S&apos;inscrire
            </Button>
          </Field>
          <div>
            <OAuthButtons isPendingAuth={isPending || isPendingOAuth} setIsPendingAuth={setIsPendingOAuth} lastUsed={lastUsed} />
          </div>
        </div>
      </div>

      <div className="h-full p-4">
        <div className="bg-olive-200 rounded-2xl h-full flex items-center justify-center aspect-[1/1.125] overflow-hidden">
          <Image
            src="/placeholders/auth-placeholder_upscaled.png"
            alt="Placeholder"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
