"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { inviteProjectMemberSchema, INVITATION_EXPIRY_OPTIONS } from "../../schemas";
import { useInviteProjectMember } from "../../api/use-invite-project-member";
import { useGetOrganizationSlug } from "@/features/organizations/hooks/use-organization-slug";
import { useGetProjectSlug } from "../../hooks/use-project-slug";
import { useInviteProjectMemberModal } from "../../hooks/use-invite-project-member-modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InviteProjectMemberForm() {
  const organizationSlug = useGetOrganizationSlug();
  const projectSlug = useGetProjectSlug();
  const { mutate, isPending } = useInviteProjectMember();
  const { close } = useInviteProjectMemberModal();

  const form = useForm<z.infer<typeof inviteProjectMemberSchema>>({
    resolver: zodResolver(inviteProjectMemberSchema),
    defaultValues: {
      email: "",
      role: "COLLABORATOR",
      expiresInHours: 24,
    },
  });

  function onSubmit(data: z.infer<typeof inviteProjectMemberSchema>) {
    mutate(
      { organizationSlug, projectSlug, json: data },
      { onSuccess: () => { form.reset(); close(); } },
    );
  }

  return (
    <form id="form-invite-project-member" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="invite-project-email">Adresse email</FieldLabel>
              <Input
                {...field}
                id="invite-project-email"
                type="email"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                placeholder="membre@example.com"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Rôle</FieldLabel>
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLLABORATOR">Collaborateur</SelectItem>
                  <SelectItem value="VISITOR">Visiteur</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="expiresInHours"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Expiration du lien</FieldLabel>
              <Select
                disabled={isPending}
                onValueChange={(v) => field.onChange(Number(v))}
                defaultValue={String(field.value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une durée" />
                </SelectTrigger>
                <SelectContent>
                  {INVITATION_EXPIRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-invite-project-member"
            disabled={isPending}
          >
            Envoyer l&apos;invitation
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
