import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Document } from '../lib/supabase'

export function useDocuments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createDocument = async (title: string, content: string, visibility: 'private' | 'public') => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          content,
          status: 'draft',
          visibility,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Document[]
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getDocument = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Document
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateDocument = async (
    id: string,
    updates: Partial<Pick<Document, 'title' | 'content' | 'status' | 'visibility' | 'reviewer_feedback'>>
  ) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createDocument,
    getDocuments,
    getDocument,
    updateDocument,
    deleteDocument
  }
} 