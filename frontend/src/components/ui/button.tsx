import * as React from "react";
import { cn } from "../../lib/utils";

type Variant = "default" | "ghost" | "outline";

type ButtonProps = {
  asChild?: boolean;
  variant?: Variant;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300"
};

const baseClasses =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, children, ...buttonProps }, ref) => {
    const classes = cn(baseClasses, variantClasses[variant], className);

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement;
      const { onClick, onMouseEnter, onMouseLeave, onFocus, onBlur } = buttonProps;
      return React.cloneElement(child, {
        ...(onClick ? { onClick } : {}),
        ...(onMouseEnter ? { onMouseEnter } : {}),
        ...(onMouseLeave ? { onMouseLeave } : {}),
        ...(onFocus ? { onFocus } : {}),
        ...(onBlur ? { onBlur } : {}),
        className: cn(classes, child.props.className),
        ref
      });
    }

    return (
      <button className={classes} ref={ref as React.Ref<HTMLButtonElement>} {...buttonProps}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
