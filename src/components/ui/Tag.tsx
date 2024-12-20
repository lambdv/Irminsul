import TagCSS from './tag.module.css'

export default function Tag(props) {
  const selected = props.selected
  const style = props.style
  return (
    <button 
      onClick={props.onClick} 
      className={
        TagCSS.tag + 
        (selected ? ' waves-effect waves-dark ' : ' waves-effect waves-light ') +
        (selected && TagCSS.selected) 
      }
      style={style}
    >
      {props.children}
    </button>
  )
}
