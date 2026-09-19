import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageContainer } from '@/components/layout/PageContainer'
import { Clock, Swords, Search, X, Trash2, AlertCircle, MessageSquare, ChevronRight } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'
import { useAuth } from '@/context/AuthContext'
import { useConversations, useDeleteConversation } from '@/hooks/useConversations'
import { groupConversations } from '@/lib/conversations'

export default function History() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const deleteConvo = useDeleteConversation()

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError, refetch } = useConversations(debounced)
  const conversations = data ?? []
  const groups = groupConversations(conversations)

  if (!authLoading && !isAuthenticated) {
    return (
      <PageContainer narrow>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center py-20">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-surface border border-border-subtle shadow-sm mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-on-surface-variant/60" />
          </div>
          <h2 className="font-heading text-xl font-medium text-on-surface mb-2">History is private</h2>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mx-auto leading-relaxed">
            Log in to see your saved battles. Your history is stored securely and never shared.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary hover:bg-on-primary-fixed-variant"
          >
            Log in
          </Link>
        </motion.div>
      </PageContainer>
    )
  }

  return (
    <PageContainer narrow>
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-surface border border-border-subtle shadow-sm mx-auto mb-4">
            <Clock className="h-7 w-7 text-on-surface-variant/60" />
          </div>
          <h1 className="font-heading text-2xl font-medium text-on-surface">Battle History</h1>
          <p className="mt-2 text-sm text-on-surface-variant/70">
            Your saved conversations, stored in MongoDB.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your history…"
            aria-label="Search conversations"
            className="w-full rounded-2xl border border-border-subtle bg-surface py-3 pl-10 pr-10 text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-on-surface-variant/50 hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLoading || authLoading ? (
          <div className="space-y-3" role="status" aria-label="Loading history">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border-subtle bg-surface p-5">
                <div className="h-4 w-2/3 rounded bg-surface-container" />
                <div className="mt-2 h-3 w-1/3 rounded bg-surface-container" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="rounded-2xl border border-error/20 bg-error/10 p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-6 w-6 text-error" />
            <p className="font-medium text-on-error-container">Couldn&apos;t load history</p>
            <p className="mt-1 text-sm text-on-error-container/70">Check your connection and try again.</p>
            <button
              onClick={() => void refetch()}
              className="mt-4 rounded-xl border border-error/30 px-4 py-2 text-sm font-medium text-on-error-container hover:bg-error/10"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-surface border border-border-subtle shadow-sm mx-auto mb-4">
              <Swords className="h-8 w-8 text-on-surface-variant/60" />
            </div>
            <h2 className="font-heading text-xl font-medium text-on-surface mb-2">
              {debounced ? 'No matches' : 'No battles yet'}
            </h2>
            <p className="text-sm text-on-surface-variant/70 max-w-sm mx-auto leading-relaxed">
              {debounced
                ? 'Try a different search term.'
                : 'Your previous battles will appear here. Start your first battle to see history.'}
            </p>
            {!debounced && (
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary hover:bg-on-primary-fixed-variant"
              >
                Start a battle
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ group, items }) => (
              <section key={group} aria-label={group}>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-on-surface-variant/50 mb-2">
                  {group}
                </p>
                <ul className="space-y-2">
                  {items.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm transition-colors hover:border-border-default"
                    >
                      {confirmId === c.id ? (
                        <div role="alertdialog" aria-label={`Delete ${c.title}?`}>
                          <p className="text-sm font-medium text-on-surface">
                            Delete “{c.title}”? This removes all its messages.
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => {
                                void deleteConvo.mutateAsync(c.id).then(() => setConfirmId(null))
                              }}
                              disabled={deleteConvo.isPending}
                              className="rounded-xl bg-error px-4 py-1.5 text-sm font-medium text-on-error hover:opacity-90 disabled:opacity-50"
                            >
                              {deleteConvo.isPending ? 'Deleting…' : 'Delete'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="rounded-xl border border-border-default px-4 py-1.5 text-sm text-on-surface hover:bg-surface-container"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/?c=${encodeURIComponent(c.id)}`)}
                            className="min-w-0 flex-1 text-left"
                            title={c.title}
                          >
                            <span className="block truncate text-sm font-medium text-on-surface">
                              {c.title}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-on-surface-variant/60">
                              {c.messageCount} messages · {new Date(c.updatedAt).toLocaleString()}
                              {c.preview ? ` · ${c.preview}` : ''}
                            </span>
                          </button>
                          <button
                            onClick={() => setConfirmId(c.id)}
                            aria-label={`Delete ${c.title}`}
                            className="rounded-lg p-2 text-on-surface-variant/50 hover:bg-error/10 hover:text-error"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/30" />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </motion.div>
    </PageContainer>
  )
}
