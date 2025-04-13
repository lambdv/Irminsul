import RightSidenavCSS from '@/components/navigation/rightsidenav.module.css'

export default function RightSidenav(props: {
  children: React.ReactNode, 
  className?: string
  style?: React.CSSProperties
}) {
  return (
      <nav className={`${RightSidenavCSS.rightsidenav} ${props.className}`} style={props.style}>
        {props.children}
      </nav>
  )
}