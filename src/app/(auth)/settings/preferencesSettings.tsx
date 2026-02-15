"use client"
import React, { useEffect, useState } from "react"
import { Label } from "@/components/cn/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/cn/select"

export default function PreferencesSettings() {
  //get cookies for language and theme client side
  const [language, setLanguage] = useState("")
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const getCookies = () => {
      const language = document.cookie
        .split("; ")
        .find((row) => row.startsWith("language="))
        ?.split("=")[1]
      const theme = document.cookie
        .split("; ")
        .find((row) => row.startsWith("theme="))
        ?.split("=")[1]
      const initialTheme = theme || "dark"
      setLanguage(language || "en")
      setTheme(initialTheme)
      document.documentElement.setAttribute("data-theme", initialTheme)
    }
    getCookies()
  }, [])

  const setThemeCookie = (theme: string) => {
    document.cookie = `theme=${theme}; path=/`
    document.documentElement.setAttribute("data-theme", theme)
    setTheme(theme)
  }
  const setLanguageCookie = (language: string) => {
    document.cookie = `language=${language}; path=/`
    setLanguage(language)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select
          value={language}
          onValueChange={(value) => setLanguageCookie(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            {/* <SelectItem value="cn">Chinese</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={theme} onValueChange={(value) => setThemeCookie(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="purple">Solized Light</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
