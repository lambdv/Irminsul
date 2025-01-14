import { Skeleton } from '@mui/material'
import React from 'react'

export default function loading() {
  return (
    <div className="flex flex-box justify-center items-center">
        <Skeleton variant="rectangular" width={100} height={100} />
    </div>
  )
}

