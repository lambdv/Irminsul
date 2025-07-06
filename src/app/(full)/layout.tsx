export default async function RootLayout({children}) {
  return (
    <div className="minimalPageContentWrapper">
        {children}
    </div>
  )
}