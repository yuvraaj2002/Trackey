/** Soft teal→stone palette for charts — stays inside Trackey tokens. */
export const CHART_COLORS = [
  "#2f6b66",
  "#4a8f88",
  "#6aa39c",
  "#8bb8b1",
  "#a8c9c3",
  "#c5dbd6",
  "#7a7468",
  "#9a9386",
];

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
