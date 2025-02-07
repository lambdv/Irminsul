import Link from 'next/link'
import ButtonCSS from './button.module.css'

export default function RoundBtn(props: {
  icon: string, 
  onClick?: any, 
  style?: any, 
  className?: any, 
  iconStyle?: any,
  href?: string
}) {
  if (!props.href) {
    return (
      <button 
        className={
          ButtonCSS.roundBtn + 
          ` waves-effect waves-light ripple ` +
          (props.className ? props.className : '')
        }
        style={props.style} 
        onClick={props.onClick}
      >
        <div>
          <i className='material-symbols-outlined' style={{...props.iconStyle}}>{props.icon}</i>
        </div>
      </button>
    )
  }

  return (
    <Link href={props.href}>
      <button 
        className={
          ButtonCSS.roundBtn + 
          ` waves-effect waves-light ripple ` +
          (props.className ? props.className : '')
        }
        style={props.style} 
        onClick={props.onClick}
      >
        <div>
          <i className='material-symbols-outlined' style={{...props.iconStyle}}>{props.icon}</i>
        </div>
      </button>
    </Link>
  )
}
