"use client"
import React, { useEffect, useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Btn from '@/components/ui/Btn'

/**
 * Settings component for changing the data provider
 * @returns 
 */
export default function APISettings() {
    const [dataProvider, setDataProvider] = useState('irminsul')
    const [customAPIURL, setCustomAPIURL] = useState('')


    //load the custom api config from the cookie
    useEffect(() => {
        const apiCookie = document.cookie.split('; ').find(row => row.startsWith('customapi='))?.split('=')[1]
        if(!apiCookie) 
            return
        
        const api = JSON.parse(decodeURIComponent(apiCookie))
        try {
           console.log(api)
            switch(dataProvider){

                case 'genshin-data':
                    
                break
            }
        } catch (e) {console.error('Failed to parse custom API config')}

    }, [])


    const handleDataProviderChange = (value: string) => {
        setDataProvider(value)
        
        switch(value){
            case 'irminsul':
                //delete the api cookie
                document.cookie = 'customapi=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                break
            case 'genshin-data':
                //change cookie to the genshin data api
                document.cookie = 'customapi=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                break
            case 'custom':
                //change cookie to the custom api
                document.cookie = 'customapi=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            
                break
            default:
                console.error('Invalid data provider')
                throw new Error('Invalid data provider')
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
                        <MenuItem value="custom" sx={{color: '#404040'}} onClick={()=>{handleDataProviderChange('custom')}}>Custom</MenuItem>
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
                        
                        {/* <Btn 
                            onClick={() => {
                                handleCustomAPIConnect(customAPIURL);
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
                        </Btn> */}

                        <Btn onClick={()=>{handleDataProviderChange('irminsul')}}>Disconnect</Btn>
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

interface APIEndpoints {
    characters?: string;
    weapons?: string;
    artifacts?: string;
    [key: string]: string | undefined;
}
