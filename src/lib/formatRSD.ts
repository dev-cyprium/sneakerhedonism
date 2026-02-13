/**
 * Serbian RSD price formatter: 1.000,00 RSD (dot thousands, comma decimals).
 * Use this everywhere prices are displayed so the app is consistent.
 */
const RSD_FORMATTER = new Intl.NumberFormat('sr-RS', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatRSD(value: number): string {
  return `${RSD_FORMATTER.format(value)} RSD`
}
