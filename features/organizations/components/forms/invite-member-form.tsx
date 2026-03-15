"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { inviteMemberSchema, INVITATION_EXPIRY_OPTIONS } from "../../schemas";
import { useInviteMember } from "../../api/use-invite-member";
import { useGetOrganizationSlug } from "../../hooks/use-organization-slug";
import { useInviteMemberModal } from "../../hooks/use-invite-member-modal";

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

export default function InviteMemberForm() {
  const organizationSlug = useGetOrganizationSlug();
  const { mutate, isPending } = useInviteMember();
  const { close } = useInviteMemberModal();

  const form = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
      expiresInHours: 24,
    },
  });

  function onSubmit(data: z.infer<typeof inviteMemberSchema>) {
    mutate(
      { organizationSlug, json: data },
      { onSuccess: () => { form.reset(); close(); } },
    );
  }

  return (
    <form id="form-invite-member" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="invite-email">Adresse email</FieldLabel>
              <Input
                {...field}
                id="invite-email"
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
                  <SelectItem value="MEMBER">Membre</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
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
            form="form-invite-member"
            disabled={isPending}
          >
            Envoyer l&apos;invitation
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
