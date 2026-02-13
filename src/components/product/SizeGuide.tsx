'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type {
  ResolvedSizeGuide,
  SizeGuideRowClothes,
  SizeGuideRowFootwear,
} from '@/lib/resolveSizeGuide'
import { Ruler } from 'lucide-react'

const DEFAULT_CLOTHES: ResolvedSizeGuide = {
  title: 'Vodič za veličine',
  rowType: 'clothes',
  rows: [
    { size: 'S', length: 66, width: 53 },
    { size: 'M', length: 70, width: 58 },
    { size: 'L', length: 72, width: 60 },
    { size: 'XL', length: 73, width: 62 },
    { size: 'XXL', length: 75, width: 66 },
  ],
}

function ClothesTable({ rows }: { rows: SizeGuideRowClothes[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="py-2 px-3 text-left font-semibold">Veličina</th>
          <th className="py-2 px-3 text-left font-semibold">Dužina (cm)</th>
          <th className="py-2 px-3 text-left font-semibold">Širina (cm)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.size} className="border-b last:border-b-0">
            <td className="py-2 px-3 font-medium">{row.size}</td>
            <td className="py-2 px-3">{row.length}</td>
            <td className="py-2 px-3">{row.width}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function FootwearTable({ rows }: { rows: SizeGuideRowFootwear[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="py-2 px-3 text-left font-semibold">EU</th>
          <th className="py-2 px-3 text-left font-semibold">US</th>
          <th className="py-2 px-3 text-left font-semibold">CM</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`${row.eu}-${row.us}-${row.cm}-${i}`} className="border-b last:border-b-0">
            <td className="py-2 px-3 font-medium">{row.eu}</td>
            <td className="py-2 px-3">{row.us}</td>
            <td className="py-2 px-3">{row.cm}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function SizeGuide({ sizeGuide }: { sizeGuide?: ResolvedSizeGuide | null }) {
  const guide = sizeGuide ?? DEFAULT_CLOTHES

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Ruler className="size-4" />
          Vodič za veličine
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{guide.title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          {guide.rowType === 'clothes' ? (
            <ClothesTable rows={guide.rows} />
          ) : (
            <FootwearTable rows={guide.rows} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
