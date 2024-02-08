import TagCSS from '@/css/tag.module.css'

export default function chip(props) {

  const selected = props.selected
  
  return (
    <button onClick={props.onClick} className={TagCSS.tag + ` waves-effect waves-dark ripple ` + (selected===true ? TagCSS.selected : "")}>{props.children}</button>
  )
}
