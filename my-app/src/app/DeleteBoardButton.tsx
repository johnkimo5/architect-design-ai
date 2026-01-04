'use client'

interface DeleteBoardButtonProps {
  boardId: string
  onDelete: (formData: FormData) => Promise<void>
}

export function DeleteBoardButton({ boardId, onDelete }: DeleteBoardButtonProps) {
  return (
    <form action={onDelete}>
      <input type="hidden" name="boardId" value={boardId} />
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-800"
        onClick={(e) => {
          if (!confirm('Are you sure you want to delete this board?')) {
            e.preventDefault()
          }
        }}
      >
        Delete
      </button>
    </form>
  )
}

