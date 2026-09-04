import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary-focus focus-visible:outline-2 focus-visible:outline-[#96763f] px-[22px] py-[11px]",
        outline:
          "rounded-full border-primary bg-transparent text-primary hover:bg-primary/5 px-[22px] py-[11px]",
        secondary:
          "rounded-[11px] bg-surface-pearl text-ink-muted-80 border-divider-soft px-[14px] py-2",
        ghost:
          "text-primary bg-transparent hover:underline px-0 py-0 border-0 rounded-none",
        destructive:
          "rounded-full bg-destructive text-white hover:brightness-110 px-[22px] py-[11px]",
        link: "text-primary underline-offset-4 hover:underline px-0 py-0 border-0 rounded-none",
      },
      size: {
        default: "",
        sm: "text-xs px-3 py-1.5",
        lg: "text-lg px-7 py-3.5",
        icon: "size-11 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
