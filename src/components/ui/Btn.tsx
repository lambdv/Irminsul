import Link from 'next/link'
import ButtonCSS from './button.module.css'

export default function Btn(props: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  href?: string
  type?: "button" | "submit" | "reset"
  style?: React.CSSProperties
}) {

  return (
    <button className={`${ButtonCSS.btn} waves-effect waves-light ripple ${props.className} flex`} onClick={props.onClick} type={props.type} style={props.style}>
      <div>
        {props.children}
      </div>
    </button>
  )
}
