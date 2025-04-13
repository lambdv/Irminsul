import ButtonCSS from './button.module.css'

export default function FilterBtn(props: {
    selected?: boolean,
    style?: React.CSSProperties,
    onClick?: any
    children?: React.ReactNode
}) {
  const selected = props.selected
  
  
  return (
    <button 
        onClick={props.onClick} 
        className={
            ButtonCSS.filterBtn + 
            (selected ? ' waves-effect waves-dark ' : ' waves-effect waves-dark ') +
            (selected && ButtonCSS.selected) 
        }
        style={props.style}
    >
        {props.children} {selected === true && <span className={`material-symbols-rounded ${ButtonCSS.selectedIcon}`} onClick={props.onClick}>check</span>}
    </button>
    )
}
