import * as React from "react";
import type { Currency } from "@mpa/shared";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/formatters";

interface FormattedNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number;
  onValueChange: (value: number) => void;
  currency?: Currency;
}

/**
 * Controlled numeric input that DISPLAYS a comma-grouped string (locale-aware)
 * but STORES a raw number. The calculation engines never see formatted strings.
 * While focused, it shows the live formatted value; the raw number is committed
 * via onValueChange on every keystroke.
 */
export const FormattedNumberInput = React.forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ value, onValueChange, currency, className, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [draft, setDraft] = React.useState("");

    const display = focused ? draft : formatCurrencyInput(value, currency);

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onFocus={() => {
          setFocused(true);
          setDraft(formatCurrencyInput(value, currency));
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const raw = parseCurrencyInput(e.target.value);
          // Re-format the draft so the user sees grouping as they type.
          setDraft(formatCurrencyInput(raw, currency));
          onValueChange(raw);
        }}
        className={cn(
          "flex h-10 w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
FormattedNumberInput.displayName = "FormattedNumberInput";
