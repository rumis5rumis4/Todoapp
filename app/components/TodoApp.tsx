"use client"

import { useState, useEffect, useRef } from "react"

type Todo = {
  id: string
  text: string
  completed: boolean
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("todos")
    if (saved) setTodos(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: crypto.randomUUID(), text, completed: false }])
    setInput("")
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const remaining = todos.filter(t => !t.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">やること</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {todos.length === 0
              ? "タスクがありません"
              : `${remaining} 件残っています`}
          </p>
        </div>

        {/* 入力エリア */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder-slate-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
          <button
            onClick={addTodo}
            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            追加
          </button>
        </div>

        {/* タスクリスト */}
        <ul className="space-y-2">
          {todos.length === 0 && (
            <li className="text-center text-slate-300 text-sm py-12">
              タスクを追加してみましょう
            </li>
          )}
          {todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 group transition-all"
            >
              {/* チェックボックス */}
              <button
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  todo.completed
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-slate-300 hover:border-indigo-400"
                }`}
              >
                {todo.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* テキスト */}
              <span
                className={`flex-1 text-sm transition-colors ${
                  todo.completed ? "line-through text-slate-300" : "text-slate-700"
                }`}
              >
                {todo.text}
              </span>

              {/* 削除ボタン */}
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label="削除"
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
