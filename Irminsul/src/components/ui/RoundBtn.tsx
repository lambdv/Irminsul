import Link from 'next/link'
import ButtonCSS from './button.module.css'

export default function RoundBtn(props: {
  icon: string, 
  onClick?: any, 
  style?: any, 
  className?: any, 
  iconStyle?: any,
  href?: string,
  disabled?: boolean
}) {

  const inner = (
    <button 
    className={
      ButtonCSS.roundBtn + 
      ` waves-effect waves-light ripple ` +
      (props.className ? props.className : '')
    }
    style={
      {
        ...props.style,
        opacity: props.disabled ? 0.5 : 1,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        "&:hover": {
          opacity: props.disabled ? 0.5 : 1,
          cursor: props.disabled ? 'not-allowed' : 'pointer',
        }
        
      }
    } 
    onClick={props.onClick}
    disabled={props.disabled}
  >
    <div>
      <i className='material-symbols-rounded' style={{...props.iconStyle}}>{props.icon}</i>
    </div>
  </button>
  )

  if(!props.href){
    return inner
  }

  return (
    <Link href={props.href}>
      {inner}
    </Link>
  )
}
