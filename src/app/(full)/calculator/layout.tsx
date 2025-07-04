export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ }}>
      {children}
    </div>
  )
} 