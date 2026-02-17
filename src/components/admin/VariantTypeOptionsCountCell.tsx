import type { DefaultServerCellComponentProps } from 'payload'

type JoinFieldCellData = {
  docs?: unknown[]
  totalDocs?: number
}

export const VariantTypeOptionsCountCell: React.FC<DefaultServerCellComponentProps> = ({ cellData }) => {
  const joinData = (cellData && typeof cellData === 'object' ? cellData : null) as JoinFieldCellData | null
  const loadedDocsCount = Array.isArray(joinData?.docs) ? joinData.docs.length : null
  const totalDocs = loadedDocsCount ?? (typeof joinData?.totalDocs === 'number' ? joinData.totalDocs : 0)
  const optionsLabel = totalDocs === 1 ? 'option' : 'options'

  return <span>{`${totalDocs} ${optionsLabel}`}</span>
}
