import RightSidenavCSS from '@/components/navigation/rightsidenav.module.css'

export default function RightSidenav(props) {
  return (
      <nav className={`${RightSidenavCSS.rightsidenav} ${props.className}`} >
        {props.children}
      </nav>
  )
}