'use client'
import React, { createContext, useContext } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DictionaryContext = createContext<any>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DictionaryProvider({ children, dict }: { children: React.ReactNode; dict: any }) {
  return <DictionaryContext.Provider value={dict}>{children}</DictionaryContext.Provider>
}

export const useDictionary = () => {
  const context = useContext(DictionaryContext)
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider')
  }
  return context
}
