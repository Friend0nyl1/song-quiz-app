"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Link } from "lucide-react"

export default function Component() {
  const [links, setLinks] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")

  const addLink = () => {
    if (inputValue.trim() && !links.includes(inputValue.trim())) {
      setLinks([...links, inputValue.trim()])
      setInputValue("")
    }
  }

  const removeLink = (linkToRemove: string) => {
    setLinks(links.filter((link) => link !== linkToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addLink()
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Link Manager</h2>
        <p className="text-muted-foreground">Add and manage your links</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="url"
            placeholder="Enter a link (e.g., https://example.com)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={addLink} disabled={!inputValue.trim() || links.includes(inputValue.trim())} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {inputValue && !isValidUrl(inputValue) && <p className="text-sm text-destructive">Please enter a valid URL</p>}

      {links.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Added Links ({links.length})</h3>
          <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1 text-sm max-w-xs">
                <Link className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{link}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeLink(link)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {links.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Link className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No links added yet</p>
          <p className="text-sm">Enter a link above to get started</p>
        </div>
      )}
    </div>
  )
}
