"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const getStoredValue = (): T => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao recuperar ${key} do localStorage:`, error)
      return initialValue
    }
  }

  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error)
    }
  }

  useEffect(() => {
    setStoredValue(getStoredValue())
  }, [key])

  return [storedValue, setValue]
}
