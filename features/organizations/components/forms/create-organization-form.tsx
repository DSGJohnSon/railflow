"use client";

//IMPORTS -----------------------------------------

//HOOKS
import { useCreateOrganization } from "../../api/use-create-organization";
import { Controller, useForm } from "react-hook-form";

//FORMS UTILITIES
import { createOrganizationSchema } from "../../schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//COMPONENTS
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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

export default function CreateOrganizationForm() {
  const { mutate, isPending } = useCreateOrganization();

  const form = useForm<z.infer<typeof createOrganizationSchema>>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  function onSubmit(data: z.infer<typeof createOrganizationSchema>) {
    mutate({
      json: data,
    });
  }

  return (
    <form id="form-create-organization" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nom de l'organisation</FieldLabel>
              <Input
                {...field}
                id="name"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                placeholder="Placeholder Inc."
                autoComplete="off"
                onChange={(e) => {
                  field.onChange(e);
                  form.setValue(
                    "slug",
                    e.target.value.toLowerCase().replace(/\s/g, "-"),
                  );
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="slug">Slug (Généré automatiquement)</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="slug"
                  value={field.value}
                  disabled={true}
                  aria-disabled
                  aria-invalid={fieldState.invalid}
                  placeholder="placeholder-inc"
                  autoComplete="off"
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="submit" form="form-create-organization" disabled={isPending}>
            Créer l'organisation
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
