"use client"

import { Button } from "@/components/cn/button"
import Link from "next/link"

interface SelectButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline"
  onClick?: () => void
}

export default function SelectButton({
  href,
  children,
  className = "",
  variant = "outline",
  onClick,
}: SelectButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  if (href) {
    return (
      <Button className={`${className} ${variant}`} asChild>
        <Link href={href} onClick={handleClick}>
          {children}
        </Link>
      </Button>
    )
  }

  return (
    <Button className={`${className} ${variant}`} onClick={handleClick}>
      {children}
    </Button>
  )
}
