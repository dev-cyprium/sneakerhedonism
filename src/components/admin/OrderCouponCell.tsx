import type { DefaultServerCellComponentProps } from 'payload'

/**
 * List-view cell for `couponCode` on orders: a visible badge with the code and
 * the percent taken off, so a discounted order can be spotted without opening it.
 */
export const OrderCouponCell: React.FC<DefaultServerCellComponentProps> = ({
  cellData,
  rowData,
}) => {
  const code = typeof cellData === 'string' ? cellData : ''
  if (!code) return <span style={{ color: 'var(--theme-elevation-400)' }}>—</span>

  const percent = (rowData as Record<string, unknown> | undefined)?.couponDiscountPercent
  const percentLabel = typeof percent === 'number' ? ` · −${percent}%` : ''

  return (
    <span
      style={{
        background: 'var(--theme-success-100)',
        border: '1px solid var(--theme-success-400)',
        borderRadius: '4px',
        color: 'var(--theme-success-700)',
        display: 'inline-block',
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: '2px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {code}
      {percentLabel}
    </span>
  )
}
