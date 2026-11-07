/** Soft teal→stone palette for charts — stays inside Trackey tokens. */
const CHART_COLORS_LIGHT = [
  "#2f6b66",
  "#4a8f88",
  "#6aa39c",
  "#8bb8b1",
  "#a8c9c3",
  "#c5dbd6",
  "#7a7468",
  "#9a9386",
];

const CHART_COLORS_DARK = [
  "#5ea39b",
  "#74b5ad",
  "#8fc4bc",
  "#a8d0c9",
  "#c5e0db",
  "#9a9386",
  "#b0a99c",
  "#cfc7b8",
];

function activeChartColors(): string[] {
  const theme = document.documentElement.dataset.theme;
  return theme === "dark" ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
}

export function chartColor(index: number): string {
  const colors = activeChartColors();
  return colors[index % colors.length];
}
