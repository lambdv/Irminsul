"use client"
import React from 'react'

export default function PreferencesSettings() {
    return (
        <div>
            <div className="flex items-center gap-2">
                <p>Language</p>
                <select name="language" id="language" className="bg-[#474747] rounded-md p-1">
                    <option value="en">English</option>
                    <option value="de">Chinese</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                <p>Theme</p>
                <select name="theme" id="theme" className="bg-[#474747] rounded-md p-1">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                </select>
            </div>
        </div>



    )
}
