export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const

export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

export function isPackageManager(value: unknown): value is PackageManager {
  return PACKAGE_MANAGERS.includes(value as PackageManager)
}

export function shadcnCommand(packageManager: PackageManager, args: string) {
  switch (packageManager) {
    case "pnpm":
      return `pnpm dlx shadcn@latest ${args}`
    case "yarn":
      return `yarn dlx shadcn@latest ${args}`
    case "bun":
      return `bunx --bun shadcn@latest ${args}`
    case "npm":
      return `npx shadcn@latest ${args}`
  }
}

export function shadcnAddCommand(packageManager: PackageManager, slug: string) {
  return shadcnCommand(packageManager, `add @drift-ui/${slug}`)
}

export function dependencyInstallCommand(
  packageManager: PackageManager,
  dependencies: string[]
) {
  const list = dependencies.join(" ")

  switch (packageManager) {
    case "pnpm":
      return `pnpm add ${list}`
    case "yarn":
      return `yarn add ${list}`
    case "bun":
      return `bun add ${list}`
    case "npm":
      return `npm install ${list}`
  }
}
