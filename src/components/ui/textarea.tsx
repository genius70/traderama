// textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { TEXTAREA_BASE_CLASSES } from "@/constants";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(TEXTAREA_BASE_CLASSES, className)}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
