export const projectKeys = {
  all: ["projects"],
  me: ["projects", "me"],
  members: (orgSlug: string, projectSlug: string) => ["projects", orgSlug, projectSlug, "members"],
  availableMembers: (orgSlug: string, projectSlug: string) => ["projects", orgSlug, projectSlug, "members", "available"],
  invitations: (orgSlug: string, projectSlug: string) => ["projects", orgSlug, projectSlug, "invitations"],
}