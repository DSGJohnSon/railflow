"use client";

//IMPORTS -----------------------------------------

//HOOKS
import { useCreateProject } from "../../api/use-create-project";
import { useGetOrganizationSlug } from "@/features/organizations/hooks/use-organization-slug";

//FORMS UTILITIES
import { Controller, useForm } from "react-hook-form";
import { createProjectSchema } from "../../schemas";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

//CODE OF THE COMPONENT -----------------------------------------

export default function CreateProjectForm() {
  const organizationSlug = useGetOrganizationSlug();
  const { mutate, isPending } = useCreateProject(organizationSlug!);

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof createProjectSchema>) {
    mutate({
      json: data,
      param: {
        organizationSlug: organizationSlug!,
      },
    });
  }

  return (
    <form id="form-create-project" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nom du projet</FieldLabel>
              <Input
                {...field}
                id="name"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                placeholder="Mon super projet"
                autoComplete="off"
                onChange={(e) => {
                  field.onChange(e);
                  form.setValue(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-") // remplace tout groupe non alphanumérique par -
                      .replace(/^-+|-+$/g, ""), // supprime les - au début et à la fin
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
              <FieldLabel htmlFor="slug">
                Slug (Généré automatiquement)
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="slug"
                  value={field.value}
                  disabled={true}
                  aria-disabled
                  aria-invalid={fieldState.invalid}
                  placeholder="mon-super-projet"
                  autoComplete="off"
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                {...field}
                id="description"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                placeholder="Description du projet"
                maxLength={500}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <FieldDescription>
                {field.value ? field.value.length : 0}/500
              </FieldDescription>
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="submit" form="form-create-project" disabled={isPending}>
            Créer le projet
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
