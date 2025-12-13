export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full overflow-hidden" style={{ 
      marginLeft: "90px",
      marginRight: "90px",
    }}>
      {children}
    </div>
  )
} 