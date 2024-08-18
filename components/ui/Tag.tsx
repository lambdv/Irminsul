import TagCSS from './tag.module.css'

export default function Tag(props) {
  const selected = props.selected
  return (
    <button onClick={props.onClick} className={TagCSS.tag + ` waves-effect waves-light ripple ` + (selected === true ? TagCSS.selected : "")}>{props.children}</button>
  )
}
