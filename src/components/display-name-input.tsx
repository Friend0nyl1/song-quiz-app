"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertCircle, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface DisplayNameInputProps {
  value?: string
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  placeholder?: string
  maxLength?: number
  minLength?: number
  required?: boolean
  showSuggestions?: boolean
  showCharacterCount?: boolean
  showValidation?: boolean
  disabled?: boolean
  className?: string
}

const FORBIDDEN_WORDS = ["admin", "root", "system", "null", "undefined"]
const SUGGESTIONS = [
  "TechExplorer",
  "CodeMaster",
  "DigitalNomad",
  "CyberPioneer",
  "NetNavigator",
  "DataDriven",
  "CloudSurfer",
  "ByteBuilder",
]

export function DisplayNameInput({
  value = "",
  onChange,
  onValidationChange,
  placeholder = "Enter your display name",
  maxLength = 30,
  minLength = 2,
  required = true,
  showSuggestions = true,
  showCharacterCount = true,
  showValidation = true,
  disabled = false,
  className,
}: DisplayNameInputProps) {
  const [displayName, setDisplayName] = useState(value)
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const validateDisplayName = (name: string) => {
    const newErrors: string[] = []

    if (required && name.length === 0) {
      newErrors.push("Display name is required")
    } else if (name.length > 0) {
      if (name.length < minLength) {
        newErrors.push(`Must be at least ${minLength} characters`)
      }
      if (name.length > maxLength) {
        newErrors.push(`Must be no more than ${maxLength} characters`)
      }
      if (!/^[a-zA-Z0-9\s_-]+$/.test(name)) {
        newErrors.push("Only letters, numbers, spaces, hyphens, and underscores allowed")
      }
      if (FORBIDDEN_WORDS.some((word) => name.toLowerCase().includes(word))) {
        newErrors.push("Contains forbidden words")
      }
      if (name.trim() !== name) {
        newErrors.push("Cannot start or end with spaces")
      }
      if (/\s{2,}/.test(name)) {
        newErrors.push("Cannot contain multiple consecutive spaces")
      }
    }

    setErrors(newErrors)
    const valid = newErrors.length === 0 && (name.length >= minLength || !required)
    setIsValid(valid)
    onValidationChange?.(valid)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setDisplayName(newValue)
    onChange?.(newValue)
    validateDisplayName(newValue)

    // Generate suggestions based on input
    if (newValue.length > 0 && showSuggestions) {
      const filtered = SUGGESTIONS.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(newValue.toLowerCase()) ||
          newValue.toLowerCase().includes(suggestion.toLowerCase()),
      ).slice(0, 3)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setDisplayName(suggestion)
    onChange?.(suggestion)
    validateDisplayName(suggestion)
    setSuggestions([])
  }

  const generateRandomName = () => {
    const randomSuggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]
    const randomNumber = Math.floor(Math.random() * 999) + 1
    const generatedName = `${randomSuggestion}${randomNumber}`
    setDisplayName(generatedName)
    onChange?.(generatedName)
    validateDisplayName(generatedName)
    setSuggestions([])
  }

  useEffect(() => {
    validateDisplayName(displayName)
  }, [minLength, maxLength, required])

  const remainingChars = maxLength - displayName.length
  const isNearLimit = remainingChars <= 5

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="display-name" className="text-sm font-medium">
          Display Name {required && <span className="text-red-500">*</span>}
        </Label>
        {showCharacterCount && (
          <span className={cn("text-xs", isNearLimit ? "text-red-500" : "text-muted-foreground")}>
            {displayName.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="display-name"
            type="text"
            value={displayName}
            onChange={handleInputChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={cn(
              "pl-10 pr-10",
              showValidation && errors.length > 0 && "border-red-500 focus-visible:ring-red-500",
              showValidation && isValid && displayName.length > 0 && "border-green-500 focus-visible:ring-green-500",
            )}
          />
          {showValidation && displayName.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validation errors */}
      {showValidation && errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Generate random name button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateRandomName}
          disabled={disabled}
          className="text-xs"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Generate Random
        </Button>
        {isValid && displayName.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Check className="mr-1 h-3 w-3" />
            Valid
          </Badge>
        )}
      </div>
    </div>
  )
}
