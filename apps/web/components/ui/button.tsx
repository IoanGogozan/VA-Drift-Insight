import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-ink bg-ink text-white hover:bg-slate-700",
        secondary: "border-slate-300 bg-white text-ink hover:bg-slate-50",
        ghost: "border-transparent bg-transparent text-ink hover:bg-slate-100"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
