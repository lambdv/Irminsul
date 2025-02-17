"use client"
import modalCSS from './modal.module.css'
import RoundBtn from '@/components/ui/RoundBtn'
import Overlay from './Overlay'
import { useEffect } from 'react'

export default function Modal(props) {

    const handleClose = (e) => {
        if (e.target === e.currentTarget) 
            props.toggle()
    }

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && props.toggle) {
                props.toggle()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }   )

    return (
        <Overlay zIndex={50} onClick={handleClose}>
            <div className={modalCSS.modal}>
                <div className={modalCSS.header}>
                    <h1>{props.title}</h1>
                    <div className={modalCSS.closeBTN}>
                        <RoundBtn icon="close" onClick={props.toggle}/>
                    </div>
                </div>
                <div className={modalCSS.body}>
                    {props.children}
                </div>
            </div>
        </Overlay>
    )
}
