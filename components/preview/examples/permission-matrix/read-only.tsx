"use client"

import * as React from "react"

import {
  PermissionMatrix,
  type PermissionGrants,
  type PermissionGroup,
  type PermissionRole,
} from "@/registry/default/ui/permission-matrix"

const ROLES: PermissionRole[] = [
  { id: "guest", name: "Guest" },
  { id: "member", name: "Member", inheritsFrom: "guest" },
  { id: "owner", name: "Owner", inheritsFrom: "member" },
]

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "repos",
    name: "Repositories",
    permissions: [
      { id: "repo.read", name: "Clone & Read" },
      { id: "repo.push", name: "Push Branches" },
      { id: "repo.admin", name: "Delete Repository" },
    ],
  },
  {
    id: "issues",
    name: "Issues",
    permissions: [
      { id: "issue.create", name: "Create Issues" },
      { id: "issue.close", name: "Close Issues" },
    ],
  },
]

const GRANTS: PermissionGrants = {
  guest: ["repo.read", "issue.create"],
  member: ["repo.push", "issue.close"],
  owner: ["repo.admin"],
}

export function PermissionMatrixReadOnlyPreview() {
  return (
    <div className="w-full max-w-3xl">
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSION_GROUPS}
        value={GRANTS}
        readOnly
      />
    </div>
  )
}
