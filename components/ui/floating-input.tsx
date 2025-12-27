"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Lock, AlertCircle } from "lucide-react";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    { className, label, error, type = "text", showPasswordToggle, ...props },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const inputType = showPasswordToggle && showPassword ? "text" : type;
    const isFloating = focused || hasValue || props.value;

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "peer w-full rounded-lg border bg-transparent px-4 pt-6 pb-2 text-base transition-all duration-200 outline-none",
              "placeholder:text-transparent",
              error
                ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:border-primary dark:focus:ring-primary/20",
              className
            )}
            placeholder={label}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              setHasValue(e.target.value.length > 0);
              props.onBlur?.(e);
            }}
            {...props}
          />

          <label
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 pointer-events-none origin-left",
              isFloating && "top-2 translate-y-0 text-xs font-medium",
              error && "text-destructive",
              focused && !error && "text-primary"
            )}
          >
            {label}
          </label>

          {type === "password" && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lock className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
