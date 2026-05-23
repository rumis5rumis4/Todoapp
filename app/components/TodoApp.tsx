"use client"

import { useState, useEffect, useRef } from "react"

type Priority = "high" | "medium" | "low"
type Category = "work" | "private" | "other"
type FilterCategory = "all" | Category

type Todo = {
  id: string
  text: string
  completed: boolean
  priority: Priority
  deadline: string
  category: Category
}

const PRIORITY_LABEL: Record<Priority, string> = { high: "高", medium: "中", low: "低" }
const PRIORITY_COLOR: Record<Priority, string> = {
  high: "text-red-500 bg-red-50 border border-red-200",
  medium: "text-amber-500 bg-amber-50 border border-amber-200",
  low: "text-emerald-600 bg-emerald-50 border border-emerald-200",
}
const CATEGORY_LABEL: Record<Category, string> = {
  work: "仕事",
  private: "プライベート",
  other: "その他",
}
const CATEGORY_COLOR: Record<Category, string> = {
  work: "text-blue-600 bg-blue-50",
  private: "text-purple-600 bg-purple-50",
  other: "text-slate-500 bg-slate-100",
}
const CATEGORY_ICON: Record<Category, string> = {
  work: "💼",
  private: "🏠",
  other: "📌",
}

const CIRCUMFERENCE = 2 * Math.PI * 40

function ProgressRing({ rate }: { rate: number }) {
  const dashOffset = CIRCUMFERENCE * (1 - rate)
  return (
    <div className="relative flex-shrink-0">
      <svg width="96" height="96" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#d1fae5" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke="#10b981" strokeWidth="10"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-emerald-600 leading-none">{Math.round(rate * 100)}</span>
        <span className="text-xs text-slate-400">%</span>
      </div>
    </div>
  )
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [deadline, setDeadline] = useState("")
  const [category, setCategory] = useState<Category>("work")
  const [filter, setFilter] = useState<FilterCategory>("all")
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [newId, setNewId] = useState<string | null>(null)
  const [poppingId, setPoppingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("todos-v2")
    if (saved) setTodos(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("todos-v2", JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const id = crypto.randomUUID()
    setTodos(prev => [...prev, { id, text: trimmed, completed: false, priority, deadline, category }])
    setNewId(id)
    setText("")
    setTimeout(() => setNewId(null), 400)
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setPoppingId(id)
    setTimeout(() => setPoppingId(null), 300)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: string) => {
    setRemovingIds(prev => new Set([...prev, id]))
    setTimeout(() => {
      setTodos(prev => prev.filter(t => t.id !== id))
      setRemovingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }, 220)
  }

  const filtered = filter === "all" ? todos : todos.filter(t => t.category === filter)
  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })

  const total = todos.length
  const completedCount = todos.filter(t => t.completed).length
  const rate = total === 0 ? 0 : completedCount / total

  const isOverdue = (dl: string) => {
    if (!dl) return false
    return new Date(dl) < new Date(new Date().toDateString())
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-10 px-4">
      <div className="w-full max-w-lg mx-auto space-y-4">

        {/* ヘッダー + 進捗リング */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex items-center gap-5">
          <ProgressRing rate={rate} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">やること</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {total === 0 ? "タスクがありません" : `${completedCount} / ${total} 完了`}
            </p>
            <div className="flex gap-4 mt-2.5 text-xs font-medium">
              <span className="text-red-400">
                🔴 高 {todos.filter(t => t.priority === "high" && !t.completed).length}
              </span>
              <span className="text-amber-400">
                🟡 中 {todos.filter(t => t.priority === "medium" && !t.completed).length}
              </span>
              <span className="text-emerald-500">
                🟢 低 {todos.filter(t => t.priority === "low" && !t.completed).length}
              </span>
            </div>
          </div>
        </div>

        {/* カテゴリフィルタータブ */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "work", "private", "other"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                filter === cat
                  ? "bg-emerald-500 text-white shadow-sm scale-105"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              {cat === "all" ? "すべて" : `${CATEGORY_ICON[cat]} ${CATEGORY_LABEL[cat]}`}
            </button>
          ))}
        </div>

        {/* タスク追加フォーム */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          <div className="flex gap-2">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 transition cursor-pointer"
            >
              <option value="high">🔴 優先度: 高</option>
              <option value="medium">🟡 優先度: 中</option>
              <option value="low">🟢 優先度: 低</option>
            </select>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 transition cursor-pointer"
            >
              <option value="work">💼 仕事</option>
              <option value="private">🏠 プライベート</option>
              <option value="other">📌 その他</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={deadline}
              min={today}
              onChange={e => setDeadline(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
            <button
              onClick={addTodo}
              disabled={!text.trim()}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm"
            >
              追加
            </button>
          </div>
        </div>

        {/* タスクリスト */}
        <ul className="space-y-2">
          {sorted.length === 0 && (
            <li className="text-center text-slate-300 text-sm py-12">
              {filter === "all" ? "タスクを追加してみましょう" : "このカテゴリにタスクがありません"}
            </li>
          )}
          {sorted.map(todo => (
            <li
              key={todo.id}
              className={`bg-white rounded-xl px-4 py-3 shadow-sm border group transition-all duration-300 ${
                todo.completed ? "border-slate-100 opacity-60" : "border-emerald-100"
              } ${newId === todo.id ? "todo-enter" : ""} ${removingIds.has(todo.id) ? "todo-exit" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* チェックボタン */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    todo.completed
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-300 hover:border-emerald-400"
                  } ${poppingId === todo.id ? "check-pop" : ""}`}
                >
                  {todo.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm transition-all duration-300 ${
                    todo.completed ? "line-through text-slate-300" : "text-slate-700"
                  }`}>
                    {todo.text}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[todo.priority]}`}>
                      {PRIORITY_LABEL[todo.priority]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLOR[todo.category]}`}>
                      {CATEGORY_ICON[todo.category]} {CATEGORY_LABEL[todo.category]}
                    </span>
                    {todo.deadline && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isOverdue(todo.deadline) && !todo.completed
                          ? "text-red-500 bg-red-50 border border-red-200"
                          : "text-slate-400 bg-slate-100"
                      }`}>
                        📅 {todo.deadline}
                        {isOverdue(todo.deadline) && !todo.completed && "  期限切れ"}
                      </span>
                    )}
                  </div>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="削除"
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all mt-0.5 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
