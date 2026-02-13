'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Ruler } from 'lucide-react'

const sizes = [
  { size: 'S', length: 66, width: 53 },
  { size: 'M', length: 70, width: 58 },
  { size: 'L', length: 72, width: 60 },
  { size: 'XL', length: 73, width: 62 },
  { size: 'XXL', length: 75, width: 66 },
]

export function SizeGuide() {
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
          <DialogTitle>Vodič za veličine</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left font-semibold">Veličina</th>
                <th className="py-2 px-3 text-left font-semibold">Dužina (cm)</th>
                <th className="py-2 px-3 text-left font-semibold">Širina (cm)</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((row) => (
                <tr key={row.size} className="border-b last:border-b-0">
                  <td className="py-2 px-3 font-medium">{row.size}</td>
                  <td className="py-2 px-3">{row.length}</td>
                  <td className="py-2 px-3">{row.width}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
