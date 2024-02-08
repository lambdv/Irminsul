"use client"
import ButtonCSS from '@/css/button.module.css'

export default function Btn(props) {
  return (<>
      <button className={ButtonCSS.btn + ` waves-effect waves-light ripple`} onClick={props.onClick}>
        <div>
          {props.children}
        </div>
      </button>
  </>
)
}
