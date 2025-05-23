"use client"
import React from 'react'
import StatTableCSS from './stattable.module.css';

export default function Table(props: {
    header: React.ReactNode,
    body: React.ReactNode,
    className?: string, 
    style?: React.CSSProperties
}) {
    return (
        <div className={`${StatTableCSS.stattable} ${props.className}`} style={props.style}>
            <table>
                <thead>
                    <tr>
                        {props.header}
                    </tr>
                </thead>
                <tbody>
                    {props.body}
                </tbody>
            </table>
        </div>
    )
}
