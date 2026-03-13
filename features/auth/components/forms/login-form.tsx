"use client";

//IMPORTS -----------------------------------------

//HOOKS
import { useState } from "react";
import { useLogin } from "../../api/use-login";
import { Controller, useForm } from "react-hook-form";

//FORMS UTILITIES
import { loginSchema } from "../../schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//COMPONENTS
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

//ICONS
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

//CODE OF THE COMPONENT -----------------------------------------

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof loginSchema>) {
    mutate({
      json: data,
    });
  }

  return (
    <div className="flex gap-4 h-screen w-screen">
      <div className="w-1/2 h-full flex items-center justify-center p-8">
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="form-login" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        disabled={isPending}
                        aria-invalid={fieldState.invalid}
                        placeholder="[EMAIL_ADDRESS]"
                        autoComplete="off"
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
                      <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          disabled={isPending}
                          aria-invalid={fieldState.invalid}
                          placeholder="Mot de passe"
                          autoComplete="off"
                        />
                        <div
                          className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer h-[70%] aspect-square flex items-center justify-center hover:bg-olive-950/10 rounded-sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <HugeiconsIcon
                              icon={ViewOffIcon}
                              size={10}
                              aria-label="Masquer le mot de passe"
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={ViewIcon}
                              size={10}
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
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal">
              <Button type="submit" form="form-login" disabled={isPending}>
                Se connecter
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
      <div className="w-1/2 h-full p-8">
        <div className="bg-olive-200 rounded-2xl w-full h-full flex items-center justify-center">
          TO IMPLEMENT
        </div>
      </div>
    </div>
  );
}
