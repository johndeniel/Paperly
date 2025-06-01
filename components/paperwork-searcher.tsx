'use client'

import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PaperworkSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function PaperworkSearcher({
  searchQuery,
  onSearchChange,
}: PaperworkSearchProps) {
  return (
    // Container for the search input with relative positioning
    <div className="relative max-w-md flex-grow">
      {/* Search icon positioned inside the input */}
      <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />

      {/* Search input field */}
      <Input
        placeholder="Search"
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="h-9 pl-9"
      />

      {/* Clear button appears only when searchQuery is not empty */}
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-7 w-7"
          onClick={() => onSearchChange('')}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
