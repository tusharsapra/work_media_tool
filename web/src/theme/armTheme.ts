/**
 * ARM Worldwide-inspired design tokens.
 * Single source of truth for both Tailwind CSS variables (via index.css) and
 * ExcelJS export styles (via web/src/exports/excelStyles.ts). Never hard-code hex
 * elsewhere — read from here.
 */
export const armTheme = {
  colors: {
    foreground: "#111111",
    charcoal: "#1F2933",
    background: "#F7F9FC",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    mutedText: "#6B7280",

    cyan: "#16A7E0",
    magenta: "#EF3E5A",
    lime: "#7AC943",
    yellow: "#FDB515",
    purple: "#6D5DFB",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    ai: "#6D5DFB",
  },
  platformColors: {
    meta: "#16A7E0",
    google_search: "#FDB515",
    google_display: "#FDB515",
    google_demand_gen: "#FDB515",
    google_pmax: "#FDB515",
    youtube: "#EF3E5A",
    linkedin: "#0A66C2",
    tiktok: "#111111",
    bing: "#16A7E0",
    programmatic: "#6D5DFB",
    direct_publishers: "#6D5DFB",
    partner_inventory: "#6D5DFB",
    custom: "#6B7280",
  } as const,
  chartPalette: ["#16A7E0", "#FDB515", "#EF3E5A", "#7AC943", "#6D5DFB", "#0A66C2"],
  radius: { sm: "8px", md: "12px", lg: "16px" },
  spacing: { tight: "8px", base: "16px", roomy: "24px" },
  shadow: {
    card: "0 1px 2px rgba(17,17,17,0.04), 0 4px 12px rgba(17,17,17,0.04)",
  },
  font: {
    sans: "'Inter', Arial, Helvetica, sans-serif",
    heading: { weight: 700, tracking: "-0.01em" },
    dashboardNumber: { weight: 700, size: "32px" },
  },
} as const;

export type PlatformColorKey = keyof typeof armTheme.platformColors;
