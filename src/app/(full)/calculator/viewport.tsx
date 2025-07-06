"use client"
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CSS from "./calculator.module.css"


export default function CalculatorViewport() {

    const nodes = [
        {
          id: '1', // required
          position: { x: 0, y: 0 }, // required
          data: { label: 'Hello' }, // required
        },
      ];

    return (
        <div className={CSS.viewportWrapper}>
            <ReactFlow 
                nodes={nodes}
                colorMode="dark"
                fitView
            >
                <Background 
                    variant={null}
                    bgColor="#070707"
                />
                <Controls />
            </ReactFlow>
        </div>
    )   
}