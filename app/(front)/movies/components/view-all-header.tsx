"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface ViewAllHeaderProps {
  title: string
  icon?: string
  total?: number
  backHref?: string
}

export function ViewAllHeader({ title, icon, total, backHref = "/movies" }: ViewAllHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link
        href={backHref}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-muted/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h1>
        {total !== undefined && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {total.toLocaleString()} movie{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  )
}
