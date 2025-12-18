import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",

      

        // 🔥 Icon-style badges (solid soft background)
        emeraldIcon: "border-transparent analytics-icon-emerald",
        skyIcon: "border-transparent analytics-icon-sky",
        limeIcon: "border-transparent analytics-icon-lime",
        amberIcon: "border-transparent analytics-icon-amber",
        purpleIcon: "border-transparent analytics-icon-purple",
        roseIcon: "border-transparent analytics-icon-rose",
        blueIcon: "border-transparent analytics-icon-blue",
        orangeIcon: "border-transparent analytics-icon-orange",
        indigoIcon: "border-transparent analytics-icon-indigo",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)


export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
