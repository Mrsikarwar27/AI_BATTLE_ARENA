import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  Clock,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { groupConversations } from '@/lib/conversations'
import type { ConversationSummary } from '@/types'

interface ConversationSidebarProps {
  conversations: ConversationSummary[]
  activeId: string | null
  search: string
  onSearchChange: (v: string) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isAuthenticated: boolean
  onSelect: (id: string) => void
  onNewChat: () => void
  onRename: (id: string, title: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  renamingId: string | null
  deletingId: string | null
  mobileOpen: boolean
  onCloseMobile: () => void
}

function SidebarBody(props: ConversationSidebarProps) {
  const {
    conversations,
    activeId,
    search,
    onSearchChange,
    isLoading,
    isError,
    onRetry,
    isAuthenticated,
    onSelect,
    onNewChat,
    onRename,
    onDelete,
    renamingId,
    deletingId,
  } = props
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const startRename = (c: ConversationSummary) => {
    setConfirmDeleteId(null)
    setEditingId(c.id)
    setEditValue(c.title)
  }

  const commitRename = async (id: string) => {
    const v = editValue.trim()
    if (!v || v.length > 100) return
    const current = conversations.find((c) => c.id === id)
    if (current && current.title === v) {
      setEditingId(null)
      return
    }
    await onRename(id, v)
    setEditingId(null)
  }

  const groups = groupConversations(conversations)

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 pb-2">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-on-primary-fixed-variant"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {isAuthenticated && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant/40" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search history…"
              aria-label="Search conversations"
              className="w-full rounded-xl border border-border-subtle bg-surface-container-lowest py-2 pl-9 pr-8 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-on-surface-variant/50 hover:text-on-surface"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="smooth-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {!isAuthenticated ? (
          <div className="rounded-xl border border-border-subtle bg-surface-container-lowest p-4 text-center">
            <MessageSquare className="mx-auto mb-2 h-5 w-5 text-on-surface-variant/50" />
            <p className="text-sm font-medium text-on-surface">History is private</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/70">
              Log in to save battles and revisit them later.
            </p>
            <Link
              to="/login"
              className="mt-3 inline-block rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-on-primary hover:bg-on-primary-fixed-variant"
            >
              Log in
            </Link>
          </div>
        ) : isLoading ? (
          <div className="space-y-2 p-1" role="status" aria-label="Loading conversations">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-surface-container-lowest p-3">
                <div className="h-3.5 w-3/4 rounded bg-surface-container" />
                <div className="mt-2 h-3 w-1/2 rounded bg-surface-container" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="rounded-xl border border-error/20 bg-error/10 p-4 text-center"
          >
            <AlertCircle className="mx-auto mb-2 h-5 w-5 text-error" />
            <p className="text-sm font-medium text-on-error-container">Couldn&apos;t load history</p>
            <p className="mt-1 text-xs text-on-error-container/70">Check your connection and try again.</p>
            <button
              onClick={onRetry}
              className="mt-3 rounded-lg border border-error/30 px-3.5 py-1.5 text-xs font-medium text-on-error-container hover:bg-error/10"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-default p-5 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-on-surface-variant/40" />
            <p className="text-sm font-medium text-on-surface">
              {search ? 'No matches' : 'No conversations yet'}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/60">
              {search
                ? 'Try a different search term.'
                : 'Start a new chat — your battles will appear here.'}
            </p>
          </div>
        ) : (
          groups.map(({ group, items }) => (
            <div key={group} className="mt-2 first:mt-0">
              <p className="px-2 pb-1 pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/50">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((c) => {
                  const isActive = c.id === activeId
                  const isEditing = editingId === c.id
                  const isConfirming = confirmDeleteId === c.id
                  return (
                    <li key={c.id}>
                      <div
                        className={cn(
                          'group rounded-xl border px-2.5 py-2 transition-colors',
                          isActive
                            ? 'border-primary/25 bg-primary/10'
                            : 'border-transparent hover:bg-surface-container'
                        )}
                      >
                        {isEditing ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              void commitRename(c.id)
                            }}
                            className="flex items-center gap-1"
                          >
                            <input
                              // eslint-disable-next-line jsx-a11y/no-autofocus
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              maxLength={100}
                              aria-label="Conversation title"
                              className="min-w-0 flex-1 rounded-lg border border-primary/30 bg-surface-container-lowest px-2 py-1 text-sm text-on-surface focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!editValue.trim() || renamingId === c.id}
                              aria-label="Save title"
                              className="rounded-lg p-1.5 text-text-positive hover:bg-text-positive/10 disabled:opacity-40"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              aria-label="Cancel rename"
                              className="rounded-lg p-1.5 text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        ) : isConfirming ? (
                          <div role="alertdialog" aria-label={`Delete ${c.title}?`} className="py-0.5">
                            <p className="truncate text-xs font-medium text-on-surface">
                              Delete “{c.title}”?
                            </p>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(null)
                                  void onDelete(c.id)
                                }}
                                disabled={deletingId === c.id}
                                className="rounded-lg bg-error px-2.5 py-1 text-xs font-medium text-on-error hover:opacity-90 disabled:opacity-50"
                              >
                                {deletingId === c.id ? 'Deleting…' : 'Delete'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-lg border border-border-default px-2.5 py-1 text-xs text-on-surface hover:bg-surface-container"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onSelect(c.id)}
                              title={c.title}
                              className="min-w-0 flex-1 truncate text-left text-sm text-on-surface"
                              aria-current={isActive ? 'true' : undefined}
                            >
                              {c.title}
                            </button>
                            <span className="flex shrink-0 items-center opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                              <button
                                onClick={() => startRename(c)}
                                aria-label={`Rename ${c.title}`}
                                className="rounded-lg p-1.5 text-on-surface-variant/50 hover:bg-surface-container-high hover:text-on-surface"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null)
                                  setConfirmDeleteId(c.id)
                                }}
                                aria-label={`Delete ${c.title}`}
                                className="rounded-lg p-1.5 text-on-surface-variant/50 hover:bg-error/10 hover:text-error"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function ConversationSidebar(props: ConversationSidebarProps) {
  const { mobileOpen, onCloseMobile } = props
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Chat history"
        className="sticky top-20 hidden h-[calc(100vh-6rem)] w-72 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm lg:block"
      >
        <SidebarBody {...props} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onCloseMobile}
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        <aside
          aria-label="Chat history"
          className={cn(
            'absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-surface shadow-elevation transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5">
            <span className="font-heading text-sm font-medium text-on-surface">History</span>
            <button
              onClick={onCloseMobile}
              aria-label="Close history"
              className="rounded-lg p-1.5 text-on-surface-variant/60 hover:bg-surface-container hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(100%-49px)]">
            <SidebarBody {...props} />
          </div>
        </aside>
      </div>
    </>
  )
}
