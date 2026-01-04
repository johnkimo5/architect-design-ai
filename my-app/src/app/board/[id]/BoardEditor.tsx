'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Tldraw, Editor, TLStoreSnapshot, exportAs, loadSnapshot, getSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { saveBoard, updateBoardTitle } from '@/app/actions'
import Link from 'next/link'
import { customShapeUtils, customTools } from '@/components/whiteboard/shapes'
import { uiOverrides, components } from '@/components/whiteboard/ui-overrides'
import GradingPanel from './GradingPanel'

interface BoardEditorProps {
  board: {
    id: string
    title: string
    snapshot: Record<string, unknown>
  }
}

export default function BoardEditor({ board }: BoardEditorProps) {
  const editorRef = useRef<Editor | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState(board.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showGrading, setShowGrading] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Export handler
  const handleExport = async (format: 'png' | 'svg') => {
    if (!editorRef.current) return

    const shapeIds = editorRef.current.getCurrentPageShapeIds()
    if (shapeIds.size === 0) {
      alert('No shapes to export. Add some components first.')
      return
    }

    try {
      await exportAs(editorRef.current, [...shapeIds], {
        format,
        name: title || 'system-design',
      })
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
    setShowExportMenu(false)
  }

  // Handle editor mount
  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor

    // Load existing snapshot if available
    if (board.snapshot && Object.keys(board.snapshot).length > 0) {
      try {
        loadSnapshot(editor.store, board.snapshot as unknown as TLStoreSnapshot)
      } catch (e) {
        console.error('Failed to load snapshot:', e)
      }
    }

    // Listen for changes
    const unsubscribe = editor.store.listen(() => {
      setIsDirty(true)
    }, { scope: 'document' })

    return () => unsubscribe()
  }, [board.snapshot])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!editorRef.current || !isDirty) return

    setIsSaving(true)
    try {
      const snapshot = getSnapshot(editorRef.current.store)
      await saveBoard(board.id, snapshot)
      setIsDirty(false)
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [board.id, isDirty])

  // Handle title update
  const handleTitleSubmit = async () => {
    setIsEditingTitle(false)
    if (title !== board.title && title.trim()) {
      try {
        await updateBoardTitle(board.id, title.trim())
      } catch (error) {
        console.error('Failed to update title:', error)
        setTitle(board.title)
      }
    }
  }

  // Keyboard shortcut (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900"
            onClick={(e) => {
              if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                e.preventDefault()
              }
            }}
          >
            ← Back
          </Link>

          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit()
                if (e.key === 'Escape') {
                  setTitle(board.title)
                  setIsEditingTitle(false)
                }
              }}
              className="text-lg font-medium border-b-2 border-blue-500 outline-none px-1"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-lg font-medium hover:bg-gray-100 px-2 py-1 rounded"
            >
              {title}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-sm text-gray-500">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setShowGrading(!showGrading)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showGrading
                ? 'bg-purple-700 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Grade
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              Export
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border z-20">
                  <button
                    onClick={() => handleExport('png')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg"
                  >
                    Export PNG
                  </button>
                  <button
                    onClick={() => handleExport('svg')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg"
                  >
                    Export SVG
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          <Tldraw
            shapeUtils={customShapeUtils}
            tools={customTools}
            overrides={uiOverrides}
            components={components}
            onMount={handleMount}
          />
        </div>

        {/* Grading Panel */}
        {showGrading && (
          <GradingPanel
            editorRef={editorRef}
            onClose={() => setShowGrading(false)}
          />
        )}
      </div>
    </div>
  )
}
