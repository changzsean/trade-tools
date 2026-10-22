import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-white shadow-sm hover:bg-blue-700",
        secondary: "border border-border bg-white text-foreground hover:bg-surface-muted",
        ghost: "text-muted hover:bg-surface-muted hover:text-foreground",
        subtle: "bg-brand-soft text-brand hover:bg-blue-100",
      },
      size: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-9 px-3",
        lg: "h-10 px-4",
        icon: "h-9 w-9 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
