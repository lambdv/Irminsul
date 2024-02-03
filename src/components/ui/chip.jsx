import ChipCSS from '../../css/chip.module.css'

export default function chip(props) {

  const selected = false;

  return (
    <button className={ChipCSS.chip + ` waves-effect waves-dark ripple`} onClick={props.onClick}>{props.children}</button>
  )
}
