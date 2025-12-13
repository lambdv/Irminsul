"use client"
import { useState, useEffect } from 'react';
import LiteGraphCanvasComponent from "./LiteGraphCanvas";
import CSS from "./calculator.module.css"

export default function CalculatorViewport() {
    const [dimensions, setDimensions] = useState({ width: 1024, height: 720 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth/2,
                height: window.innerHeight - 60 // Account for mode selector height
            });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);


    return (
        <div className={CSS.calculatorContainer}>
            <div className={CSS.graphContainer}>
                <LiteGraphCanvasComponent 
                    width={dimensions.width}
                    height={dimensions.height}
                />
            </div>
        </div>
    )   
}