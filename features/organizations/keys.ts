export const organizationKeys = {
  all: ["organizations"],
  me: ["organizations", "me"],
  members: (slug: string) => ["organizations", slug, "members"],
  invitations: (slug: string) => ["organizations", slug, "invitations"],
}