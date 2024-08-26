import React from 'react'
import OverlayCSS from './Overlay.module.css'

export default function Overlay(props: any) {
  const { zIndex } = props;
  const onClick = props.onClick || (() => {});

  return (
    <div 
      className={OverlayCSS.overlay}
      style={{zIndex: zIndex}}
      onClick={onClick}
    >
      {props.children}
    </div>
  )
}
