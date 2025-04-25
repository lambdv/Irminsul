"use client"
import React, { useEffect, useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Btn from '@/components/ui/Btn'
import { clearCustomAPI, setCustomAPI, validateCustomAPI } from './actions'

/**
 * Settings component for changing the data provider
 * @returns 
 */
export default function APISettings() {
    const [dataProvider, setDataProvider] = useState('irminsul')
    const [customAPIURL, setCustomAPIURL] = useState('')
    const [isCookieActionLoading, setIsCookieActionLoading] = useState(false)


    //load the custom api config from the cookie
    useEffect(() => {
        const apiCookie = document.cookie.split('; ').find(row => row.startsWith('customapi='))?.split('=')[1]
        if(!apiCookie)
            return
        
        try {
            // Handle non-JSON values first
            if (apiCookie === 'gd') {
                setDataProvider('genshin-data')
                return
            }
            
            // Try to parse as JSON, but handle direct URL strings
            try {
                const api = JSON.parse(decodeURIComponent(apiCookie))
                console.log(api)
                if (typeof api === 'string') {
                    setCustomAPIURL(api)
                    setDataProvider(api === 'genshin-data' ? 'genshin-data' : 'custom')
                }
            } catch (e) {
                // If JSON parsing fails, treat it as a direct URL string
                const decodedValue = decodeURIComponent(apiCookie)
                if (decodedValue.startsWith('http')) {
                    setCustomAPIURL(decodedValue)
                    setDataProvider('custom')
                }
                console.log('Using direct URL string from cookie:', decodedValue)
            }
        } catch (e) {
            console.error('Failed to process custom API config', e)
        }
    }, [])

    // Check if cookie has been updated to stop loading state
    // useEffect(() => {
    //     if (isCookieActionLoading) {
    //         const checkCookie = () => {
    //             if (stateMatchesCookie()) {
    //                 setIsCookieActionLoading(false)
    //             } else {
    //                 setTimeout(checkCookie, 100) // Check again after 100ms
    //             }
    //         }
    //         checkCookie()
    //     }
    // }, [isCookieActionLoading])


    const handleDataProviderChange = async (value: "irminsul" | "genshin-data" | "custom") => {
        setDataProvider(value)
        switch(value){
            case 'irminsul':
                clearCustomAPI()
                break
            case 'genshin-data':
                setCustomAPI('gd')
                break
            case 'custom':
                console.log(customAPIURL)
                if (customAPIURL) {
                    setIsCookieActionLoading(true)
                    const res = await validateCustomAPI(customAPIURL)
                    if(res){
                        await setCustomAPI(customAPIURL)
                        setIsCookieActionLoading(false)
                    }
                    else{
                        alert('Invalid custom api')
                        setIsCookieActionLoading(false)
                    }
                }
                break
            default:
                console.error('Invalid data provider')
                throw new Error('Invalid data provider')
        }
    }
    
    // /**
    //  * Sets the custom api url in the cookie
    //  * @param url 
    //  */ 
    // const handleCustomAPIConnect = () => {
    //     setIsCookieActionLoading(true)
    //     document.cookie = `customapi=${encodeURIComponent(JSON.stringify(customAPIURL))}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`
    // }

    const stateMatchesCookie = () => {
        const apiCookie = document.cookie.split('; ').find(row => row.startsWith('customapi='))?.split('=')[1]
        if(!apiCookie) 
            return false
        
        // Handle special case for 'gd'
        if (apiCookie === 'gd' && dataProvider === 'genshin-data') {
            return true
        }
        
        try {
            // Try to parse as JSON
            const value = JSON.parse(decodeURIComponent(apiCookie))
            return value === customAPIURL && customAPIURL.length > 0
        } catch (e) {
            // If not valid JSON, compare directly with decoded value
            const decodedValue = decodeURIComponent(apiCookie)
            return decodedValue === customAPIURL && customAPIURL.length > 0
        }
    }
    

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
                        <MenuItem value="irminsul" sx={{color: '#404040'}} onClick={()=>{handleDataProviderChange('irminsul')}}>Irminsul</MenuItem>
                        <MenuItem value="genshin-data" sx={{color: '#404040'}} onClick={()=>{handleDataProviderChange('genshin-data')}}>dvaJi's Genshin Data</MenuItem>
                        <MenuItem value="custom" sx={{color: '#404040'}}>Custom</MenuItem>
                    </Select>
                </FormControl>

               {dataProvider === 'custom' &&
                    <>
                        <p className='text-sm text-gray-500 mt-2'>If custom api breaks the site, clear the cookie and refresh the page to reset to the default endpoints.</p>
                        <p className='text-sm text-gray-500 mt-2'>Custom api must follow our applications <a href="https://github.com/lambdv/Irminsul/tree/main/apps/Irminsul/src/types" target='_blank' rel='noreferrer' className='text-blue-500'>type structure</a></p>

                        <TextField
                            fullWidth
                            size="small"
                            placeholder={`enter the custom api url`}
                            value={customAPIURL}
                            onChange={(e) => {
                                setCustomAPIURL(e.target.value)
                            }}
                            multiline
                            rows={1}
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
                            onClick={async () => {
                                if (!customAPIURL || !customAPIURL.trim() || !customAPIURL.startsWith('http')) {
                                    alert('Please enter a valid URL');
                                    return;
                                }
                                await handleDataProviderChange("custom");
                            }}
                            style={{
                                marginTop: '0.5rem',
                                width: 'fit-content',
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                backgroundColor: stateMatchesCookie() 
                                    ? 'var(--ingame-primary-color)' 
                                    : 'transparent'
                            }}
                        >
                            {stateMatchesCookie() ? (
                                <div className="flex items-center gap-1">
                                    Connected <span className="material-symbols-outlined" style={{fontSize: '1.3rem'}}>check</span>
                                </div>
                            ) : isCookieActionLoading ? (
                                <div className="flex items-center gap-1">
                                    Connecting <span className="material-symbols-outlined animate-spin" style={{fontSize: '1.3rem'}}>progress_activity</span>
                                </div>
                            ) : (
                                'Connect'
                            )}
                        </Btn>

                        <Btn onClick={()=>{handleDataProviderChange('irminsul')}} disabled={stateMatchesCookie()}>Disconnect</Btn>
                    </>
                } 
            </div>
        </ThemeProvider>
    )
}


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
