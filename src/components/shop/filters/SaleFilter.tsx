'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { createUrl } from '@/utilities/createUrl'

export function SaleFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onSale = searchParams.get('onSale') === '1'

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Popust</h3>
      <div className="flex items-center gap-2">
        <Checkbox
          id="on-sale"
          checked={onSale}
          onCheckedChange={(checked) => {
            const params = new URLSearchParams(searchParams.toString())
            if (checked === true) {
              params.set('onSale', '1')
            } else {
              params.delete('onSale')
            }
            router.push(createUrl(pathname, params), { scroll: false })
          }}
        />
        <Label htmlFor="on-sale" className="text-sm text-muted-foreground cursor-pointer">
          Na popustu
        </Label>
      </div>
    </div>
  )
}
