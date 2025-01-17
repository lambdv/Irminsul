import Link from 'next/link'
import ButtonCSS from './button.module.css'

export default function Btn(props: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  href?: string
}) {

  return (
    <button className={`${ButtonCSS.btn} waves-effect waves-light ripple ${props.className}`} onClick={props.onClick}>
      {props.children}
    </button>
  )
}
