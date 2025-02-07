"use client"
import React, { useState } from 'react'

export default function APISettings() {
    const [dataProvider, setDataProvider] = useState('irminsul')
    const [customAPIURL, setCustomAPIURL] = useState('')
    return (
        <div>
            <div className='flex items-center gap-2'>

            <p>Data Provider: </p>
            <select name="dataProvider" id="dataProvider" className='bg-[#474747] rounded-md p-1' onChange={(e) => setDataProvider(e.target.value)}>
                <option value="irminsul">Irminsul</option>
                <option value="custom">Custom</option>
            </select>
        </div>
        {dataProvider === 'custom' && (<>
            <input 
                type="text"
                placeholder="API URL"
                className="bg-[#474747] rounded-md p-1 mt-2 w-full"
            />

            <textarea
                placeholder="API Adaptor"
                className="bg-[#474747] rounded-md p-1 mt-2 w-full"
            />
        </>)}

    </div>




  )
}
