"use client"
import React, { useEffect, useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import Btn from '@/components/ui/Btn'

const muiTheme = createTheme({
    palette: {
        primary: {
            light: 'white',
            main: '#E7C073',
            dark: '#002884',
            contrastText: '#fff',
        },

    },
})

const muiStyle ={
    backgroundColor: 'transparent',
    color: 'var(--text-color) !important',
    borderRadius: '6px',
    '& .MuiSelect-select': {
        color: 'var(--text-color)'
    },
    '& .MuiInputLabel-root': {
        color: 'var(--text-color)'
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--ingame-primary-color)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--ingame-primary-color) !important',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--ingame-primary-color)',
    },
    '& .MuiList-root.MuiList-padding.MuiMenu-list': {
        backgroundColor: 'var(--background-color)'
    }
}

interface APIEndpoints {
    characters?: string;
    weapons?: string;
    artifacts?: string;
    [key: string]: string | undefined;
}

export default function APISettings() {
    const [dataProvider, setDataProvider] = useState('irminsul')
    // const defaultConfigTemplate: APIEndpoints = {
    //     "characters": "https://irminsul.moe/api/characters",
    //     "character[id]": "https://irminsul.moe/api/characters/[id]",
    //     "weapons": "https://irminsul.moe/api/weapons", 
    //     "weapon[id]": "https://irminsul.moe/api/weapons/[id]",
    //     "artifacts": "https://irminsul.moe/api/artifacts",
    //     "artifact[id]": "https://irminsul.moe/api/artifacts/[id]"
    // }
    // const [customAPIConfig, setCustomAPIConfig] = useState<APIEndpoints>(defaultConfigTemplate)
    // const [configInput, setConfigInput] = useState(JSON.stringify(defaultConfigTemplate, null, 2))


    
    // useEffect(() => {
    //     const customapi = document.cookie.split('; ').find(row => row.startsWith('customapi='))?.split('=')[1]
    //     if (customapi) {
    //         try {
    //             const parsedConfig = JSON.parse(decodeURIComponent(customapi))
    //             setCustomAPIConfig(parsedConfig)
    //             setConfigInput(JSON.stringify(parsedConfig, null, 2))
    //         } catch (e) {
    //             console.error('Failed to parse custom API config')
    //         }
    //     }
    // }, [])

    // const handleCustomAPIConnect = (configStr: string) => {
    //     try {
    //         const config = JSON.parse(configStr)
    //         // Validate and ensure all URLs have https://
    //         const processedConfig: APIEndpoints = {}
    //         Object.entries(config).forEach(([key, value]) => {
    //             if (typeof value === 'string') {
    //                 processedConfig[key] = value.includes('https://') ? value : `https://${value}`
    //             }
    //         })
            
    //         setCustomAPIConfig(processedConfig)
    //         setConfigInput(JSON.stringify(processedConfig, null, 2))
    //         document.cookie = `customapi=${encodeURIComponent(JSON.stringify(processedConfig))}; path=/`
    //     } catch (e) {
    //         console.error('Invalid JSON configuration')
    //     }
    // }

    // const handleDeleteCustomAPICookie = () => {
    //     document.cookie = 'customapi=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    //     setCustomAPIConfig(defaultConfigTemplate)
    //     setConfigInput(JSON.stringify(defaultConfigTemplate, null, 2))
    // }

    // const isCustomAPIConnectedSet = () => {
    //     const customapi = document.cookie.split('; ').find(row => row.startsWith('customapi='))?.split('=')[1]
    //     return !!customapi
    // }

    // useEffect(() => {
    //     if(isCustomAPIConnectedSet()){
    //         setDataProvider('custom')
    //     }
    // }, [])



    // const isConfigMatchingCookie = () => {
    //     const customapi = document.cookie.split('; ').find(row => row.startsWith('customapi='))?.split('=')[1]
    //     if (!customapi) return false
    //     try {
    //         return configInput === JSON.stringify(JSON.parse(decodeURIComponent(customapi)), null, 2)
    //     } catch {
    //         return false
    //     }
    // }

    

    return (
        <ThemeProvider theme={muiTheme}>
            <div>
                <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="data-provider-label" style={{color: 'var(--text-color)'}}>Data Provider</InputLabel>
                    <Select
                        labelId="data-provider-label"
                        value={dataProvider}
                        label="Data Provider"
                        onChange={(e) => setDataProvider(e.target.value)}
                        sx={muiStyle}
                    >
                        <MenuItem value="irminsul" sx={{color: '#404040'}} onClick={()=>{}}>Irminsul</MenuItem>
                        <MenuItem value="genshin-data" sx={{color: '#404040'}} onClick={()=>{}}>Genshin Data</MenuItem>

                        <MenuItem value="custom" sx={{color: '#404040'}}>Custom</MenuItem>
                    </Select>
                </FormControl>

                {/* {dataProvider === 'custom' &&
                    <>
                        <p className='text-sm text-gray-500 mt-2'>Disclaimer: If the custom api endpoints defined in the object breaks the site, clear the cookie and refresh the page to reset to the default endpoints</p>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder={`API Configuration (JSON)\nExample:\n${JSON.stringify(defaultConfigTemplate, null, 2)}`}
                            value={configInput}
                            onChange={(e) => {
                                setConfigInput(e.target.value)
                                try {
                                    setCustomAPIConfig(JSON.parse(e.target.value))
                                } catch (err) {
                                    // Invalid JSON, just update the input
                                }
                            }}
                            multiline
                            rows={8}
                            sx={{
                                ...muiStyle,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '',
                                    borderRadius: '6px',
                                    color: 'var(--text-color)'
                                },
                                marginTop: '0.5rem',
                                fontSize: '0.9rem',
                            }}
                        />
                        
                        <Btn 
                            onClick={() => {
                                handleCustomAPIConnect(configInput);
                            }}
                            style={{
                                marginTop: '0.5rem',
                                width: 'fit-content',
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                backgroundColor: isConfigMatchingCookie() 
                                    ? 'var(--ingame-primary-color)' 
                                    : 'transparent'
                            }}
                        >
                            {isConfigMatchingCookie() ? (
                                <div className="flex items-center gap-1">
                                    Connected <span className="material-symbols-outlined" style={{fontSize: '1.3rem'}}>check</span>
                                </div>
                            ) : (
                                'Connect'
                            )}
                        </Btn>

                        <Btn onClick={handleDeleteCustomAPICookie}>Disconnect</Btn>
                    </>
                } */}
            </div>
        </ThemeProvider>
    )
}
