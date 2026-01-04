import { getBoard } from '@/app/actions'
import BoardEditorWrapper from './BoardEditorWrapper'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: PageProps) {
    const { id } = await params

  try {
    const board = await getBoard(id)
    return <BoardEditorWrapper board={board} />
  } catch {
    notFound()
  }
}
