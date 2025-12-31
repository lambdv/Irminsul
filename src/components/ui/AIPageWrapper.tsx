"use client"

import React from "react"
import Advertisment from "./Advertisment"

export default function AIPageWrapper({
  children,
  user,
}: {
  children: React.ReactNode
  user: any
}) {
  return (
    <div>
      {/* <div className="mb-4">
        <Advertisment type="banner" />
      </div> */}
      {children}
      {/* <div className="mt-4">
        <Advertisment type="banner" />
      </div> */}
    </div>
  )
}
