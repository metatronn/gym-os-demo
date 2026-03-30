export const ORG_ROLES = ["org:admin", "org:coach", "org:staff"] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  "org:admin": "Admin",
  "org:coach": "Coach",
  "org:staff": "Staff",
};

export function isOrgRole(value: string): value is OrgRole {
  return ORG_ROLES.includes(value as OrgRole);
}
