"use client"
import React, { useEffect, useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'


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
    borderRadius: '6px',
    color: 'var(--text-color)',
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
        borderColor: 'var(--ingame-primary-color)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--ingame-primary-color)',
    },
    '& .MuiList-root.MuiList-padding.MuiMenu-list': {
        backgroundColor: 'var(--background-color)'
    }
}

export default function PreferencesSettings() {

    //get cookies for language and theme client side
    const [language, setLanguage] = useState('')
    const [theme, setTheme] = useState('dark')

    useEffect(() => {
        const getCookies = () => {
            const language = document.cookie.split('; ').find(row => row.startsWith('language='))?.split('=')[1]
            const theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1]
            const initialTheme = theme || 'dark'
            setLanguage(language || 'en')
            setTheme(initialTheme)
            document.documentElement.setAttribute('data-theme', initialTheme)
        }
        getCookies()
    }, [])

    const setThemeCookie = (theme: string) => {
        document.cookie = `theme=${theme}; path=/`
        document.documentElement.setAttribute('data-theme', theme)
        setTheme(theme)
    }
    const setLanguageCookie = (language: string) => {
        document.cookie = `language=${language}; path=/`
        setLanguage(language)
    }



    return (
        <ThemeProvider theme={muiTheme}>
            <div className="flex items-center gap-2">
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel sx={{color: 'var(--text-color)'}}>Language</InputLabel>
                    <Select value={language} label="Language" onChange={(e) => setLanguageCookie(e.target.value)} sx={muiStyle}>
                        <MenuItem value="en" sx={{color: '#404040'}}>English</MenuItem>
                        {/* <MenuItem value="cn" sx={{color: '#404040'}}>Chinese</MenuItem> */}
                    </Select>
                </FormControl>
            </div>


            <div className="flex items-center gap-2">
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel sx={{color: 'var(--text-color)'}}>Theme</InputLabel>
                    <Select value={theme} label="Theme" onChange={(e) => setThemeCookie(e.target.value)} sx={muiStyle}>
                        <MenuItem value="dark" sx={{color: '#404040'}}>Dark</MenuItem>
                        <MenuItem value="light" sx={{color: '#404040'}}>Light</MenuItem>
                    </Select>
                </FormControl>
            </div>
        </ThemeProvider>
    )
}
