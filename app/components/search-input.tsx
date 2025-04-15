"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useDebounce } from "../hooks/use-debounce"

type MovieSuggestion = {
  id: number
  title: string
  year: number | null
  posterPath: string | null
}

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  clearOnSubmit?: boolean
}

export function SearchInput({ value, onChange, onSubmit, disabled = false, clearOnSubmit = true }: SearchInputProps) {
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const debouncedSearchTerm = useDebounce(value, 300)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedSearchTerm)}`)
        const data = await response.json()

        if (response.ok && data.results) {
          setSuggestions(data.results)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelectSuggestion = (suggestion: MovieSuggestion) => {
    onChange(suggestion.title)
    setSuggestions([])
    setIsFocused(false)
  }

  const handleSubmit = () => {
    onSubmit()
    if (clearOnSubmit) {
      onChange("")
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Digite o título do filme..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          className="pr-8"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isFocused && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          <ul className="py-1 text-sm">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {suggestion.posterPath && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${suggestion.posterPath}`}
                    alt={suggestion.title}
                    className="h-10 w-7 object-cover rounded mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div>
                  <div className="font-medium">{suggestion.title}</div>
                  {suggestion.year && <div className="text-xs text-gray-500">{suggestion.year}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
