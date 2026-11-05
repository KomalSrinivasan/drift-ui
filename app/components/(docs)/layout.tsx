export default function ComponentDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-10">
      {children}
    </div>
  )
}
