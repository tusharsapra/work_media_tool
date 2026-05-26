import type { Style } from "exceljs";
import { armTheme } from "@/theme/armTheme";

const toFill = (hex: string): Style["fill"] => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: `FF${hex.replace("#", "")}` },
});

const baseFont: Partial<Style["font"]> = { name: "Inter", size: 11 };

export const STYLE_HEADER: Partial<Style> = {
  font: { ...baseFont, bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
  fill: toFill(armTheme.colors.charcoal),
  alignment: { vertical: "middle", horizontal: "left" },
  border: {
    bottom: { style: "thin", color: { argb: "FF1F2933" } },
  },
};

export const STYLE_SECTION_HEADER: Partial<Style> = {
  font: { ...baseFont, bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
  fill: toFill(armTheme.colors.cyan),
  alignment: { vertical: "middle", horizontal: "left" },
};

export const STYLE_LABEL: Partial<Style> = {
  font: { ...baseFont, bold: true, color: { argb: "FF1F2933" } },
};

export const STYLE_BODY: Partial<Style> = {
  font: { ...baseFont, color: { argb: "FF111111" } },
};

export const STYLE_TOTALS: Partial<Style> = {
  font: { ...baseFont, bold: true, color: { argb: "FFFFFFFF" } },
  fill: toFill(armTheme.colors.success),
  border: {
    top: { style: "thin", color: { argb: "FF1F2933" } },
  },
};

export const STYLE_GOOD: Partial<Style> = {
  font: { ...baseFont, color: { argb: "FF065F46" } },
  fill: toFill("#DCFCE7"),
};

export const STYLE_WATCH: Partial<Style> = {
  font: { ...baseFont, color: { argb: "FF92400E" } },
  fill: toFill("#FEF3C7"),
};

export const STYLE_BAD: Partial<Style> = {
  font: { ...baseFont, color: { argb: "FF991B1B" } },
  fill: toFill("#FEE2E2"),
};

export const STYLE_MUTED_NOTE: Partial<Style> = {
  font: { ...baseFont, italic: true, color: { argb: "FF6B7280" }, size: 10 },
};

export const CURRENCY_FORMAT: Record<string, string> = {
  USD: '"$"#,##0;[Red]-"$"#,##0',
  INR: '"₹"#,##0;[Red]-"₹"#,##0',
  EUR: '"€"#,##0;[Red]-"€"#,##0',
  GBP: '"£"#,##0;[Red]-"£"#,##0',
  AED: '"AED "#,##0;[Red]-"AED "#,##0',
  SGD: '"S$"#,##0;[Red]-"S$"#,##0',
  AUD: '"A$"#,##0;[Red]-"A$"#,##0',
};

export const PERCENT_FORMAT = "0.0%";
export const NUMBER_FORMAT = "#,##0";
