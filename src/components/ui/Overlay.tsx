import React from 'react'
import OverlayCSS from './Overlay.module.css'



export default function Overlay(props: {zIndex: number, onClick: any, children?: any, style?: any}) {
  const onClick: () => void = props.onClick || (() => {})
  return (
    <div 
      className={OverlayCSS.overlay}
      style={
        {
          zIndex: props.zIndex,
          ...props.style
        }
      }
      onClick={onClick}
    >
      <div 
        style={{zIndex: props.zIndex + 1}}
        onClick={(e) => e.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  )
}
