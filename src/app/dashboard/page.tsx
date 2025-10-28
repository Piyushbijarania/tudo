"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

type Todo = {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch todos on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchTodos()
    }
  }, [status])

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos")
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error("Error fetching todos:", error)
    }
  }

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description })
      })

      if (response.ok) {
        setTitle("")
        setDescription("")
        fetchTodos()
      }
    } catch (error) {
      console.error("Error creating todo:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ completed: !completed })
      })
      fetchTodos()
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE"
      })
      fetchTodos()
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xl text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-zinc-900 shadow-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-white">Tudu</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                {session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Create Todo Form */}
        <div className="bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Create New Todo</h2>
          <form onSubmit={handleCreateTodo} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Creating..." : "Add Todo"}
            </button>
          </form>
        </div>

        {/* Todos List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Your Todos</h2>
          {todos.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6 text-center text-gray-400">
              No todos yet. Create one above!
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6 flex items-start gap-4"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="mt-1 h-5 w-5 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500 focus:ring-offset-zinc-900"
                />
                <div className="flex-1">
                  <h3
                    className={`text-lg font-medium ${
                      todo.completed ? "line-through text-gray-500" : "text-white"
                    }`}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p
                      className={`mt-1 text-sm ${
                        todo.completed ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}