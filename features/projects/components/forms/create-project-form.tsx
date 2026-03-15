"use client";

//IMPORTS -----------------------------------------

//HOOKS
import { useState } from "react";
import { useCreateProject } from "../../api/use-create-project";
import { useGetOrganizationSlug } from "@/features/organizations/hooks/use-organization-slug";
import { useGetOrganizationMembers } from "@/features/organizations/api/use-get-organization-members";
import { useCurrent } from "@/features/auth/api/use-current";

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
import { OrgMemberSelector, type OrgMemberSelection, type LockedMember } from "../org-member-selector";

//CODE OF THE COMPONENT -----------------------------------------

export default function CreateProjectForm() {
  const organizationSlug = useGetOrganizationSlug();
  const { mutate, isPending } = useCreateProject(organizationSlug!);
  const { data: orgMembers = [] } = useGetOrganizationMembers(organizationSlug!);
  const { data: currentUser } = useCurrent();

  // Local state for full OrgMemberSelection objects (display + interaction)
  const [selectedMembers, setSelectedMembers] = useState<OrgMemberSelection[]>([]);

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      initialMembers: [],
    },
  });

  const ownerMember = orgMembers.find((m) => m.role === "OWNER");
  const isCurrentUserOwner = ownerMember?.user.id === currentUser?.id;

  // Members available for optional selection: exclude current user and the owner
  const selectableMembers = orgMembers.filter(
    (m) => m.user.id !== currentUser?.id && m.role !== "OWNER",
  );

  // Owner shown as a locked (non-removable) entry — only if current user is not the owner
  const lockedMembers: LockedMember[] =
    !isCurrentUserOwner && ownerMember
      ? [
          {
            userId: ownerMember.user.id,
            name: ownerMember.user.name,
            email: ownerMember.user.email,
            image: ownerMember.user.image,
            label: "Directeur de l'agence — ajouté automatiquement",
          },
        ]
      : [];

  function onSubmit(data: z.infer<typeof createProjectSchema>) {
    mutate({
      json: data,
      param: { organizationSlug: organizationSlug! },
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
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
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

        {(selectableMembers.length > 0 || lockedMembers.length > 0) && (
          <Field>
            <FieldLabel>Membres du projet</FieldLabel>
            <FieldDescription>
              Le directeur de l&apos;agence est ajouté automatiquement. Vous pouvez également ajouter d&apos;autres membres (Collaborateur ou Visiteur).
            </FieldDescription>
            <Controller
              name="initialMembers"
              control={form.control}
              render={({ field }) => (
                <OrgMemberSelector
                  availableMembers={selectableMembers}
                  value={selectedMembers}
                  onChange={(selected) => {
                    setSelectedMembers(selected);
                    field.onChange(
                      selected.map((m) => ({
                        userId: m.userId,
                        role: m.role,
                        notifyByEmail: m.notifyByEmail,
                      })),
                    );
                  }}
                  lockedMembers={lockedMembers}
                />
              )}
            />
          </Field>
        )}

        <Field orientation="horizontal">
          <Button type="submit" form="form-create-project" disabled={isPending}>
            Créer le projet
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
