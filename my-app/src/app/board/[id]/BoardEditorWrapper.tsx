'use client'

import dynamic from 'next/dynamic'

const BoardEditor = dynamic(() => import('./BoardEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  ),
})

interface BoardEditorWrapperProps {
  board: {
    id: string
    title: string
    snapshot: Record<string, unknown>
  }
}

export default function BoardEditorWrapper({ board }: BoardEditorWrapperProps) {
  return <BoardEditor board={board} />
}
