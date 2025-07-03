import * as React from "react"

import { cn } from "@/lib/utils"

// Option 1: Use a type alias instead of an interface
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

// Option 2: Use an interface with explicit empty object intersection
// interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Option 3: Remove the interface entirely and use the type directly
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
