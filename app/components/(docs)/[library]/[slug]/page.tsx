import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ApiReference } from "@/components/docs/api-reference"
import { CodeFrame } from "@/components/docs/code-frame"
import { ComponentExamples } from "@/components/docs/component-examples"
import type { NavGroup } from "@/components/docs/component-nav-list"
import { ComponentHeader } from "@/components/docs/component-header"
import { DocSection } from "@/components/docs/doc-section"
import { DocsBar } from "@/components/docs/docs-bar"
import { InstallPanel } from "@/components/docs/install-panel"
import { KeyboardStrip } from "@/components/docs/keyboard-strip"
import { Pager } from "@/components/docs/pager"
import { PreviewStage } from "@/components/docs/preview-stage"
import { PreviewTabs } from "@/components/docs/preview-tabs"
import { SourceFiles } from "@/components/docs/source-files"
import { JsonLd } from "@/components/seo/json-ld"
import { COMPONENT_API } from "@/lib/agent-docs/component-api"
import { COMPONENT_USAGE } from "@/lib/agent-docs/component-usage"
import { toBaseUiItem } from "@/lib/base-ui-registry"
import { COMPONENT_KEYBOARD } from "@/lib/component-keyboard"
import {
  CATALOG,
  CATEGORIES,
  findCategory,
  findEntry,
  findNeighbors,
  type CatalogEntry,
} from "@/lib/catalog"
import {
  listInstallPaths,
  loadExamples,
  loadSources,
  loadUsage,
  loadUsageSnippet,
  resolveBuildsOn,
} from "@/lib/component-docs"
import { createPageMetadata } from "@/lib/page-metadata"
import {
  componentPath,
  isPrimitiveLibrary,
  PRIMITIVE_LIBRARIES,
  registryItemPath,
  type PrimitiveLibrary,
} from "@/lib/primitive-library"
import { siteConfig } from "@/lib/site-config"

const NAV_GROUPS: NavGroup[] = CATEGORIES.map((category) => ({
  id: category.id,
  label: category.label,
  entries: CATALOG.filter((entry) => entry.category === category.id).map(
    ({ slug, name }) => ({ slug, name })
  ),
}))

type ComponentPageProps = {
  params: Promise<{ library: string; slug: string }>
}

function buildComponentSchema(entry: CatalogEntry, library: PrimitiveLibrary) {
  const pageUrl = `${siteConfig.url}${componentPath(entry.slug, library)}`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Components",
            item: `${siteConfig.url}/components`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: entry.name,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        name: `${entry.name} for shadcn/ui`,
        description: entry.description,
        url: pageUrl,
        codeRepository: `${siteConfig.url}${registryItemPath(entry.slug, library)}`,
        programmingLanguage: ["TypeScript", "React"],
        runtimePlatform: "React",
        keywords: [
          "shadcn",
          findCategory(entry.category)?.label,
          entry.name,
        ].filter(Boolean),
        isPartOf: {
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
    ],
  }
}

export const dynamicParams = false

export function generateStaticParams() {
  return PRIMITIVE_LIBRARIES.flatMap(({ value }) =>
    CATALOG.map((entry) => ({ library: value, slug: entry.slug }))
  )
}

export async function generateMetadata({
  params,
}: ComponentPageProps): Promise<Metadata> {
  const { library, slug } = await params
  const entry = findEntry(slug)
  if (!entry || !isPrimitiveLibrary(library)) return {}

  const path = componentPath(entry.slug, library)

  return createPageMetadata({
    title: entry.name,
    description: `${entry.description} Install with npx shadcn@latest add @drift-ui/${entry.slug}.`,
    path,
    imageBasePath: path,
    imageAlt: `${entry.name}, a ${siteConfig.name} component for shadcn/ui`,
  })
}

export default async function ComponentPage({ params }: ComponentPageProps) {
  const { library, slug } = await params
  const entry = findEntry(slug)
  if (!entry || !isPrimitiveLibrary(library)) notFound()

  const source = library === "base" ? toBaseUiItem(entry) : entry
  const usageEntry = COMPONENT_USAGE[entry.slug]
  const usageExample =
    (library === "base" && usageEntry?.baseExample) || usageEntry?.example
  const [usage, sources, snippet, examples] = await Promise.all([
    loadUsage(entry, library),
    loadSources(source),
    usageExample && loadUsageSnippet(entry, usageExample),
    loadExamples(entry.slug, library),
  ])
  const api = COMPONENT_API[entry.slug]
  const keyboard = COMPONENT_KEYBOARD[entry.slug]
  const { previous, next } = findNeighbors(entry.slug)
  const sections = [
    { id: "installation", label: "Installation" },
    ...(snippet ? [{ id: "usage", label: "Usage" }] : []),
    ...(api ? [{ id: "api", label: "API reference" }] : []),
    ...(examples.length > 0
      ? [
          { id: "examples", label: "Examples" },
          ...examples.map(({ id, title }) => ({
            id,
            label: title,
            isNested: true,
          })),
        ]
      : []),
    { id: "source", label: "Source" },
  ]

  return (
    <main className="flex flex-col">
      <JsonLd schema={buildComponentSchema(entry, library)} />
      <DocsBar groups={NAV_GROUPS} sections={sections} />
      <div className="flex flex-col gap-16 pt-10 pb-24 lg:pt-12">
        <div className="grid gap-x-12 gap-y-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:gap-x-16">
          <div className="lg:col-start-2 lg:row-start-1">
            <ComponentHeader
              entry={entry}
              library={library}
              sourceUrl={`${siteConfig.repo}/blob/main/${source.files[0]?.path}`}
            />
          </div>
          <div className="flex flex-col gap-5 lg:sticky lg:top-36 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100dvh-10rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
            <PreviewTabs
              preview={<PreviewStage entry={entry} library={library} />}
              usage={usage}
            />
            {keyboard && <KeyboardStrip bindings={keyboard} />}
          </div>
          <div className="flex min-w-0 flex-col gap-16 lg:col-start-2">
            <DocSection id="installation" title="Installation">
              <InstallPanel
                slug={entry.slug}
                dependencies={source.dependencies}
                buildsOn={resolveBuildsOn(entry, library)}
                installPaths={listInstallPaths(source)}
              />
            </DocSection>
            {snippet && (
              <DocSection id="usage" title="Usage">
                <CodeFrame {...snippet} collapsible />
              </DocSection>
            )}
            {api && (
              <DocSection id="api" title="API reference">
                <ApiReference parts={api} />
              </DocSection>
            )}
          </div>
        </div>
        {examples.length > 0 && (
          <DocSection id="examples" title="Examples" className="border-t pt-16">
            <ComponentExamples examples={examples} />
          </DocSection>
        )}
        <DocSection id="source" title="Source">
          <SourceFiles files={sources} />
        </DocSection>
        <Pager previous={previous} next={next} library={library} />
      </div>
    </main>
  )
}
