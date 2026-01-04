import { getBoard } from '@/app/actions'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'

const BoardEditor = dynamic(() => import('./BoardEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  ),
})

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
