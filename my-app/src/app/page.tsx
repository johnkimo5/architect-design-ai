import { getBoards, createBoard, deleteBoard, signOut } from './actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DeleteBoardButton } from './DeleteBoardButton'

export default async function Home() {
  const boards = await getBoards()

  async function handleCreate() {
    'use server'
    const board = await createBoard()
    redirect(`/board/${board.id}`)
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const boardId = formData.get('boardId') as string
    await deleteBoard(boardId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">System Design Whiteboard</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">My Boards</h2>
          <form action={handleCreate}>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Board
            </button>
          </form>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No boards yet</h3>
            <p className="text-gray-500 mb-6">Create your first system design board to get started.</p>
            <form action={handleCreate}>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Board
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white border rounded-lg hover:shadow-md transition-shadow group"
              >
                <Link
                  href={`/board/${board.id}`}
                  className="block p-4"
                >
                  <h3 className="font-medium text-gray-900 truncate">{board.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Updated {new Date(board.updated_at).toLocaleDateString()}
                  </p>
                </Link>
                <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteBoardButton boardId={board.id} onDelete={handleDelete} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
