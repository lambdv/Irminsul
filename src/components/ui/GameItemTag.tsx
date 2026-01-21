"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { GameItemInfo } from "@/utils/gameItemResolver"
import { cn } from "@/lib/shadcn/utils"

interface GameItemTagProps {
  item: GameItemInfo
  className?: string
}

/**
 * Renders a clickable tag for a game item (character, weapon, artifact)
 * with icon and link to archive page (opens in new tab)
 */
export default function GameItemTag({ item, className }: GameItemTagProps) {
  const [imageError, setImageError] = React.useState(false)

  return (
    <Link
      href={item.archiveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-primary font-semibold",
        "hover:underline cursor-pointer",
        "no-underline",
        className
      )}
    >
      {!imageError && (
        <Image
          src={item.iconUrl}
          alt={item.name}
          width={20}
          height={20}
          className="rounded-sm"
          unoptimized
          onError={() => setImageError(true)}
        />
      )}
      <span>{item.name}</span>
    </Link>
  )
}
