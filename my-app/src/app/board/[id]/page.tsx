import { getBoard } from '@/app/actions'
import BoardEditor from './BoardEditor'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: PageProps) {
  const { id } = await params

  try {
    const board = await getBoard(id)
    return <BoardEditor board={board} />
  } catch {
    notFound()
  }
}
