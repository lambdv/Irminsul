"use client"
import ButtonCSS from './button.module.css'

export default function RoundBtn(props) {
  return (<>
      <button className={ButtonCSS.roundBtn + ` waves-effect waves-light ripple `} onClick={props.onClick}>
        <div>
          <i className='material-symbols-outlined'>{props.icon}</i>
        </div>
      </button>
  </>
)
}
