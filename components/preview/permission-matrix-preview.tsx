"use client"

import * as React from "react"

import {
  PermissionMatrix,
  type PermissionGrants,
  type PermissionGroup,
  type PermissionRole,
} from "@/registry/default/ui/permission-matrix"

const ROLES: PermissionRole[] = [
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access",
  },
  {
    id: "editor",
    name: "Editor",
    description: "Edit content and assets",
    inheritsFrom: "viewer",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Team and resource manager",
    inheritsFrom: "editor",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full control",
    inheritsFrom: "manager",
  },
]

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "projects",
    name: "Projects",
    description: "Workspace project access",
    permissions: [
      {
        id: "projects.view",
        name: "View Projects",
        description: "Browse and open projects",
      },
      {
        id: "projects.create",
        name: "Create Projects",
        description: "Initialize new projects",
      },
      {
        id: "projects.edit",
        name: "Edit Projects",
        description: "Modify project settings and tasks",
      },
      {
        id: "projects.delete",
        name: "Delete Projects",
        description: "Archive or permanently remove",
      },
    ],
  },
  {
    id: "team",
    name: "Team Members",
    description: "Member access and invites",
    permissions: [
      {
        id: "team.view",
        name: "View Members",
        description: "See list of workspace users",
      },
      {
        id: "team.invite",
        name: "Invite Members",
        description: "Send invitations to join",
      },
      {
        id: "team.manage",
        name: "Manage Roles",
        description: "Change member permissions",
      },
    ],
  },
  {
    id: "billing",
    name: "Billing & Plans",
    description: "Subscription and payments",
    permissions: [
      {
        id: "billing.view",
        name: "View Invoices",
        description: "Download billing statements",
      },
      {
        id: "billing.edit",
        name: "Change Plan",
        description: "Upgrade or modify payment card",
      },
    ],
  },
  {
    id: "settings",
    name: "Security & API",
    description: "Workspace configuration",
    permissions: [
      {
        id: "settings.api",
        name: "Manage API Keys",
        description: "Generate and rotate API secrets",
      },
      {
        id: "settings.audit",
        name: "Audit Logs",
        description: "Inspect access log history",
      },
    ],
  },
]

const INITIAL_GRANTS = {
  viewer: ["projects.view", "team.view"],
  editor: ["projects.create", "projects.edit"],
  manager: ["team.invite", "billing.view"],
  admin: [
    "projects.delete",
    "team.manage",
    "billing.edit",
    "settings.api",
    "settings.audit",
  ],
}

export function PermissionMatrixPreview() {
  const [grants, setGrants] = React.useState<PermissionGrants>(INITIAL_GRANTS)

  return (
    <div className="w-full max-w-4xl">
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSION_GROUPS}
        value={grants}
        onValueChange={setGrants}
      />
    </div>
  )
}
