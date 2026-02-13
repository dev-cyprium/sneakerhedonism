'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function SaleFilter() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="on-sale" disabled />
      <Label htmlFor="on-sale" className="text-sm text-muted-foreground">
        Na popustu
      </Label>
    </div>
  )
}
